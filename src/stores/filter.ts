import { z } from "zod";
import { newFilterStore } from "../lib";
import { restraintObject } from "../util/restraint";
import { convertRestraintToChip } from "../util/serializeRestraint";

export const useFilterStore = newFilterStore((item) => ({
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
      end: serializedForm.end ? Number.parseInt(serializedForm.end) : undefined,
    }),
  }),
}));
