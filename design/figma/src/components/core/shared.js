/** Helpers shared by the core component files. */
import { variants } from "../../lib/components.js";
import { noFill, stroke } from "../../lib/tokens.js";

export const STATES = ["default", "hover", "focus", "disabled"];

/** Focus: a 2px `focus` outline outside the box (the code's :focus-visible ring). */
export function ring(node) {
  stroke(node, "focus", 2, "OUTSIDE");
  return node;
}

/** Text styles by Tailwind size and weight: text-sm / text-xs, regular / medium / semibold. */
export const STYLE = {
  sm: { reg: "App/Body", med: "App/Body Medium", semi: "App/Body Semibold" },
  xs: { reg: "App/Caption", med: "App/Caption Medium", semi: "App/Caption Semibold" },
};

/** Variant list from a table of prop sets: [{ variant: "a", state: "b" }, ...] with one builder. */
export function listOf(propSets, build) {
  return propSets.map((props) => ({ props, build: (c) => build(c, props) }));
}

/**
 * variants() plus an empty fill on the set: combineAsVariants() leaves a default fill on the set
 * in the mock, and a set should be transparent (only its dashed outline shows).
 */
export async function variantSet(name, list, o) {
  const set = await variants(name, list, o);
  noFill(set);
  return set;
}
