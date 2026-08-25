// src/runner/RunControls.tsx
//
// The Run/Reset pair every runnable surface needs, plus a slot for the
// controls only one of them needs (the playground's examples dropdown, a
// tour exercise's Check button) so those stay in the same row without this
// component having to know about them.

import type { ReactNode } from "react";
import { Play, RotateCcw, Loader2 } from "lucide-react";

export interface RunControlsProps {
  onRun: () => void;
  onReset: () => void;
  isRunning: boolean;
  children?: ReactNode;
}

export function RunControls({ onRun, onReset, isRunning, children }: RunControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mt-4">
      <button
        type="button"
        onClick={onRun}
        disabled={isRunning}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold"
      >
        {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        {isRunning ? "Running…" : "Run"}
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={isRunning}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed px-4 py-2 rounded-lg"
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </button>
      {children}
    </div>
  );
}
