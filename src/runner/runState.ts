// src/runner/runState.ts
//
// The states a Brainrot run can be observed in, shared by every surface
// that runs code (the homepage playground, tour lessons).
//
// A discriminated union rather than a set of booleans on purpose: "running
// while a stale result is still on screen" and "load failed but also idle"
// are not states this app has, and a caller should not be able to write
// them. `loadFailed` in particular is not a kind of `result` — it means
// nothing can run here at all, which is a different UI, not a different
// exit code (see runtime.ts's RuntimeLoadError).

import type { RunResult } from "../playground/runtime";

export type RunState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "result"; result: RunResult }
  | { status: "loadFailed"; message: string };
