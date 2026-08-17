// src/playground/wasmWorker.ts
//
// Dedicated Worker entry point. Runs one Brainrot program per message and
// posts the result back. Deliberately does nothing else — no timeout logic
// here, that's runtime.ts's job on the main thread (a Worker can't
// interrupt its own synchronous wasm call from the inside; only the main
// thread calling .terminate() on it from the outside can).
//
// This file is loaded as a real Worker (`new Worker(new URL('./wasmWorker',
// import.meta.url))`), not imported normally — it runs in its own global
// scope, separate from window/DOM. Avoiding TypeScript's ambient
// `self`/`postMessage` typings here on purpose: this project's tsconfig
// pulls in the "dom" lib project-wide (for the rest of the app), and dom's
// and webworker's lib.d.ts both declare those globals with conflicting
// types in the same scope — a well-known pitfall of single-tsconfig CRA
// setups. Casting `self` to a narrow, local, correct-enough shape sidesteps
// that instead of fighting the lib composition.

import { runInModule, type BrainrotModuleOverrides, type RunResult } from "./runInModule";

export interface WorkerRequest {
  source: string;
  stdin: string;
  /** Base URL (with trailing slash) the wasm module and binary live under,
   * e.g. `${process.env.PUBLIC_URL}/wasm/`. Passed in by the caller rather
   * than hardcoded here, since PUBLIC_URL is only known on the main thread. */
  wasmBaseUrl: string;
  /** BRAINROT_WASM_VERSION (src/wasmVersion.json) — appended as a `?v=`
   * cache-buster to every wasm asset URL. public/wasm/brainrot.wasm and
   * brainrot.mjs keep the exact same filename across releases (CRA serves
   * public/ files unhashed), so without this a returning visitor's browser
   * can keep serving a stale cached interpreter after a version bump,
   * indefinitely, regardless of what the deployed pin says. */
  wasmVersion: string;
}

export type WorkerResponse =
  /** The wasm module has been fetched and instantiated; the program is
   * about to start executing. Lets the caller stop counting "still
   * downloading the interpreter" against the program's own execution
   * timeout budget. */
  | { type: "ready" }
  | ({ type: "result" } & RunResult)
  | { type: "error"; message: string };

interface WorkerGlobal {
  onmessage: ((ev: { data: WorkerRequest }) => void) | null;
  postMessage: (msg: WorkerResponse) => void;
}

// `self` is the correct (and only) global here: this file runs as a
// Worker's own global scope, not in a window. CRA's default lint config
// flags bare `self` because it's usually an accidental `window` alias in
// app code; that doesn't apply in a dedicated worker entry point.
// eslint-disable-next-line no-restricted-globals
const workerSelf = self as unknown as WorkerGlobal;

workerSelf.onmessage = (ev) => {
  const { source, stdin, wasmBaseUrl, wasmVersion } = ev.data;
  const cacheBust = `?v=${encodeURIComponent(wasmVersion)}`;

  (async () => {
    // Emscripten's ES6/MODULARIZE output resolves the .wasm binary
    // relative to the *worker script's own* location by default
    // (self.location.href) inside a Worker, not relative to wherever
    // brainrot.mjs itself was imported from — locateFile pins it to the
    // actual wasm/ directory explicitly so this doesn't silently break
    // depending on where webpack ends up serving this worker bundle from.
    const overrides: BrainrotModuleOverrides & { locateFile: (path: string) => string } = {
      locateFile: (path: string) => wasmBaseUrl + path + cacheBust,
    };

    const createBrainrotModule = (
      await import(/* webpackIgnore: true */ wasmBaseUrl + "brainrot.mjs" + cacheBust)
    ).default;

    const wrappedFactory = (o: BrainrotModuleOverrides) =>
      createBrainrotModule({ ...o, ...overrides });

    const result = await runInModule(wrappedFactory, source, stdin, () => {
      workerSelf.postMessage({ type: "ready" });
    });
    workerSelf.postMessage({ type: "result", ...result });
  })().catch((e: unknown) => {
    const message = e instanceof Error ? e.message : String(e);
    workerSelf.postMessage({ type: "error", message });
  });
};
