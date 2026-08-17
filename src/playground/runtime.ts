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

/** Fixed budget for fetching + instantiating the wasm module itself, before
 * the program starts executing — deliberately not part of `timeoutMs`
 * (which is a budget for the *program*, e.g. catching an infinite `goon
 * (W) {}` loop) and not caller-configurable, since load time is an
 * infrastructure concern, not something a playground user's code
 * controls. A slow network/cold cache burning through timeoutMs would
 * otherwise misreport a perfectly fine, finite program as timedOut:true,
 * and indistinguishably from an actually-hung download. */
const LOAD_TIMEOUT_MS = 15000;

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
    // Set synchronously the instant "ready" is processed — distinct from
    // `settled`, which only becomes true once the whole run finishes.
    // "ready" itself doesn't settle anything, it just starts the
    // execution timer, so the deferred load-timeout check below has to
    // ask "did the module become ready" rather than "is the run over" —
    // conflating the two was exactly the bug the last round of review
    // caught here.
    let loaded = false;
    let timer: ReturnType<typeof setTimeout>;

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

    // Phase 1: fetching + instantiating the wasm module. A hang here is an
    // infra failure (bad network, broken deploy), not the user's program
    // running long — reported as a rejection, not timedOut:true.
    //
    // The deadline fire and the worker's "ready" postMessage are both
    // ordinary macrotasks racing the same queue: on a load that lands
    // within a few milliseconds of LOAD_TIMEOUT_MS, the timer can win even
    // though "ready" was already in flight. Rather than reject the instant
    // the timer fires, requeue the check one more macrotask out — any
    // "ready" that was already queued at that point gets processed first
    // and sets `loaded`, so the deferred check below then finds it and
    // does nothing.
    timer = setTimeout(() => {
      setTimeout(() => {
        if (loaded || settled) return;
        fail(new Error(`Timed out loading the Brainrot runtime (no response after ${LOAD_TIMEOUT_MS}ms)`));
      }, 0);
    }, LOAD_TIMEOUT_MS);

    worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      const data = ev.data;

      if (data.type === "ready") {
        // Already settled (e.g. the load-timeout path above won the race
        // anyway) — the worker is terminated and this message is stale;
        // do not resurrect it with a fresh execution timer.
        if (settled) return;
        // Set before anything async-adjacent happens: this is exactly
        // what the deferred load-timeout check above is watching for.
        loaded = true;
        // Phase 2: the module is up: switch to the caller's execution
        // budget. Only now does an infinite `goon (W) {}` loop start
        // counting against timeoutMs.
        clearTimeout(timer);
        timer = setTimeout(() => {
          finish({ stdout: "", stderr: "", exitCode: -1, timedOut: true });
        }, timeoutMs);
        return;
      }

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
    const request: WorkerRequest = { source, stdin, wasmBaseUrl, wasmVersion: BRAINROT_WASM_VERSION };
    worker.postMessage(request);
  });
}
