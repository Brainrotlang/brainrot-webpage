// src/playground/runtime.test.ts
//
// Tests runBrainrot()'s orchestration logic — timeout/terminate, message
// handling, error propagation — against a mocked createWasmWorker(). This
// is deliberately NOT a test of the wasm interop itself (that's verified
// for real, non-mocked, against the actual artifact by
// scripts/verify-wasm-runtime.mjs and, for the timeout/termination path
// specifically — the one thing a real Worker is needed to exercise
// honestly — by a manual real-browser check; see createWasmWorker.ts for
// why runtime.ts's Worker construction is isolated in its own module
// rather than inlined here).
//
// What's worth covering here under Jest is the promise/timer plumbing
// itself: does it actually call terminate() on timeout, does it resolve
// (not reject) with timedOut: true, does a worker error reject the
// promise, etc. Real short timeouts are used instead of fake timers to
// avoid Jest 27's fake-timer/promise interplay edge cases — a few tens of
// milliseconds of real wall-clock time per test is a fine trade for that.

import type { WorkerResponse } from "./wasmWorker";

interface MockWorkerInstance {
  onmessage: ((ev: MessageEvent<WorkerResponse>) => void) | null;
  onerror: ((ev: ErrorEvent) => void) | null;
  terminated: boolean;
  postedMessages: unknown[];
  postMessage: (msg: unknown) => void;
  terminate: () => void;
}

let mockInstances: MockWorkerInstance[] = [];

function mockCreateWasmWorker(): Worker {
  const instance: MockWorkerInstance = {
    onmessage: null,
    onerror: null,
    terminated: false,
    postedMessages: [],
    postMessage(msg: unknown) {
      instance.postedMessages.push(msg);
    },
    terminate() {
      instance.terminated = true;
    },
  };
  mockInstances.push(instance);
  return instance as unknown as Worker;
}

jest.mock("./createWasmWorker", () => ({
  createWasmWorker: () => mockCreateWasmWorker(),
}));

beforeEach(() => {
  mockInstances = [];
  jest.resetModules();
});

async function importRuntime() {
  return await import("./runtime");
}

test("resolves with the worker's result and terminates it", async () => {
  const { runBrainrot } = await importRuntime();

  const pending = runBrainrot('skibidi main { yapping("hi"); bussin 0; }');

  // let the microtask queue run so the worker + its onmessage handler exist
  await Promise.resolve();
  const worker = mockInstances[0];
  expect(worker).toBeDefined();

  worker.onmessage?.({
    data: { type: "result", stdout: "hi\n", stderr: "", exitCode: 0 },
  } as MessageEvent<WorkerResponse>);

  const result = await pending;
  expect(result).toEqual({ stdout: "hi\n", stderr: "", exitCode: 0, timedOut: false });
  expect(worker.terminated).toBe(true);
});

test("passes source/stdin through to the worker", async () => {
  const { runBrainrot } = await importRuntime();

  const pending = runBrainrot("rizz x;", "42\n");
  await Promise.resolve();
  const worker = mockInstances[0];

  expect(worker.postedMessages).toEqual([
    {
      source: "rizz x;",
      stdin: "42\n",
      wasmBaseUrl: expect.stringMatching(/\/wasm\/$/),
      wasmVersion: expect.any(String),
    },
  ]);

  worker.onmessage?.({
    data: { type: "result", stdout: "", stderr: "", exitCode: 0 },
  } as MessageEvent<WorkerResponse>);
  await pending;
});

test("terminates the worker and resolves timedOut:true when the deadline passes", async () => {
  const { runBrainrot } = await importRuntime();

  // Never respond — this is exactly what an infinite `goon (W) {}` loop
  // looks like from the caller's side: no message ever arrives.
  const result = await runBrainrot("goon (W) { }", "", 20);

  expect(result).toEqual({ stdout: "", stderr: "", exitCode: -1, timedOut: true });
  expect(mockInstances[0].terminated).toBe(true);
});

test("a late worker response after timeout does not resolve twice", async () => {
  const { runBrainrot } = await importRuntime();

  const result = await runBrainrot("goon (W) { }", "", 20);
  expect(result.timedOut).toBe(true);

  // Simulate a stray message arriving after termination — must not throw
  // or change the already-settled result.
  expect(() =>
    mockInstances[0].onmessage?.({
      data: { type: "result", stdout: "late\n", stderr: "", exitCode: 0 },
    } as MessageEvent<WorkerResponse>),
  ).not.toThrow();
});

test("rejects when the worker reports an error", async () => {
  const { runBrainrot } = await importRuntime();

  const pending = runBrainrot("skibidi main { }");
  await Promise.resolve();
  const worker = mockInstances[0];

  worker.onmessage?.({
    data: { type: "error", message: "failed to load brainrot.mjs" },
  } as MessageEvent<WorkerResponse>);

  await expect(pending).rejects.toThrow("failed to load brainrot.mjs");
  expect(worker.terminated).toBe(true);
});

test("rejects when the worker itself errors (e.g. failed to fetch the script)", async () => {
  const { runBrainrot } = await importRuntime();

  const pending = runBrainrot("skibidi main { }");
  await Promise.resolve();
  const worker = mockInstances[0];

  worker.onerror?.({ message: "script load failed" } as ErrorEvent);

  await expect(pending).rejects.toThrow("script load failed");
  expect(worker.terminated).toBe(true);
});

test("each call creates its own worker — no reuse across runs", async () => {
  const { runBrainrot } = await importRuntime();

  const first = runBrainrot("skibidi main { }");
  await Promise.resolve();
  mockInstances[0].onmessage?.({
    data: { type: "result", stdout: "1\n", stderr: "", exitCode: 0 },
  } as MessageEvent<WorkerResponse>);
  await first;

  const second = runBrainrot("skibidi main { }");
  await Promise.resolve();
  mockInstances[1].onmessage?.({
    data: { type: "result", stdout: "2\n", stderr: "", exitCode: 0 },
  } as MessageEvent<WorkerResponse>);
  await second;

  expect(mockInstances).toHaveLength(2);
  expect(mockInstances[0]).not.toBe(mockInstances[1]);
});
