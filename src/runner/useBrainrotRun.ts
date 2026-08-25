// src/runner/useBrainrotRun.ts
//
// Owns the run state machine for every surface that executes Brainrot in
// the browser. Callers keep their own editor/stdin state and hand the
// source in at call time, so this hook stays independent of *where* the
// program came from — a playground example or a tour lesson.
//
// It deliberately owns the whole error taxonomy too. Callers get a
// `RunState` and never see `RuntimeLoadError`: collapsing "the runtime
// never came up" into "this program crashed" was a real bug once (it
// bricked the playground over a single wasm trap), and re-deriving that
// distinction at each call site is how it would come back.

import { useCallback, useRef, useState } from "react";
import { runBrainrot, RuntimeLoadError } from "../playground/runtime";
import type { RunResult } from "../playground/runtime";
import type { RunState } from "./runState";

export interface BrainrotRun {
  runState: RunState;
  isRunning: boolean;
  /** The runtime itself never loaded — nothing can run until reload. */
  isLoadFailed: boolean;
  /**
   * Resolves with the result the pane is showing, or null when there is
   * nothing to show it for: a run was already in flight, the runtime failed
   * to load, or this run was superseded by a newer one. Callers that only
   * want the output rendered can ignore it; a caller that has to *judge*
   * the result — checking an exercise — needs the result of the run it
   * asked for specifically, not whatever state happens to be current when
   * it next looks.
   */
  run: (source: string, stdin?: string) => Promise<RunResult | null>;
  /** Back to idle, discarding any in-flight run's result. */
  reset: () => void;
}

export function useBrainrotRun(): BrainrotRun {
  const [runState, setRunState] = useState<RunState>({ status: "idle" });

  // Guards a resolved/rejected promise from a previous run clobbering a
  // *newer* run's state — or a run the caller has already walked away from
  // (see reset() below).
  const runIdRef = useRef(0);
  // Synchronous single-flight gate. `isRunning` (React state) only flips
  // on the next render, so it can't stop a second run() call that happens
  // in the same tick — e.g. Cmd/Ctrl+Enter key-repeat via BrainrotEditor's
  // keymap, which doesn't know about the Run button's disabled state. This
  // ref is set the instant a run starts, before any state update or async
  // work, so a same-tick second call is rejected immediately instead of
  // launching a second worker.
  const inFlightRef = useRef(false);

  const isRunning = runState.status === "running";
  const isLoadFailed = runState.status === "loadFailed";

  const run = useCallback(
    (source: string, stdin: string = ""): Promise<RunResult | null> => {
      if (inFlightRef.current || isLoadFailed) return Promise.resolve(null);
      inFlightRef.current = true;
      const runId = ++runIdRef.current;
      setRunState({ status: "running" });
      return runBrainrot(source, stdin)
        .then((result) => {
          inFlightRef.current = false;
          if (runIdRef.current !== runId) return null;
          setRunState({ status: "result", result });
          return result;
        })
        .catch((error: unknown) => {
          inFlightRef.current = false;
          if (runIdRef.current !== runId) return null;
          const message = error instanceof Error ? error.message : String(error);
          if (error instanceof RuntimeLoadError) {
            // The runtime itself never loaded — nothing can run here right
            // now. Degrade the whole surface instead of pretending Run
            // still works.
            setRunState({ status: "loadFailed", message });
            return null;
          }
          // The module loaded fine; the *program* crashed after it started
          // running (a wasm trap, an unexpected abort). That's this run's
          // problem, not the playground's — show it like any other result
          // and leave the controls usable.
          const result: RunResult = { stdout: "", stderr: message, exitCode: -1, timedOut: false };
          setRunState({ status: "result", result });
          return result;
        });
    },
    [isLoadFailed],
  );

  const reset = useCallback(() => {
    // Bumping the run id is what makes this safe to call while a run is
    // still in flight: the pending promise resolves into a discarded id
    // rather than repainting output the caller has already moved past
    // (navigating between tour lessons, for instance). The in-flight gate
    // is deliberately *not* cleared — the worker is still executing, and
    // letting a second one start alongside it is not something reset()
    // should decide.
    runIdRef.current++;
    setRunState({ status: "idle" });
  }, []);

  return { runState, isRunning, isLoadFailed, run, reset };
}
