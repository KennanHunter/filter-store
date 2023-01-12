import { RefinementCtx, z } from "zod";
import create from "zustand";

type State<T extends z.ZodTypeAny> = {
  key: string;
  type: T;
  hidden: boolean;
  toChip?: (arg: z.infer<T>, ctx: RefinementCtx) => String | String[] | void;
};

type StateToObject<T extends State<z.ZodTypeAny>> = {
  [Name in T["key"]]: Omit<State<z.ZodTypeAny>, "key">;
};

type StateArray = State<z.ZodTypeAny>[];


export class FilterStore<T extends z.ZodTypeAny> {
  constructor(state: State<T>[]) {
    return this;
  }

  state: State<T>[] = [];

  addData<U extends z.ZodTypeAny>(options: State<U>) {
    this.state.push(options);

    return new FilterStore(this.state);
  }

  addSideEffect() {
    return new FilterStore(this.state);
  }

  build = () =>
    create<{}>()((set) => ({
      bears: 0,
    }));
}
