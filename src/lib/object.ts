import { RefinementCtx, z } from "zod";

type State<T extends z.ZodTypeAny> = {
  key: string;
  type: T;
  hidden: boolean;
  toChip?: (arg: z.infer<T>, ctx: RefinementCtx) => String | String[] | void;
};

type FilterStoreObjectOptions = {};

export const FilterStoreObject = (options) => {};
