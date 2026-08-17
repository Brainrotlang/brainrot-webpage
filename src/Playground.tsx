// src/Playground.tsx
//
// #9: composes the editor (#8) and the runtime (#7) into an actual page
// section — "try the language before being asked to install a compiler."
// No router installed on this site yet (deferred to the tour epic), so
// this is a plain anchor-scrollable section like GetStarted.tsx, not a
// route.
//
// Importing runtime.ts here at the top level is fine for bundle size:
// the wasm binary itself is never part of any JS bundle (see
// wasmWorker.ts's dynamic import of brainrot.mjs), and the worker script
// that pulls runInModule.ts in is already its own lazily-fetched chunk
// via `new Worker(new URL(...))` in createWasmWorker.ts, regardless of
// when runtime.ts's own (tiny) orchestration code is imported.

import { useRef, useState } from "react";
import { Play, RotateCcw, Loader2, AlertTriangle, Clock } from "lucide-react";
import { BrainrotEditor } from "./playground/BrainrotEditor";
import { runBrainrot, RuntimeLoadError, type RunResult } from "./playground/runtime";
import { PLAYGROUND_EXAMPLES, DEFAULT_PLAYGROUND_EXAMPLE } from "./playground/examples";

type RunState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "result"; result: RunResult }
  | { status: "loadFailed"; message: string };

const STDIN_OPEN_STORAGE_KEY = "brainrot-playground-stdin-open";

/** sessionStorage access is wrapped in try/catch throughout — privacy
 * modes and some embedded/iframe contexts can throw on access, and a
 * remembered UI preference isn't worth a crash over. */
function readStdinOpenPreference(): boolean {
  try {
    return sessionStorage.getItem(STDIN_OPEN_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeStdinOpenPreference(open: boolean): void {
  try {
    sessionStorage.setItem(STDIN_OPEN_STORAGE_KEY, String(open));
  } catch {
    // Storage disabled — the toggle just won't persist. Not fatal.
  }
}

function Playground() {
  const [exampleId, setExampleId] = useState(DEFAULT_PLAYGROUND_EXAMPLE.id);
  const [source, setSource] = useState(DEFAULT_PLAYGROUND_EXAMPLE.source);
  const [stdin, setStdin] = useState(DEFAULT_PLAYGROUND_EXAMPLE.stdin);
  const [stdinOpen, setStdinOpen] = useState(readStdinOpenPreference);
  const [runState, setRunState] = useState<RunState>({ status: "idle" });

  // Guards a resolved/rejected promise from a previous run clobbering a
  // *newer* run's state.
  const runIdRef = useRef(0);
  // Synchronous single-flight gate. `isRunning` (React state) only flips
  // on the next render, so it can't stop a second runProgram() call that
  // happens in the same tick — e.g. Cmd/Ctrl+Enter key-repeat via
  // BrainrotEditor's keymap, which doesn't know about the Run button's
  // disabled state. This ref is set the instant a run starts, before any
  // state update or async work, so a same-tick second call is rejected
  // immediately instead of launching a second worker.
  const inFlightRef = useRef(false);

  const selectedExample = PLAYGROUND_EXAMPLES.find((e) => e.id === exampleId) ?? DEFAULT_PLAYGROUND_EXAMPLE;
  const isRunning = runState.status === "running";
  const isLoadFailed = runState.status === "loadFailed";

  const runProgram = () => {
    if (inFlightRef.current || isLoadFailed) return;
    inFlightRef.current = true;
    const runId = ++runIdRef.current;
    setRunState({ status: "running" });
    runBrainrot(source, stdin)
      .then((result) => {
        inFlightRef.current = false;
        if (runIdRef.current !== runId) return;
        setRunState({ status: "result", result });
      })
      .catch((error: unknown) => {
        inFlightRef.current = false;
        if (runIdRef.current !== runId) return;
        const message = error instanceof Error ? error.message : String(error);
        if (error instanceof RuntimeLoadError) {
          // The runtime itself never loaded — nothing can run here right
          // now. Degrade the whole section instead of pretending Run
          // still works.
          setRunState({ status: "loadFailed", message });
        } else {
          // The module loaded fine; the *program* crashed after it
          // started running (a wasm trap, an unexpected abort). That's
          // this run's problem, not the playground's — show it like any
          // other result and leave Run/Reset/examples usable.
          setRunState({
            status: "result",
            result: { stdout: "", stderr: message, exitCode: -1, timedOut: false },
          });
        }
      });
  };

  const resetProgram = () => {
    if (isRunning) return;
    setSource(selectedExample.source);
    setStdin(selectedExample.stdin);
    setRunState({ status: "idle" });
  };

  const changeExample = (id: string) => {
    if (isRunning) return;
    const example = PLAYGROUND_EXAMPLES.find((e) => e.id === id) ?? DEFAULT_PLAYGROUND_EXAMPLE;
    setExampleId(example.id);
    setSource(example.source);
    setStdin(example.stdin);
    setRunState({ status: "idle" });
  };

  const toggleStdinOpen = (open: boolean) => {
    setStdinOpen(open);
    writeStdinOpenPreference(open);
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
                  <OutputPane runState={runState} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={runProgram}
                  disabled={isRunning}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isRunning ? "Running…" : "Run"}
                </button>
                <button
                  type="button"
                  onClick={resetProgram}
                  disabled={isRunning}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed px-4 py-2 rounded-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>

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
              </div>

              <details
                className="mt-4"
                open={stdinOpen}
                onToggle={(e) => toggleStdinOpen(e.currentTarget.open)}
              >
                <summary className="cursor-pointer text-sm text-gray-300 select-none">stdin (optional)</summary>
                <label htmlFor="playground-stdin" className="sr-only">
                  Program stdin
                </label>
                <textarea
                  id="playground-stdin"
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  rows={3}
                  placeholder="Input fed to slorp() calls, one value per line…"
                  className="mt-2 w-full bg-gray-900 text-green-400 font-mono text-sm rounded-lg p-3"
                />
              </details>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OutputPane({ runState }: { runState: RunState }) {
  return (
    <div className="h-72 md:h-96 flex flex-col bg-gray-900 rounded-lg border border-gray-700">
      <div className="px-3 py-2 border-b border-gray-700 text-sm text-gray-400 flex items-center gap-2 shrink-0">
        Output
        {runState.status === "running" && <Loader2 className="w-3 h-3 animate-spin" />}
      </div>
      <div
        aria-live="polite"
        data-testid="playground-output"
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
