// src/tour/types.ts
//
// The shape of tour content. Two properties drive every decision here:
//
//  1. Navigation, progress and CI verification are all *derived* from this
//     data, so adding a lesson must never mean touching routing or layout.
//  2. A lesson that claims to be an exercise but cannot be checked, or a
//     runnable lesson with nothing to run, should not compile. The unions
//     below are what make those unrepresentable rather than merely
//     discouraged.

import type { ReactElement } from "react";

/**
 * What a lesson's canonical program is supposed to do. Mirrors `RunResult`
 * on purpose — checking an exercise and verifying a lesson in CI are then
 * the same comparison, not two nearly-identical ones.
 *
 * Only the fields present are compared; `exitCode` is mandatory because
 * "expected output, forgot to say which exit code" is the mistake that
 * makes an exercise pass on a program that printed the right thing and then
 * crashed. Brainrot v0.1.5 really does exit 0 while reporting interpreter
 * errors on stderr, so stdout alone is not evidence of success.
 */
export interface Expectation {
  stdout?: string;
  stderr?: string;
  exitCode: number;
  /** For the deliberately non-terminating lesson: the run is expected to
   *  hit the watchdog rather than finish. */
  timedOut?: boolean;
}

/** A runnable program that only demonstrates something. */
export interface DemoProgram {
  starter: string;
  /** Pre-filled stdin. A lesson whose program calls `slorp()` must set
   *  this: on empty input the interpreter fails outright rather than
   *  reading a zero, so an unprimed stdin box turns a teaching moment into
   *  a confusing error. */
  stdin?: string;
  expect: Expectation;
}

/** A program the visitor has to finish. `solution` is required: an
 *  exercise nobody can verify is not an exercise. */
export interface ExerciseProgram extends DemoProgram {
  solution: string;
}

interface LessonBase {
  /** URL segment, and with the chapter id the lesson's stable identity. */
  slug: string;
  title: string;
  /** One line, shown on the tour landing page. */
  summary: string;
  Body: () => ReactElement;
}

/**
 * A lesson with code that cannot run in this browser runner — modules
 * spanning several files, host-dependent features. Stating the reason is
 * mandatory: a lesson showing code with no Run button and no explanation
 * reads as a broken page.
 */
export interface ReferenceLesson extends LessonBase {
  kind: "reference";
  notRunnableReason: string;
  snippets: readonly string[];
}

export interface DemoLesson extends LessonBase {
  kind: "demo";
  program: DemoProgram;
}

export interface ExerciseLesson extends LessonBase {
  kind: "exercise";
  program: ExerciseProgram;
}

export type TourLesson = ReferenceLesson | DemoLesson | ExerciseLesson;

export interface TourChapter {
  id: string;
  title: string;
  lessons: readonly TourLesson[];
}

/** A lesson plus everything derivable from its position in the manifest. */
export interface ResolvedLesson {
  /** `"<chapterId>/<slug>"` — the URL path, the manifest key and the
   *  progress key are one string, so they cannot drift apart. */
  id: string;
  lesson: TourLesson;
  chapter: TourChapter;
  previous: string | null;
  next: string | null;
}

export function lessonId(chapterId: string, slug: string): string {
  return `${chapterId}/${slug}`;
}

/** Narrowing helper: reference lessons have no program to run. */
export function runnableProgram(lesson: TourLesson): DemoProgram | null {
  return lesson.kind === "reference" ? null : lesson.program;
}
