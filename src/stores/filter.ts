import { z } from "zod";
import { newFilterStore } from "../lib";
import { restraintObject } from "../util/restraint";

newFilterStore((item) => ({
  simple: item(z.string())({
    default: "epic",
    hidden: false,
    deserialize: (arg) => arg,
    serialize: (arg) => arg,
  }),
  complex: item(restraintObject())({
    default: {},
  }),
})).getState().state;
