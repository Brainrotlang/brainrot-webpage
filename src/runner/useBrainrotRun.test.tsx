import { act, renderHook, waitFor } from "@testing-library/react";
import { useBrainrotRun } from "./useBrainrotRun";
import { runBrainrot, RuntimeLoadError } from "../playground/runtime";
import type { RunResult } from "../playground/runtime";

// Same reason Playground.test.tsx mocks this module rather than the layer
// below it: runtime.ts statically imports createWasmWorker.ts, whose
// `new Worker(new URL(..., import.meta.url))` CRA's Jest transform can't
// parse. This file is about promise/state plumbing, not wasm — the real
// runtime's own plumbing is runtime.test.ts's job, and real wasm is
// verify:wasm's.
jest.mock("../playground/runtime", () => ({
  runBrainrot: jest.fn(),
  RuntimeLoadError: class RuntimeLoadError extends Error {},
}));

const mockRunBrainrot = runBrainrot as jest.MockedFunction<typeof runBrainrot>;

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const ok: RunResult = { stdout: "hi\n", stderr: "", exitCode: 0, timedOut: false };

beforeEach(() => {
  mockRunBrainrot.mockReset();
});

test("a completed run carries the result through, stdin included", async () => {
  mockRunBrainrot.mockResolvedValue(ok);
  const { result } = renderHook(() => useBrainrotRun());

  act(() => result.current.run("skibidi main { }", "42\n"));

  await waitFor(() => expect(result.current.runState).toEqual({ status: "result", result: ok }));
  expect(mockRunBrainrot).toHaveBeenCalledWith("skibidi main { }", "42\n");
});

test("a second run in the same tick is refused, so one keypress can't spawn two workers", async () => {
  const { promise, resolve } = deferred<RunResult>();
  mockRunBrainrot.mockReturnValue(promise);
  const { result } = renderHook(() => useBrainrotRun());

  act(() => {
    result.current.run("a");
    result.current.run("b");
  });

  expect(mockRunBrainrot).toHaveBeenCalledTimes(1);
  expect(result.current.isRunning).toBe(true);

  await act(async () => {
    resolve(ok);
    await promise;
  });
});

test("reset() during a run discards that run's result instead of repainting later", async () => {
  const { promise, resolve } = deferred<RunResult>();
  mockRunBrainrot.mockReturnValue(promise);
  const { result } = renderHook(() => useBrainrotRun());

  act(() => result.current.run("slow program"));
  expect(result.current.isRunning).toBe(true);

  act(() => result.current.reset());
  expect(result.current.runState).toEqual({ status: "idle" });

  // The abandoned run finishes anyway — the point is that it lands
  // nowhere. A hook that only cleared state on reset (without discarding
  // the run) would flip back to "result" right here.
  await act(async () => {
    resolve(ok);
    await promise;
  });
  expect(result.current.runState).toEqual({ status: "idle" });
});

test("a RuntimeLoadError disables running entirely — it is not just another result", async () => {
  mockRunBrainrot.mockRejectedValue(new RuntimeLoadError("no runtime for you"));
  const { result } = renderHook(() => useBrainrotRun());

  act(() => result.current.run("anything"));

  await waitFor(() => expect(result.current.isLoadFailed).toBe(true));
  expect(result.current.runState).toEqual({ status: "loadFailed", message: "no runtime for you" });

  // Nothing can run here now, so a caller that still offers Run (or a
  // Cmd/Ctrl+Enter keymap that never knew) must not reach the runtime.
  mockRunBrainrot.mockClear();
  act(() => result.current.run("try again"));
  expect(mockRunBrainrot).not.toHaveBeenCalled();
});

test("a crash after the runtime loaded is shown as a failed run, leaving the surface usable", async () => {
  mockRunBrainrot.mockRejectedValue(new Error("unreachable executed"));
  const { result } = renderHook(() => useBrainrotRun());

  act(() => result.current.run("bad program"));

  await waitFor(() =>
    expect(result.current.runState).toEqual({
      status: "result",
      result: { stdout: "", stderr: "unreachable executed", exitCode: -1, timedOut: false },
    }),
  );
  expect(result.current.isLoadFailed).toBe(false);

  mockRunBrainrot.mockResolvedValue(ok);
  act(() => result.current.run("good program"));
  await waitFor(() => expect(result.current.runState).toEqual({ status: "result", result: ok }));
});

test("a non-Error rejection still produces a readable result rather than [object Object]", async () => {
  mockRunBrainrot.mockRejectedValue("worker died");
  const { result } = renderHook(() => useBrainrotRun());

  act(() => result.current.run("whatever"));

  await waitFor(() =>
    expect(result.current.runState).toEqual({
      status: "result",
      result: { stdout: "", stderr: "worker died", exitCode: -1, timedOut: false },
    }),
  );
});
