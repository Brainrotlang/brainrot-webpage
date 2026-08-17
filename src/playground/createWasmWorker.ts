// src/playground/createWasmWorker.ts
//
// Isolated in its own file on purpose: `import.meta.url` (needed for
// webpack's native `new Worker(new URL(...))` pattern, which is what makes
// wasmWorker.ts its own lazily-loaded chunk instead of part of the main
// bundle) is valid in the real webpack build but can't be parsed by CRA's
// default Jest transform (babel targeting CommonJS for tests) — Jest fails
// at parse time, before any mocking could help. runtime.test.ts
// jest.mock()s this whole module instead of needing to load its real
// contents, so runtime.ts's own timer/message-handling logic stays
// testable without a real browser.
export function createWasmWorker(): Worker {
  return new Worker(new URL("./wasmWorker.ts", import.meta.url), {
    type: "module",
  });
}
