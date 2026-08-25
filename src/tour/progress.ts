// src/tour/progress.ts
//
// Where the visitor got to, kept in localStorage. No account, no sync, and
// no situation in which losing it breaks the tour — every read falls back
// to "no progress yet" and every write is allowed to fail silently.
//
// Two things are validated rather than trusted: the stored shape (anything
// can be in localStorage, including a half-written value from an older
// version of this file) and the lesson ids themselves. Content gets renamed;
// a "Continue" button pointing at a lesson that no longer exists would send
// a returning visitor straight to a 404.

import { isLessonId } from "./content";

const STORAGE_KEY = "brainrot-tour-progress";
const SCHEMA_VERSION = 1;

export interface TourProgress {
  /** Where "Continue" goes. */
  lastLessonId: string | null;
  /** Lessons read, and exercises actually solved. */
  completed: readonly string[];
  /** Exercises the visitor moved past without solving. Tracked separately
   *  so "skipped" never reads as "done" — skipping is allowed, but the
   *  tour should not congratulate you for it. */
  skipped: readonly string[];
}

const EMPTY: TourProgress = { lastLessonId: null, completed: [], skipped: [] };

interface StoredProgress {
  v: number;
  lastLessonId: unknown;
  completed: unknown;
  skipped: unknown;
}

function isStoredProgress(value: unknown): value is StoredProgress {
  return typeof value === "object" && value !== null && "v" in value;
}

function knownLessonIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string" && isLessonId(id));
}

export function readProgress(): TourProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredProgress(parsed) || parsed.v !== SCHEMA_VERSION) return EMPTY;
    const lastLessonId =
      typeof parsed.lastLessonId === "string" && isLessonId(parsed.lastLessonId) ? parsed.lastLessonId : null;
    return {
      lastLessonId,
      completed: knownLessonIds(parsed.completed),
      skipped: knownLessonIds(parsed.skipped),
    };
  } catch {
    // Unparseable JSON, a storage quota error, or storage denied outright
    // (private mode, sandboxed iframe). The tour works without it.
    return EMPTY;
  }
}

function write(progress: TourProgress): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        v: SCHEMA_VERSION,
        lastLessonId: progress.lastLessonId,
        completed: progress.completed,
        skipped: progress.skipped,
      }),
    );
  } catch {
    // Nothing to do about it, and nothing worth interrupting the visitor for.
  }
}

function withAdded(list: readonly string[], id: string): string[] {
  return list.includes(id) ? [...list] : [...list, id];
}

function withRemoved(list: readonly string[], id: string): string[] {
  return list.filter((entry) => entry !== id);
}

/** Records where the visitor is, without claiming they finished anything. */
export function recordVisit(id: string): TourProgress {
  if (!isLessonId(id)) return readProgress();
  const next: TourProgress = { ...readProgress(), lastLessonId: id };
  write(next);
  return next;
}

/** A lesson read, or an exercise solved. Clears any earlier "skipped" mark:
 *  coming back and solving it should not leave it looking abandoned. */
export function markCompleted(id: string): TourProgress {
  if (!isLessonId(id)) return readProgress();
  const current = readProgress();
  const next: TourProgress = {
    lastLessonId: id,
    completed: withAdded(current.completed, id),
    skipped: withRemoved(current.skipped, id),
  };
  write(next);
  return next;
}

/** Moved past an exercise without solving it. Never overrides a completion. */
export function markSkipped(id: string): TourProgress {
  if (!isLessonId(id)) return readProgress();
  const current = readProgress();
  if (current.completed.includes(id)) return current;
  const next: TourProgress = { ...current, skipped: withAdded(current.skipped, id) };
  write(next);
  return next;
}

export function resetProgress(): TourProgress {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Same as above: best effort.
  }
  return EMPTY;
}
