// src/tour/content/index.ts
//
// The manifest, and everything derived from it. Navigation order, previous/
// next, lesson lookup and the set of ids progress may legitimately contain
// all come from CHAPTERS — so adding a lesson is a content change and
// nothing else.

import type { ResolvedLesson, TourChapter } from "../types";
import { lessonId } from "../types";
import { usingTheTourChapter } from "./usingTheTour";
import { basicsChapter } from "./basics";
import { controlFlowChapter } from "./controlFlow";
import { functionsChapter } from "./functions";
import { arraysAndInputChapter } from "./arraysAndInput";
import { pointersChapter } from "./pointers";
import { userDefinedTypesChapter } from "./userDefinedTypes";
import { runtimeChapter } from "./runtime";
import { fileIoChapter } from "./fileIo";
import { advancedChapter } from "./advanced";
import { capstoneChapter } from "./capstone";

/** Curriculum order. This array *is* the tour's table of contents. */
export const CHAPTERS: readonly TourChapter[] = [
  usingTheTourChapter,
  basicsChapter,
  controlFlowChapter,
  functionsChapter,
  arraysAndInputChapter,
  pointersChapter,
  userDefinedTypesChapter,
  runtimeChapter,
  fileIoChapter,
  advancedChapter,
  capstoneChapter,
];

/**
 * Flattened once at module load. Everything else indexes into this, so
 * "the order in the sidebar" and "the order Next walks" cannot disagree —
 * they are the same array.
 */
const ORDERED: readonly ResolvedLesson[] = CHAPTERS.flatMap((chapter) =>
  chapter.lessons.map((lesson) => ({
    id: lessonId(chapter.id, lesson.slug),
    lesson,
    chapter,
    previous: null,
    next: null,
  })),
).map((entry, index, all) => ({
  ...entry,
  previous: index > 0 ? all[index - 1].id : null,
  next: index < all.length - 1 ? all[index + 1].id : null,
}));

const BY_ID = new Map(ORDERED.map((entry) => [entry.id, entry]));

export const LESSON_COUNT = ORDERED.length;

export const FIRST_LESSON_ID = ORDERED[0].id;

export function allLessons(): readonly ResolvedLesson[] {
  return ORDERED;
}

/** null for any id that is not a lesson — a mistyped URL, or a lesson that
 *  existed when someone's progress was saved and has since been renamed. */
export function findLesson(id: string): ResolvedLesson | null {
  return BY_ID.get(id) ?? null;
}

export function isLessonId(id: string): boolean {
  return BY_ID.has(id);
}
