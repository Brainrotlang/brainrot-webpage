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

test("terminates the worker and resolves timedOut:true when the execution deadline passes", async () => {
  const { runBrainrot } = await importRuntime();

  const pending = runBrainrot("goon (W) { }", "", 20);
  await Promise.resolve();
  const worker = mockInstances[0];

  // Module loads fine; the program itself just never finishes — exactly
  // what an infinite `goon (W) {}` loop looks like from the caller's side.
  // Only after "ready" does the short 20ms execution budget start —
  // without this the 15s load budget would be what's counting down, and
  // this test would need to wait 15 real seconds to see anything happen.
  worker.onmessage?.({ data: { type: "ready" } } as MessageEvent<WorkerResponse>);

  const result = await pending;
  expect(result).toEqual({ stdout: "", stderr: "", exitCode: -1, timedOut: true });
  expect(worker.terminated).toBe(true);
});

test("a late worker response after the execution timeout does not resolve twice", async () => {
  const { runBrainrot } = await importRuntime();

  const pending = runBrainrot("goon (W) { }", "", 20);
  await Promise.resolve();
  const worker = mockInstances[0];
  worker.onmessage?.({ data: { type: "ready" } } as MessageEvent<WorkerResponse>);

  const result = await pending;
  expect(result.timedOut).toBe(true);

  // Simulate a stray message arriving after termination — must not throw
  // or change the already-settled result.
  expect(() =>
    worker.onmessage?.({
      data: { type: "result", stdout: "late\n", stderr: "", exitCode: 0 },
    } as MessageEvent<WorkerResponse>),
  ).not.toThrow();
});

test("rejects (not timedOut:true) if the wasm module never signals ready within the load budget", async () => {
  jest.useFakeTimers();
  try {
    const { runBrainrot } = await importRuntime();

    const pending = runBrainrot("skibidi main { }");
    await Promise.resolve();
    const worker = mockInstances[0];

    // Never send "ready" — simulates a hung/very slow fetch of
    // brainrot.mjs/brainrot.wasm, as opposed to a slow *program*. The
    // actual rejection is deferred one more macrotask past LOAD_TIMEOUT_MS
    // (see runtime.ts) to give an in-flight "ready" a chance to win a
    // near-deadline race, so it needs an extra tick advanced here too.
    jest.advanceTimersByTime(15000); // LOAD_TIMEOUT_MS
    jest.advanceTimersByTime(1); // the deferred re-check

    await expect(pending).rejects.toThrow(/timed out loading/i);
    expect(worker.terminated).toBe(true);
  } finally {
    jest.useRealTimers();
  }
});

test("a late ready after the promise has already settled does not schedule a new timer", async () => {
  const { runBrainrot } = await importRuntime();

  const pending = runBrainrot("skibidi main { }");
  await Promise.resolve();
  const worker = mockInstances[0];

  // Settle via an unrelated error path first — stands in for the
  // load-timeout race, which is timing-dependent and not practical to
  // force deterministically here; what matters for this test is just
  // "already settled" at the point "ready" arrives.
  worker.onmessage?.({
    data: { type: "error", message: "boom" },
  } as MessageEvent<WorkerResponse>);
  await expect(pending).rejects.toThrow("boom");
  expect(worker.terminated).toBe(true);

  // A "ready" arriving after settling must be a no-op: no throw, and
  // critically no fresh execution timer scheduled against an
  // already-terminated worker (which the earlier, unguarded version of
  // this handler did).
  const setTimeoutSpy = jest.spyOn(global, "setTimeout");
  expect(() =>
    worker.onmessage?.({ data: { type: "ready" } } as MessageEvent<WorkerResponse>),
  ).not.toThrow();
  expect(setTimeoutSpy).not.toHaveBeenCalled();
  setTimeoutSpy.mockRestore();
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
