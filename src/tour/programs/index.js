// src/tour/programs/index.js
//
// Every tour program, grouped by chapter id and then lesson slug — the same
// two segments that form a lesson's URL and its id. Nested rather than
// flattened so that two chapters reusing a slug ("hello-world" under both
// basics and advanced, say) cannot silently overwrite each other.
//
// Imported by src/tour/content (where TypeScript checks the shapes) and by
// scripts/verify-lessons.mjs (which runs each one against the pinned wasm).

module.exports = {
  "using-the-tour": require("./usingTheTour"),
  basics: require("./basics"),
  "control-flow": require("./controlFlow"),
};
