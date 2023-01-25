import { restraintObject } from "./restraint";

interface serializeRestraintOptions {
  prefix?: string;
  postfix?: string;
  localize?: boolean;
}

export function serializeRestraint(
  restraint: restraintObject,
  options: serializeRestraintOptions = {}
): string | undefined {
  const { prefix, postfix } = options;

  const localize = (val: number) =>
    // localize default to true
    options.localize ?? true ? val.toLocaleString() : val;

  const s = (val: number): string =>
    `${prefix || ""}${localize(val)}${postfix || ""}`;

  if (restraint.start && restraint.end)
    return `${s(restraint.start)} - ${s(restraint.end)}`;
  else if (restraint.start) return `> ${s(restraint.start)}`;
  else if (restraint.end) return `< ${s(restraint.end)}`;
}
