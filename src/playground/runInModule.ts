// src/playground/runInModule.ts
//
// Runs one Brainrot program to completion in a fresh Emscripten module
// instance, and captures its stdout/stderr/exit code.
//
// Platform-agnostic on purpose: it takes the module factory as a parameter
// instead of importing brainrot.mjs directly, so the exact same logic runs
// inside the browser Worker (wasmWorker.ts, which fetches the real .wasm)
// and directly under Node (scripts/verify-wasm-runtime.mjs, for a fast,
// real, non-mocked check that the wasm interop itself is correct) without
// two parallel implementations to keep in sync.

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/** Minimal surface of the Emscripten FS API this module actually uses. */
interface EmscriptenFS {
  writeFile(path: string, data: string | Uint8Array): void;
}

/** Minimal surface of the instantiated brainrot.mjs module this module uses. */
interface BrainrotModule {
  FS: EmscriptenFS;
  callMain(args: string[]): number;
}

/** Overrides accepted by createBrainrotModule() — see brainrot.mjs's
 * MODULARIZE=1 output. `stdin` returns the next byte's char code, or null
 * at EOF, matching Emscripten's stdin device contract. */
export interface BrainrotModuleOverrides {
  print?: (text: string) => void;
  printErr?: (text: string) => void;
  stdin?: () => number | null;
  noInitialRun?: boolean;
}

export type CreateBrainrotModule = (
  overrides: BrainrotModuleOverrides,
) => Promise<BrainrotModule>;

/** Emscripten throws this (not a real Error) when the wasm program calls
 * exit() — e.g. via `ragequit`, or `bussin <n>` returning from main().
 * Anything else thrown is a genuine crash and should propagate. */
function isExitStatus(e: unknown): e is { status: number } {
  return (
    typeof e === "object" &&
    e !== null &&
    "status" in e &&
    typeof (e as { status: unknown }).status === "number"
  );
}

/**
 * Runs one Brainrot program in a fresh module instance.
 *
 * Always creates a fresh instance — the interpreter holds global state
 * (current_scope, arena allocations, stdrot's symbol cache) that isn't
 * designed to be re-entered, so reusing a module across runs is a
 * correctness bug, not just untidiness. Callers must pass a fresh
 * `createBrainrotModule` factory invocation per call; this function does
 * not cache or reuse anything across calls.
 */
export async function runInModule(
  createBrainrotModule: CreateBrainrotModule,
  source: string,
  stdin: string = "",
): Promise<RunResult> {
  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];
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
    if (isExitStatus(e)) {
      exitCode = e.status;
    } else {
      throw e;
    }
  }

  // Module.print/printErr are called once per completed line, with the
  // trailing newline already stripped — rejoin them the same way the
  // upstream brainrot repo's own wasm test harness does, so a program's
  // captured output matches what the native binary would have printed.
  return {
    stdout: stdoutChunks.join("\n") + (stdoutChunks.length ? "\n" : ""),
    stderr: stderrChunks.join("\n") + (stderrChunks.length ? "\n" : ""),
    exitCode,
  };
}
