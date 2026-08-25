// scripts/lib/run-one-program.mjs
//
// Runs a single Brainrot program and prints the result as one marked line.
// Exists to be a *separate process*: a program that never terminates — the
// tour teaches one on purpose — cannot be interrupted from inside the
// process it is blocking, so the only way to bound it is for a parent to
// kill it. verify-lessons.mjs is that parent.
//
// Usage: node scripts/lib/run-one-program.mjs <path-to-json-request>
//   request: { "source": "...", "stdin": "..." }

import { readFileSync } from "node:fs";
import { RESULT_MARKER, loadBrainrotFactory, requireWasmModulePath, runProgram } from "./brainrot-node.mjs";

const requestPath = process.argv[2];
if (!requestPath) {
  console.error("usage: node scripts/lib/run-one-program.mjs <path-to-json-request>");
  process.exit(2);
}

const { source, stdin = "" } = JSON.parse(readFileSync(requestPath, "utf8"));
const createBrainrotModule = await loadBrainrotFactory(requireWasmModulePath());

// A marked line rather than bare stdout: Emscripten can print diagnostics
// of its own on the way up, and a parser that assumed the whole stream was
// the payload would report those as the program's output.
try {
  const result = await runProgram(createBrainrotModule, source, stdin);
  process.stdout.write(`${RESULT_MARKER}${JSON.stringify(result)}\n`);
} catch (error) {
  // A trap escaping wasm (a stack overflow, an abort) is the program
  // failing, not this script failing — report it the way the browser does,
  // as a crashed run.
  const message = error instanceof Error ? error.message : String(error);
  process.stdout.write(`${RESULT_MARKER}${JSON.stringify({ stdout: "", stderr: message, exitCode: -1 })}\n`);
}
