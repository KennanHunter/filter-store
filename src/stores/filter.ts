import { z } from "zod";
import { createFilterStore } from "../lib";
import { restraintObject } from "../restraint";
import { serializeRestraint } from "../util/serializeRestraint";

export const useFilterStore = createFilterStore((item) => ({
  //          ^?
  search: item(z.string())({
    hidden: false,
    toChip: (arg, ctx) => `"${arg}"`,
    //       ^?
    deserialize: (arg) => arg,
  }),
  price: item(restraintObject())({
    hidden: false,
    toChip: (arg, ctx) => serializeRestraint(arg),
    //       ^?
    deserialize: ({ start, end }) => ({
      //              ^?
      start: start ? Number.parseInt(start) : undefined,
      // ^?
      end: start ? Number.parseInt(start) : undefined,
    }),
  }),
}));
