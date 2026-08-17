// src/playground/runtime.ts
//
// Public API for running a Brainrot program in the browser. No React here
// on purpose — framework-agnostic, testable on its own, reusable by a
// future guided-tour feature.
//
// Every run gets a brand new Worker (and therefore a brand new wasm module
// instance inside it) — see wasmWorker.ts / runInModule.ts for why reuse
// would be a correctness bug, not just untidiness. This file's own job is
// narrower: own the timeout watchdog, since only the main thread can
// terminate() a Worker from the outside — a synchronous wasm call
// (an infinite `goon (W) { }` loop, for instance) cannot be interrupted
// from inside itself.

import type { WorkerRequest, WorkerResponse } from "./wasmWorker";
import { createWasmWorker } from "./createWasmWorker";
import wasmVersionInfo from "../wasmVersion.json";

export interface RunResult {
  stdout: string;
  stderr: string;
  /** Exit code from the Brainrot program. -1 when timedOut is true — there
   * is no real exit code because the program never finished. */
  exitCode: number;
  timedOut: boolean;
}

const DEFAULT_TIMEOUT_MS = 5000;

/** The Brainrotlang/brainrot release this playground is pinned to. Read
 * from src/wasmVersion.json — the single place this version lives, also
 * read by scripts/fetch-wasm.mjs at build time (a plain Node script can't
 * import from src/ the way this file does, so it re-reads the same file
 * from disk instead of duplicating the version number here). */
export const BRAINROT_WASM_VERSION = wasmVersionInfo.version;

/**
 * Runs a Brainrot program in a Web Worker and resolves with its output.
 *
 * @param source Brainrot source code.
 * @param stdin Text piped to the program's stdin (for `slorp`).
 * @param timeoutMs Wall-clock budget before the run is forcibly terminated.
 */
export function runBrainrot(
  source: string,
  stdin: string = "",
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const worker = createWasmWorker();

    let settled = false;

    const finish = (result: RunResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(result);
    };

    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      reject(error);
    };

    const timer = setTimeout(() => {
      finish({ stdout: "", stderr: "", exitCode: -1, timedOut: true });
    }, timeoutMs);

    worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      const data = ev.data;
      if (data.type === "error") {
        fail(new Error(data.message));
        return;
      }
      finish({ stdout: data.stdout, stderr: data.stderr, exitCode: data.exitCode, timedOut: false });
    };

    worker.onerror = (ev: ErrorEvent) => {
      fail(new Error(ev.message || "Worker error"));
    };

    const wasmBaseUrl = `${process.env.PUBLIC_URL}/wasm/`;
    const request: WorkerRequest = { source, stdin, wasmBaseUrl };
    worker.postMessage(request);
  });
}
