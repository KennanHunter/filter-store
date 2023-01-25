import { RefinementCtx, z, ZodTypeAny } from "zod";

type Property<TSchema extends ZodTypeAny> = PropertyBehaviors<TSchema> & {
  // ^?
  schema: TSchema;
};

type DefinedPrimitive = string | number | boolean | null;
type Stringify<T> = T extends DefinedPrimitive
  ? string
  : {
      [K in keyof T]: T[K] extends (infer U)[]
        ? Stringify<U>[]
        : Stringify<T[K]>;
    };

export type PropertyBehaviors<T extends z.ZodTypeAny> = {
  default?: z.infer<T>;
  hidden: boolean;
  toChip?: (arg: z.infer<T>, ctx: RefinementCtx) => String | String[] | void;
  deserialize: (
    serializedForm: Stringify<z.infer<T>>,
    ctx: RefinementCtx
  ) => z.infer<T>;
};

const GenerateProperty =
  <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
  (options: PropertyBehaviors<TSchema>): Property<TSchema> => ({
    schema,
    ...options,
  });

type CreateFilterStoreState = { [k: string]: Property<z.ZodUnknown> };

export const createFilterStore = <T extends CreateFilterStoreState>(
  createFilterStoreState: (generateProperty: typeof GenerateProperty) => T
): ((func: (state: T) => string) => string) => {
  const filterStoreState = createFilterStoreState(GenerateProperty);
  const filterStoreStateEntries = Object.entries(filterStoreState);

  const defaultState = filterStoreStateEntries.forEach(
    ([key, value]) => value.default
  );

  return (func) => func(filterStoreState);
};
