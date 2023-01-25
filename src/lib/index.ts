import { z } from "zod";

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
  default: T | undefined;
  hidden?: boolean;
  toChip?: (arg: T, ctx: z.RefinementCtx) => String | String[] | void;
  deserialize: (
    serializedForm: StringifyPrimitives<T>,
    ctx: z.RefinementCtx
  ) => T;
  serialize: (
    serializedForm: T,
    ctx: z.RefinementCtx
  ) => StringifyPrimitives<T>;
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
});

export const newFilterStore = <T>(
  filterStoreConfig: (generatorFunction: GeneratorFunction) => {
    [k in keyof T]: PropertyBehaviors<T[k]>;
  }
) => {
  const _config = filterStoreConfig(generatorFunction);
  const values = Object.entries(_config)
    .map(
      ([key, value]) => ({ ...(value as any), key } as UnknownPropertyWithKey)
    )
    .map(setDefaultValues);

  return { _config };
};
