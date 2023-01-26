import qs from "qs";
import { z } from "zod";
import create from "zustand";

export type DefinedPrimitive = string | number | boolean | null;

/**
 * Recursively stringify type, keeping object shape and optional properties
 */
export type StringifyPrimitives<T> = T extends DefinedPrimitive
  ? string
  : {
      [K in keyof T]: T[K] extends (infer U)[]
        ? StringifyPrimitives<U>[]
        : StringifyPrimitives<T[K]>;
    };

export type PropertyBehaviors<T> = {
  default?: T;
  hidden?: boolean;
  toChip?: (arg: T) => String | String[] | void;
  deserialize?: (serializedForm: StringifyPrimitives<T>) => T;
  serialize?: (serializedForm: T) => StringifyPrimitives<T>;
};

/**
 * Final datatype for all of our properties
 */
type Property<T, ZodSchema extends z.Schema<T>> = PropertyBehaviors<T> & {
  schema: ZodSchema;
};
type PropertyWithKey<T, ZodSchema extends z.Schema<T>> = Property<
  T,
  ZodSchema
> & {
  key: string;
};
type UnknownPropertyWithKey = PropertyWithKey<unknown, z.Schema<unknown>>;

/**
 * Provides typing to all of our Property Behaviors
 */
type GeneratorFunction = <TypeSchema>(
  schema: z.Schema<TypeSchema>
) => (
  behaviors: PropertyBehaviors<TypeSchema>
) => Property<TypeSchema, z.Schema<TypeSchema>>;

const generatorFunction: GeneratorFunction = (schema) => (behaviors) => ({
  schema,
  ...behaviors,
});

/**
 * Redefines object with values user didn't provide
 * @param val
 * @returns
 */
const setDefaultValues = (
  val: UnknownPropertyWithKey
): Required<UnknownPropertyWithKey> => ({
  ...val,
  default: val.default ?? undefined,
  hidden: val.hidden ?? true,
  toChip:
    val.toChip ??
    ((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))),
  deserialize: (serializedForm) => qs.parse(serializedForm),
  serialize: (raw) => raw as any,
});

export const newFilterStore = <T>(
  filterStoreConfig: (generatorFunction: GeneratorFunction) => {
    [k in keyof T]: Property<T[k], z.Schema<T[k]>>;
  }
) => {
  const _config = filterStoreConfig(generatorFunction);
  const values = Object.entries(_config)
    .map(
      ([key, value]) => ({ ...(value as any), key } as UnknownPropertyWithKey)
    )
    .map(setDefaultValues);

  type State = {
    [k in keyof T]: z.infer<Property<T[k], z.Schema<T[k]>>["schema"]>;
  };
  type Key = keyof T extends string ? keyof T : never;

  const _keys: Key[] = values.map((val) => val.key) as any;
  const defaultState = Object.fromEntries(
    values.map((val) => [val.key, val.default])
  ) as State;

  return create<{
    _config: typeof _config;
    _keys: Key[];
    deserialize: (serializedString: string) => void;
    state: State;
  }>()((set) => ({
    _config,
    _keys,
    state: defaultState,
    deserialize: (serializedString: string) => {
      const deserializedByQueryString = qs.parse(serializedString);

      for (const i in deserializedByQueryString) {
        const deserializedByQueryStringValue = deserializedByQueryString[i];
        if (!deserializedByQueryStringValue) continue;

        const deserializedForm = values
          .find((val) => val.key === i)
          ?.deserialize(deserializedByQueryStringValue);

        // @ts-ignore
        set({ state: { [i]: deserializedForm } });
      }
    },
  }));
};
