import { z } from "zod";
import { FilterStore } from "../lib";
import { restraintObject } from "../restraint";
import { serializeRestraint } from "../util/serializeRestraint";

export const useFilterStore = () =>
  new FilterStore()
    .addData({
      key: "search",
      type: z.string(),
      hidden: false,
      toChip: (arg, ctx) => `"${arg}"`,
    })
    .addData({
      key: "price",
      type: restraintObject(),
      hidden: false,
      toChip: (arg, ctx) => serializeRestraint(arg),
    })
    .build();
