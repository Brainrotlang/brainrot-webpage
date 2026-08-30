// src/tour/limitations.ts
//
// The list behind the tour's "Current limitations" lesson.
//
// Each entry duplicates the wording of a claim in
// src/tour/programs/claims.js, and that duplication is deliberate: the
// claims file carries whole programs and exists to be run by CI, so shipping
// it to the browser would put a few kilobytes of test fixtures in the bundle
// for the sake of one page. Instead the wording lives here, and
// content.test.ts asserts the two lists agree exactly — every claim marked
// `limitation: true` appears here, with the same text and the same lesson,
// and nothing appears here that is not backed by a claim.
//
// So this page cannot drift: a limitation that gets fixed upstream fails
// verification, and removing the claim without removing the entry fails the
// test.

export interface Limitation {
  /** Word-for-word the claim's own description. */
  text: string;
  /** The lesson that covers it, for the "explained in" link. */
  lesson: string;
}

export const LIMITATIONS: readonly Limitation[] = [
  {
    text: "there is no /* ... */ block comment form",
    lesson: "basics/comments",
  },
  {
    text: "`baka` takes a single string — passing format arguments does not parse",
    lesson: "basics/output",
  },
  {
    text: "`smol` stands alone — `smol rizz` is a syntax error",
    lesson: "basics/number-sizes",
  },
  {
    text: "`giga`, `thicc`, `nut` and `nonut` require the `rizz` and will not parse bare",
    lesson: "basics/number-sizes",
  },
  {
    text: "`maxxing` takes a value, not a type name",
    lesson: "basics/maxxing",
  },
  {
    text: "arrays cannot be passed to functions, so their length must be computed where they are declared",
    lesson: "basics/maxxing",
  },
  {
    text: "`grind` (continue) does not parse in any form",
    lesson: "control-flow/bruh",
  },
  {
    text: "a function defined after `skibidi main` does not parse — there are no forward declarations",
    lesson: "functions/defining",
  },
  {
    text: "a non-void function with no `bussin` silently yields 0 instead of failing",
    lesson: "functions/defining",
  },
  {
    text: "a variable declared outside a function does not parse — there are no globals",
    lesson: "functions/scope",
  },
  {
    text: "pointer arithmetic past the end of an array is not caught, unlike indexing",
    lesson: "pointers/arithmetic",
  },
  {
    text: "a `gang` cannot be defined inside a function",
    lesson: "your-own-types/gang",
  },
  {
    text: "a struct-typed pointer parameter cannot be written through, so there is no call by reference for structs",
    lesson: "your-own-types/with-functions",
  },
  {
    text: "`lit` declarations are rejected inside a function body",
    lesson: "your-own-types/lit",
  },
  {
    text: "`bussin` inside main sets no exit code and does not stop execution",
    lesson: "runtime/exit-codes",
  },
];
