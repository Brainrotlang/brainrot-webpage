import { markCompleted, markSkipped, readProgress, recordVisit, resetProgress } from "./progress";
import { FIRST_LESSON_ID, allLessons } from "./content";

const SECOND_LESSON_ID = allLessons()[1].id;
const STORAGE_KEY = "brainrot-tour-progress";

beforeEach(() => {
  localStorage.clear();
});

test("no stored progress reads as a clean slate", () => {
  expect(readProgress()).toEqual({ lastLessonId: null, completed: [], skipped: [] });
});

test("completion and position survive a reload", () => {
  markCompleted(FIRST_LESSON_ID);
  recordVisit(SECOND_LESSON_ID);

  expect(readProgress()).toEqual({
    lastLessonId: SECOND_LESSON_ID,
    completed: [FIRST_LESSON_ID],
    skipped: [],
  });
});

test("visiting does not claim completion", () => {
  recordVisit(FIRST_LESSON_ID);
  expect(readProgress().completed).toEqual([]);
});

test("completing twice does not duplicate the entry", () => {
  markCompleted(FIRST_LESSON_ID);
  markCompleted(FIRST_LESSON_ID);
  expect(readProgress().completed).toEqual([FIRST_LESSON_ID]);
});

test("solving a skipped exercise clears the skip", () => {
  markSkipped(SECOND_LESSON_ID);
  expect(readProgress().skipped).toEqual([SECOND_LESSON_ID]);

  markCompleted(SECOND_LESSON_ID);
  expect(readProgress()).toMatchObject({ completed: [SECOND_LESSON_ID], skipped: [] });
});

test("skipping never demotes something already completed", () => {
  markCompleted(FIRST_LESSON_ID);
  markSkipped(FIRST_LESSON_ID);
  expect(readProgress()).toMatchObject({ completed: [FIRST_LESSON_ID], skipped: [] });
});

test("resetting clears everything", () => {
  markCompleted(FIRST_LESSON_ID);
  resetProgress();
  expect(readProgress()).toEqual({ lastLessonId: null, completed: [], skipped: [] });
});

test("ids that are no longer lessons are dropped on read", () => {
  // The failure this prevents: content gets renamed, and a returning
  // visitor's Continue button points at a lesson that no longer exists.
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ v: 1, lastLessonId: "basics/deleted-lesson", completed: ["basics/deleted-lesson"], skipped: [] }),
  );

  expect(readProgress()).toEqual({ lastLessonId: null, completed: [], skipped: [] });
});

test("garbage and stale schema versions read as a clean slate rather than throwing", () => {
  localStorage.setItem(STORAGE_KEY, "not json at all");
  expect(readProgress()).toEqual({ lastLessonId: null, completed: [], skipped: [] });

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 99, lastLessonId: FIRST_LESSON_ID }));
  expect(readProgress()).toEqual({ lastLessonId: null, completed: [], skipped: [] });

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, completed: "not an array", skipped: 7 }));
  expect(readProgress()).toEqual({ lastLessonId: null, completed: [], skipped: [] });
});

test("storage that throws on every access does not break progress", () => {
  // Private mode and some embedded contexts throw rather than no-op.
  const denied = () => {
    throw new Error("storage denied");
  };
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(denied);
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(denied);
  jest.spyOn(Storage.prototype, "removeItem").mockImplementation(denied);

  expect(() => markCompleted(FIRST_LESSON_ID)).not.toThrow();
  expect(() => resetProgress()).not.toThrow();
  expect(readProgress()).toEqual({ lastLessonId: null, completed: [], skipped: [] });

  jest.restoreAllMocks();
});
