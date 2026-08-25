// src/runner/OutputPane.tsx
//
// Renders a RunState: stdout, stderr, exit code, the timeout explanation,
// and the pre-first-run hint. Shared by the playground and the tour so
// "what a broken Brainrot program looks like" is one answer, not two.

import { Loader2, AlertTriangle, Clock } from "lucide-react";
import type { RunResult } from "../playground/runtime";
import type { RunState } from "./runState";

export interface OutputPaneProps {
  runState: RunState;
  /** Test hook for the live region. Required rather than defaulted: each
   *  surface has its own output pane, and a shared default would make two
   *  of them indistinguishable the first time both are on one page. */
  testId: string;
  /** Sizing for the pane; the rest of its appearance is fixed. */
  className?: string;
}

export function OutputPane({ runState, testId, className = "h-72 md:h-96" }: OutputPaneProps) {
  return (
    <div className={`${className} flex flex-col bg-gray-900 rounded-lg border border-gray-700`}>
      <div className="px-3 py-2 border-b border-gray-700 text-sm text-gray-400 flex items-center gap-2 shrink-0">
        Output
        {runState.status === "running" && <Loader2 className="w-3 h-3 animate-spin" />}
      </div>
      <div
        aria-live="polite"
        data-testid={testId}
        className="flex-1 overflow-auto p-3 font-mono text-sm whitespace-pre-wrap break-words"
      >

        {runState.status === "idle" && (
          <p className="text-gray-500">Hit Run (or Cmd/Ctrl+Enter) to see what happens.</p>
        )}
        {runState.status === "running" && <p className="text-gray-500">Running…</p>}
        {runState.status === "result" && <RunResultView result={runState.result} />}
      </div>
    </div>
  );
}

function RunResultView({ result }: { result: RunResult }) {
  if (result.timedOut) {
    return (
      <div className="text-amber-400 flex items-start gap-2">
        <Clock className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          Took too long and got cut off — smells like an infinite loop (a <code>goon</code> that never stops?).
          Double check your loop conditions.
        </span>
      </div>
    );
  }

  return (
    <div>
      {result.stdout && <pre className="text-gray-200 whitespace-pre-wrap break-words">{result.stdout}</pre>}
      {result.stderr && (
        <div className="mt-2 text-red-400">
          <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-red-500 mb-1">
            <AlertTriangle className="w-3 h-3" />
            stderr
          </div>
          <pre className="whitespace-pre-wrap break-words">{result.stderr}</pre>
        </div>
      )}
      {!result.stdout && !result.stderr && <p className="text-gray-500">(no output)</p>}
      <p className="mt-2 text-xs text-gray-500">exit code: {result.exitCode}</p>
    </div>
  );
}
