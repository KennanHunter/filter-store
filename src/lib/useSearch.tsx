import { z } from "zod";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import { restraintObject } from "../util/restraint";
import { convertRestraintToChip } from "../util/serializeRestraint";

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
  deserialize: val.deserialize ?? ((serializedForm) => serializedForm),
  serialize: val.serialize ?? ((raw) => raw as any),
});

export const newFilterStore = <FilterStoreType,>(
  filterStoreConfig: (generatorFunction: GeneratorFunction) => {
    [k in keyof FilterStoreType]: Property<
      FilterStoreType[k],
      z.Schema<FilterStoreType[k]>
    >;
  }
) => {
  const _config = filterStoreConfig(generatorFunction);
  const values = Object.entries(_config)
    .map(
      ([key, value]) => ({ ...(value as any), key } as UnknownPropertyWithKey)
    )
    .map(setDefaultValues);

  type State = {
    [k in keyof FilterStoreType]: z.infer<
      Property<FilterStoreType[k], z.Schema<FilterStoreType[k]>>["schema"]
    >;
  };
  type Key = keyof FilterStoreType extends string
    ? keyof FilterStoreType
    : never;

  const _keys: Key[] = values.map((val) => val.key) as any;
  const defaultState = Object.fromEntries(
    values.map((val) => [val.key, val.default])
  ) as State;

  return { _config, _keys, values, defaultState };
};

const filterStore = () =>
  newFilterStore((item) => ({
    simple: item(z.string())({
      default: "epic",
      hidden: false,
      deserialize: (arg) => arg,
      serialize: (arg) => arg,
    }),
    complex: item(restraintObject())({
      //          ^?
      default: {},
      toChip: (arg) => convertRestraintToChip(arg),
      //       ^?
      deserialize: (serializedForm) => ({
        start: serializedForm.start
          ? Number.parseInt(serializedForm.start)
          : undefined,
        end: serializedForm.end
          ? Number.parseInt(serializedForm.end)
          : undefined,
      }),
    }),
  }));

type State = ReturnType<typeof filterStore>["defaultState"];
type Setter = <TKey extends ReturnType<typeof filterStore>["_keys"][number]>(
  key: TKey
) => (newValue: State[TKey]) => void;

const SearchContext = createContext<{ state: State; set: Setter }>({} as any);

export const SearchProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { _config, _keys, values, defaultState } = filterStore();
  const [state, setState] = useState<State>(defaultState);

  const set: Setter = (key) => (newValue) => {
    const success = _config[key]["schema"].safeParse(newValue).success;
    console.log({ success });
    if (!success) return;
    setState({ ...state, [key]: newValue });
  };

  return (
    <SearchContext.Provider value={{ state, set }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
