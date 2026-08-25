// src/tour/programs/usingTheTour.js
//
// Programs for the "Using the Tour" chapter.
//
// CommonJS, and deliberately not TypeScript: these objects are read both by
// the app (through src/tour/content, where TypeScript checks their shape
// against src/tour/types.ts) and by scripts/verify-lessons.mjs under plain
// Node, which cannot run TypeScript. One copy of every program, no build
// step, no generated file to drift.
//
// Nothing here is annotated with JSDoc types on purpose: the inferred
// literal shape is what the TypeScript side checks against `DemoProgram` /
// `ExerciseProgram`, and declaring the type here would make that assignment
// vacuous.
//
// Every `expect` below was produced by running the program against the
// pinned wasm release, not by predicting what it should print.

const welcome = {
  starter: `skibidi main {
    yapping("Hello, World!");
    bussin 0;
}
`,
  expect: { stdout: "Hello, World!\n", exitCode: 0 },
};

const runningBrainrot = {
  starter: `skibidi main {
    yap name[32];

    yapping("who's asking?");
    slorp(name);

    yappin("certified W: ");
    yapping("%s", name);

    baka("this bit went to stderr\\n");

    bussin 0;
}
`,
  // slorp() on empty input is a hard error in Brainrot, not a zero, so a
  // lesson that reads stdin has to arrive with stdin already filled in.
  stdin: "Chad\n",
  expect: {
    stdout: "who's asking?\ncertified W: Chad\n",
    stderr: "this bit went to stderr\n",
    exitCode: 0,
  },
};

module.exports = { welcome, "running-brainrot": runningBrainrot };
