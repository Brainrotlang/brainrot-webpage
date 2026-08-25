// scripts/verify-wasm-runtime.mjs
//
// Direct, real (not mocked) verification that the wasm interop actually
// works: loads public/wasm/brainrot.mjs in Node and runs small Brainrot
// programs through it, the same way src/playground/runInModule.ts does
// (MEMFS write + callMain, print/printErr capture, ExitStatus handling).
// That reimplementation lives in scripts/lib/brainrot-node.mjs, which
// explains why it is deliberately kept independent of the TypeScript one.
//
// Covers the behavioral acceptance criteria from
// https://github.com/Brainrotlang/brainrot-webpage/issues/7 that don't
// require the Worker/timeout layer (that one's covered by
// src/playground/runtime.test.ts with a mocked Worker instead, since a
// real infinite loop can't be interrupted from plain Node the way a
// browser Worker can be terminate()d).
//
// This script is about the *interop*. Whether the tour's lessons still
// teach programs this interpreter accepts is scripts/verify-lessons.mjs.
//
// Usage: node scripts/verify-wasm-runtime.mjs
//   (run from the repo root, after public/wasm/brainrot.mjs exists —
//   see scripts/fetch-wasm.mjs)

import { loadBrainrotFactory, requireWasmModulePath, runProgram } from "./lib/brainrot-node.mjs";

const createBrainrotModule = await loadBrainrotFactory(requireWasmModulePath());

const runInModule = (source, stdin = "") => runProgram(createBrainrotModule, source, stdin);

let failures = 0;

async function check(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    failures++;
    console.error(`✗ ${name}\n  ${e.message}`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

await check("hello world resolves with stdout and exit 0", async () => {
  const result = await runInModule('skibidi main {\n    yapping("hi");\n    bussin 0;\n}\n');
  assertEqual(result.stdout, "hi\n", "stdout");
  assertEqual(result.exitCode, 0, "exitCode");
});

await check("baka() output lands in stderr, not stdout", async () => {
  const result = await runInModule('skibidi main {\n    baka("oops\\n");\n    bussin 0;\n}\n');
  assertEqual(result.stdout, "", "stdout");
  assertEqual(result.stderr, "oops\n", "stderr");
});

await check("a program using slorp receives the supplied stdin", async () => {
  const result = await runInModule(
    'skibidi main {\n    rizz x;\n    slorp(x);\n    yapping("got %d", x);\n    bussin 0;\n}\n',
    "42\n",
  );
  assertEqual(result.stdout, "got 42\n", "stdout");
});

await check("ragequit(3) surfaces exitCode 3", async () => {
  const result = await runInModule("skibidi main {\n    ragequit(3);\n}\n");
  assertEqual(result.exitCode, 3, "exitCode");
});

await check("two consecutive runs are fully independent", async () => {
  const program = 'skibidi main {\n    rizz x = 1;\n    yapping("%d", x);\n    bussin 0;\n}\n';
  const first = await runInModule(program);
  const second = await runInModule(program);
  assertEqual(first.stdout, "1\n", "first run stdout");
  assertEqual(second.stdout, "1\n", "second run stdout");
});

await check("a parse error produces a message on stderr and non-zero exit, not a throw", async () => {
  const result = await runInModule('skibidi main {\n    yapping("unterminated"\n');
  assertEqual(result.stdout, "", "stdout");
  if (result.stderr.trim() === "") throw new Error("expected a non-empty stderr message");
  if (result.exitCode === 0) throw new Error("expected a non-zero exit code");
});

console.log(`\n${failures === 0 ? "All checks passed" : `${failures} check(s) failed`}`);
process.exit(failures > 0 ? 1 : 0);
