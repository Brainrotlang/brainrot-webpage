// src/tour/TourLesson.tsx
//
// One lesson: prose, an editable program, the output, and a way onward.
//
// Everything that actually runs code comes from src/runner — this file
// contributes no execution logic of its own, which is the point. What it
// does own is lesson-shaped behaviour: which program is loaded, what Reset
// goes back to, when an exercise counts as solved, and what happens to
// progress when someone walks past one.

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, CircleSlash, ClipboardCheck, AlertTriangle } from "lucide-react";
import { BrainrotEditor } from "../playground/BrainrotEditor";
import { useBrainrotRun } from "../runner/useBrainrotRun";
import { OutputPane } from "../runner/OutputPane";
import { RunControls } from "../runner/RunControls";
import { StdinPanel } from "../runner/StdinPanel";
import { Snippet } from "./Snippet";
import { useLessonDraft } from "./drafts";
import { evaluateRun } from "./check";
import type { CheckOutcome } from "./check";
import { markCompleted, markSkipped, recordVisit } from "./progress";
import type { ResolvedLesson } from "./types";
import { runnableProgram } from "./types";

const STDIN_OPEN_STORAGE_KEY = "brainrot-tour-stdin-open";

interface TourLessonProps {
  resolved: ResolvedLesson;
  /** Called after progress changes so the sidebar re-reads it. */
  onProgressChange: () => void;
}

export function TourLesson({ resolved, onProgressChange }: TourLessonProps) {
  const { id, lesson, chapter, previous, next } = resolved;
  const program = runnableProgram(lesson);
  const isExercise = lesson.kind === "exercise";

  const { initial, save, discard } = useLessonDraft(id, {
    source: program?.starter ?? "",
    stdin: program?.stdin ?? "",
  });
  const [source, setSource] = useState(initial.source);
  const [stdin, setStdin] = useState(initial.stdin);
  const [checkOutcome, setCheckOutcome] = useState<CheckOutcome | null>(null);
  const { runState, isRunning, isLoadFailed, run, reset } = useBrainrotRun();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const updateSource = (value: string) => {
    setSource(value);
    save({ source: value, stdin });
  };

  const updateStdin = (value: string) => {
    setStdin(value);
    save({ source, stdin: value });
  };

  const runProgram = useCallback(() => {
    // A stale pass/fail verdict next to fresh output would be lying about
    // which program it judged.
    setCheckOutcome(null);
    void run(source, stdin);
  }, [run, source, stdin]);

  const resetProgram = () => {
    if (isRunning || !program) return;
    // Back to the lesson's own program — which means dropping the draft,
    // not just the editor contents, or navigating away and back would
    // resurrect the edits Reset was asked to throw away.
    discard();
    setSource(program.starter);
    setStdin(program.stdin ?? "");
    setCheckOutcome(null);
    reset();
  };

  const checkProgram = async () => {
    if (isRunning || lesson.kind !== "exercise") return;
    setCheckOutcome(null);
    const result = await run(source, stdin);
    if (!result) return; // refused, or the runtime never came up
    const outcome = evaluateRun(result, lesson.program.expect);
    setCheckOutcome(outcome);
    if (outcome.status === "passed") {
      markCompleted(id);
      onProgressChange();
    }
  };

  // Visiting is what makes "Continue" work; a lesson with nothing to solve
  // is complete once it has been read.
  useEffect(() => {
    if (isExercise) recordVisit(id);
    else markCompleted(id);
    onProgressChange();
  }, [id, isExercise, onProgressChange]);

  // A lesson change swaps the whole page under an unmoved cursor. Put focus
  // at the top of the new lesson so a keyboard or screen-reader visitor is
  // not left pointing at whatever the old page had there.
  useEffect(() => {
    headingRef.current?.focus();
  }, [id]);

  const navigate = useNavigate();
  const leaveForNext = useCallback(() => {
    // Skipping is allowed — but an exercise walked past unsolved is not
    // "done", and the sidebar says so.
    if (isExercise && checkOutcome?.status !== "passed") {
      markSkipped(id);
      onProgressChange();
    }
  }, [checkOutcome, id, isExercise, onProgressChange]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "PageDown" && event.key !== "PageUp") return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      // Inside the editor these keys are the editor's: paging through a
      // program is not a request to leave the lesson.
      if (event.target instanceof Element && event.target.closest(".cm-editor")) return;
      const target = event.key === "PageDown" ? next : previous;
      if (!target) return;
      event.preventDefault();
      if (event.key === "PageDown") leaveForNext();
      navigate(`/tour/${target}`);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [leaveForNext, navigate, next, previous]);

  return (
    <article className="min-w-0 flex-1">
      <p className="text-xs uppercase tracking-wide text-gray-500">{chapter.title}</p>
      <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold mb-4 outline-none">
        {lesson.title}
      </h1>

      <div className="space-y-3 text-gray-300 leading-relaxed [&_code]:text-purple-300 [&_code]:font-mono">
        <lesson.Body />
      </div>

      {lesson.kind === "reference" && (
        <section className="mt-6">
          {lesson.snippets.map((snippet) => (
            <Snippet key={snippet}>{snippet}</Snippet>
          ))}
          <p className="flex items-start gap-2 text-sm text-amber-300 bg-amber-950/30 border border-amber-900 rounded-lg p-3">
            <CircleSlash className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Nothing to run here: {lesson.notRunnableReason}</span>
          </p>
        </section>
      )}

      {program && (
        <section className="mt-6" aria-label="Lesson program">
          {isLoadFailed ? (
            <p className="flex items-start gap-2 text-sm text-red-300 bg-red-950/30 border border-red-900 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                The Brainrot runtime wouldn't load, so this lesson can't run code right now. The explanation
                above still holds — and installing Brainrot locally gets you the same interpreter.
              </span>
            </p>
          ) : (
            <>
              <BrainrotEditor
                value={source}
                onChange={updateSource}
                onRun={runProgram}
                ariaLabel={`Brainrot code editor for ${lesson.title}`}
                className="h-64 overflow-hidden [&_.cm-editor]:h-full"
              />

              <RunControls onRun={runProgram} onReset={resetProgram} isRunning={isRunning}>
                {lesson.kind === "exercise" && (
                  <button
                    type="button"
                    onClick={checkProgram}
                    disabled={isRunning}
                    className="flex items-center gap-2 bg-green-700 hover:bg-green-600 disabled:bg-green-900 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Check
                  </button>
                )}
              </RunControls>

              <StdinPanel
                id={`tour-stdin-${id.replace("/", "-")}`}
                storageKey={STDIN_OPEN_STORAGE_KEY}
                value={stdin}
                onChange={updateStdin}
                defaultOpen={program.stdin !== undefined}
              />

              {checkOutcome && <CheckVerdict outcome={checkOutcome} />}

              {/* Solving the last exercise in the manifest is what finishing
                  the tour means — there is nothing after it to navigate to. */}
              {checkOutcome?.status === "passed" && isExercise && !next && <TourComplete />}

              <div className="mt-4">
                <OutputPane runState={runState} testId="tour-output" className="h-48" />
              </div>
            </>
          )}
        </section>
      )}

      <nav aria-label="Lesson navigation" className="flex items-center justify-between gap-4 mt-10">
        {previous ? (
          <Link to={`/tour/${previous}`} className="text-purple-400 hover:text-purple-300">
            ← Previous
          </Link>
        ) : (
          <Link to="/tour" className="text-purple-400 hover:text-purple-300">
            ← Tour overview
          </Link>
        )}
        {next ? (
          <Link
            to={`/tour/${next}`}
            onClick={leaveForNext}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold"
          >
            Next →
          </Link>
        ) : (
          <span className="text-sm text-gray-500">Last lesson so far — more chapters are on the way.</span>
        )}
      </nav>
    </article>
  );
}

function TourComplete() {
  return (
    <section
      aria-labelledby="tour-complete-heading"
      className="mt-4 p-5 bg-purple-950/40 border border-purple-700 rounded-lg"
    >
      <h2 id="tour-complete-heading" className="text-2xl font-bold mb-2">
        Congratulations. Your brain is now fully rotten. 🧠
      </h2>
      <p className="text-gray-300 mb-4">
        That was the last one. You can read Brainrot, write it, and — more usefully than the tour can teach —
        you know which parts of it lie to you.
      </p>
      <ul className="space-y-2 text-sm">
        <li>
          <Link to="/#playground" className="text-purple-400 hover:text-purple-300 underline">
            Open the playground
          </Link>{" "}
          — a blank editor and no lesson plan.
        </li>
        <li>
          <a
            href="https://github.com/Brainrotlang/brainrot/tree/main/docs"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Read the language reference
          </a>{" "}
          — exhaustive, and occasionally more optimistic than the interpreter.
        </li>
        <li>
          <a
            href="https://github.com/Brainrotlang/brainrot"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Brainrot on GitHub
          </a>{" "}
          — where the limitations this tour listed get fixed.
        </li>
        <li>
          <a href="https://discord.gg/FjHhvBHSGj" className="text-purple-400 hover:text-purple-300 underline">
            Join the Discord
          </a>{" "}
          — for support, in both senses.
        </li>
      </ul>
    </section>
  );
}

function CheckVerdict({ outcome }: { outcome: CheckOutcome }) {
  if (outcome.status === "passed") {
    return (
      <p
        role="status"
        className="flex items-start gap-2 mt-4 text-sm text-green-300 bg-green-950/30 border border-green-900 rounded-lg p-3"
      >
        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
        <span>Correct. Exercise solved — certified W.</span>
      </p>
    );
  }

  return (
    <div
      role="status"
      className="mt-4 text-sm text-amber-200 bg-amber-950/30 border border-amber-900 rounded-lg p-3"
    >
      <p className="flex items-start gap-2 font-semibold">
        <CircleSlash className="w-4 h-4 mt-0.5 shrink-0" />
        Not there yet.
      </p>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        {outcome.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}
