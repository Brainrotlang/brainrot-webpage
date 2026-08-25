// src/Playground.tsx
//
// #9: composes the editor (#8) and the runtime (#7) into an actual page
// section — "try the language before being asked to install a compiler."
//
// The parts that any surface running Brainrot needs — the run state
// machine, the output pane, Run/Reset, the stdin box — live in
// src/runner/ and are shared with the guided tour (#14). What stays here
// is what only the homepage has: the examples dropdown, the section
// heading, and the load-failure panel's "install it locally instead"
// escape hatch, which points at this page's own install section.
//
// Importing runtime.ts (transitively, via useBrainrotRun) here at the top
// level is fine for bundle size: the wasm binary itself is never part of
// any JS bundle (see wasmWorker.ts's dynamic import of brainrot.mjs), and
// the worker script that pulls runInModule.ts in is already its own
// lazily-fetched chunk via `new Worker(new URL(...))` in
// createWasmWorker.ts, regardless of when runtime.ts's own (tiny)
// orchestration code is imported.

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { BrainrotEditor } from "./playground/BrainrotEditor";
import { PLAYGROUND_EXAMPLES, DEFAULT_PLAYGROUND_EXAMPLE } from "./playground/examples";
import { useBrainrotRun } from "./runner/useBrainrotRun";
import { OutputPane } from "./runner/OutputPane";
import { RunControls } from "./runner/RunControls";
import { StdinPanel } from "./runner/StdinPanel";

const STDIN_OPEN_STORAGE_KEY = "brainrot-playground-stdin-open";

function Playground() {
  const [exampleId, setExampleId] = useState(DEFAULT_PLAYGROUND_EXAMPLE.id);
  const [source, setSource] = useState(DEFAULT_PLAYGROUND_EXAMPLE.source);
  const [stdin, setStdin] = useState(DEFAULT_PLAYGROUND_EXAMPLE.stdin);
  const { runState, isRunning, isLoadFailed, run, reset } = useBrainrotRun();

  const selectedExample = PLAYGROUND_EXAMPLES.find((e) => e.id === exampleId) ?? DEFAULT_PLAYGROUND_EXAMPLE;

  const runProgram = () => run(source, stdin);

  const resetProgram = () => {
    if (isRunning) return;
    setSource(selectedExample.source);
    setStdin(selectedExample.stdin);
    reset();
  };

  const changeExample = (id: string) => {
    if (isRunning) return;
    const example = PLAYGROUND_EXAMPLES.find((e) => e.id === id) ?? DEFAULT_PLAYGROUND_EXAMPLE;
    setExampleId(example.id);
    setSource(example.source);
    setStdin(example.stdin);
    reset();
  };

  return (
    <div id="playground">
      <div className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold mb-2 text-center">Run It Yourself, No Cap 🧠</h2>
        <p className="text-gray-300 text-center mb-8">
          Paste some Brainrot, hit run, see what happens. Zero installs, zero cap.
        </p>

        <div className="bg-gray-800 rounded-lg p-4 md:p-6">
          {isLoadFailed ? (
            <LoadFailedPanel source={source} message={runState.status === "loadFailed" ? runState.message : ""} />
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <BrainrotEditor
                    value={source}
                    onChange={setSource}
                    onRun={runProgram}
                    ariaLabel="Brainrot code editor"
                    className="h-72 md:h-96 overflow-hidden [&_.cm-editor]:h-full"
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <OutputPane runState={runState} testId="playground-output" />
                </div>
              </div>

              <RunControls onRun={runProgram} onReset={resetProgram} isRunning={isRunning}>
                <label htmlFor="playground-example-select" className="ml-auto text-sm text-gray-300">
                  Examples:
                </label>
                <select
                  id="playground-example-select"
                  value={exampleId}
                  onChange={(e) => changeExample(e.target.value)}
                  disabled={isRunning}
                  className="bg-gray-700 text-white rounded-lg px-3 py-2 disabled:cursor-not-allowed"
                >
                  {PLAYGROUND_EXAMPLES.map((example) => (
                    <option key={example.id} value={example.id}>
                      {example.label}
                    </option>
                  ))}
                </select>
              </RunControls>

              <StdinPanel
                id="playground-stdin"
                storageKey={STDIN_OPEN_STORAGE_KEY}
                value={stdin}
                onChange={setStdin}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadFailedPanel({ source, message }: { source: string; message: string }) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-1/2">
        <BrainrotEditor
          value={source}
          onChange={() => {}}
          ariaLabel="Brainrot code (read-only — the runtime failed to load)"
          readOnly
          className="h-72 md:h-96 overflow-hidden [&_.cm-editor]:h-full"
        />
      </div>
      <div className="w-full md:w-1/2 bg-gray-900 border border-red-900 rounded-lg p-4 flex flex-col justify-center">
        <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
          <AlertTriangle className="w-5 h-5" />
          Couldn't load the Brainrot runtime
        </div>
        <p className="text-gray-300 text-sm mb-3">
          Your browser (or network) wouldn't load the WASM interpreter, so running code in-page isn't happening
          right now. Skill issue on our end, not yours — install Brainrot locally instead:
        </p>
        <a href="#get-started-section" className="text-purple-400 hover:text-purple-300 underline text-sm">
          Jump to install instructions ↓
        </a>
        {message && <p className="mt-3 text-xs text-gray-500 break-words">{message}</p>}
      </div>
    </div>
  );
}

export default Playground;
