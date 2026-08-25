// scripts/lib/brainrot-node.mjs
//
// Running a Brainrot program through the real downloaded artifact under
// Node. Shared by scripts/verify-wasm-runtime.mjs (does the wasm interop
// work at all?) and scripts/verify-lessons.mjs (do the tour's programs
// still do what they claim?).
//
// This is deliberately a plain-JS reimplementation of
// src/playground/runInModule.ts rather than an import of it: Node in CI
// does not run TypeScript, and keeping the two implementations independent
// means a bug in one cannot hide inside the other. Sharing *between the two
// scripts* does not weaken that — they were the same code, and a third copy
// would only be a third thing to keep in sync.
//
// What it cannot do: interrupt a running program. A synchronous wasm call
// cannot be cancelled from inside the process it is blocking, which is why
// the browser runs it in a terminable Worker (src/playground/runtime.ts)
// and why verify-lessons.mjs runs each program in a killable child
// process.

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Prefix run-one-program.mjs puts on the line carrying its JSON result, so
 *  a parent can pick it out of a stream that may also contain Emscripten's
 *  own diagnostics. Defined here rather than in that script because
 *  importing the script would *run* it. */
export const RESULT_MARKER = "__BRAINROT_RESULT__";

/**
 * Path to the downloaded Emscripten loader, or a fatal error explaining how
 * to get one. Never downloads: a verification script that silently fetches
 * a different artifact than the one under test is worse than one that fails.
 */
export function requireWasmModulePath() {
  const wasmJsPath = path.join(repoRoot, "public", "wasm", "brainrot.mjs");
  if (!existsSync(wasmJsPath)) {
    console.error(`brainrot.mjs not found at ${wasmJsPath} — run "node scripts/fetch-wasm.mjs" first.`);
    process.exit(1);
  }
  return wasmJsPath;
}

export async function loadBrainrotFactory(wasmJsPath) {
  return (await import(wasmJsPath)).default;
}

function isExitStatus(e) {
  return e && typeof e === "object" && typeof e.status === "number";
}

/**
 * Runs one program in a brand new module instance. The instance is never
 * reused: the interpreter keeps global state (current_scope, arena
 * allocations, stdrot's symbol cache), so reuse is a correctness bug rather
 * than an optimisation left on the table.
 */
export async function runProgram(createBrainrotModule, source, stdin = "") {
  const stdoutChunks = [];
  const stderrChunks = [];
  let stdinPos = 0;

  const mod = await createBrainrotModule({
    print: (text) => stdoutChunks.push(text),
    printErr: (text) => stderrChunks.push(text),
    stdin: () => (stdinPos < stdin.length ? stdin.charCodeAt(stdinPos++) : null),
    noInitialRun: true,
  });

  mod.FS.writeFile("/prog.brainrot", source);

  let exitCode = 0;
  try {
    exitCode = mod.callMain(["/prog.brainrot"]);
  } catch (e) {
    if (!isExitStatus(e)) throw e;
    exitCode = e.status;
  }

  return {
    stdout: stdoutChunks.join("\n") + (stdoutChunks.length ? "\n" : ""),
    stderr: stderrChunks.join("\n") + (stderrChunks.length ? "\n" : ""),
    exitCode,
  };
}
