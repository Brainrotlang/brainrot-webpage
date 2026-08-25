import { CHAPTERS, FIRST_LESSON_ID, LESSON_COUNT, allLessons, findLesson, isLessonId } from ".";
import programs from "../programs";
import claims from "../programs/claims";
import { LIMITATIONS } from "../limitations";
import { runnableProgram } from "../types";

test("lesson ids are unique", () => {
  const ids = allLessons().map((entry) => entry.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test("previous/next form one chain through the whole curriculum", () => {
  const lessons = allLessons();
  expect(lessons[0].previous).toBeNull();
  expect(lessons[lessons.length - 1].next).toBeNull();

  // Walking Next from the first lesson must reach every lesson exactly
  // once: an unreachable lesson is one nobody can get to by reading.
  const walked: string[] = [];
  let current: string | null = FIRST_LESSON_ID;
  while (current) {
    walked.push(current);
    const entry = findLesson(current);
    expect(entry).not.toBeNull();
    current = entry?.next ?? null;
  }
  expect(walked).toEqual(lessons.map((entry) => entry.id));
  expect(walked).toHaveLength(LESSON_COUNT);
});

test("each runnable lesson uses the program filed under its own chapter and slug", () => {
  // Guards the copy-paste failure: a lesson wired to the neighbouring
  // lesson's program would still run, still verify in CI, and quietly teach
  // the wrong thing.
  for (const chapter of CHAPTERS) {
    for (const lesson of chapter.lessons) {
      const program = runnableProgram(lesson);
      if (!program) continue;
      const filed = programs[chapter.id as keyof typeof programs] as Record<string, unknown> | undefined;
      expect(filed?.[lesson.slug]).toBe(program);
    }
  }
});

test("every program belongs to a lesson", () => {
  // The other direction: a program nobody references is dead weight that CI
  // would keep verifying forever.
  const referenced = new Set(
    allLessons()
      .filter(({ lesson }) => runnableProgram(lesson) !== null)
      .map(({ id }) => id),
  );

  for (const [chapterId, chapterPrograms] of Object.entries(programs)) {
    for (const slug of Object.keys(chapterPrograms)) {
      expect(referenced.has(`${chapterId}/${slug}`)).toBe(true);
    }
  }
});

test("every exercise can be checked, and its starter is not already the answer", () => {
  for (const { lesson } of allLessons()) {
    if (lesson.kind !== "exercise") continue;
    expect(lesson.program.solution).toBeTruthy();
    expect(lesson.program.solution).not.toBe(lesson.program.starter);
  }
});

test("reference lessons say why they cannot run, and have something to show", () => {
  for (const { lesson } of allLessons()) {
    if (lesson.kind !== "reference") continue;
    expect(lesson.notRunnableReason.length).toBeGreaterThan(0);
    expect(lesson.snippets.length).toBeGreaterThan(0);
  }
});

test("every claim is attached to a lesson that exists", () => {
  // A claim's whole purpose is to keep one lesson's warning honest. Pointing
  // at a renamed or deleted lesson makes it float free: still checked by
  // verify:lessons, no longer connected to anything a reader sees.
  const claimEntries = Object.entries(claims);
  expect(claimEntries.length).toBeGreaterThan(0);

  const orphaned = claimEntries
    .filter(([, claim]) => findLesson(claim.lesson) === null)
    .map(([id, claim]) => `${id} → ${claim.lesson}`);
  expect(orphaned).toEqual([]);

  const unexplained = claimEntries.filter(([, claim]) => claim.claim.trim() === "").map(([id]) => id);
  expect(unexplained).toEqual([]);
});

test("the limitations page lists exactly the claims marked as limitations", () => {
  // The page's wording is a copy of the claims' wording, kept separate so the
  // claims file (whole programs, run by CI) stays out of the browser bundle.
  // This is what stops the copy from drifting.
  const claimed = Object.values(claims)
    // `limitation` is only present on the claims that are limitations, so
    // the flag has to be narrowed rather than read straight off the union.
    .filter((claim) => "limitation" in claim && claim.limitation)
    .map((claim) => `${claim.lesson} :: ${claim.claim}`)
    .sort();
  const listed = LIMITATIONS.map((limitation) => `${limitation.lesson} :: ${limitation.text}`).sort();

  expect(listed).toEqual(claimed);
});

test("every limitation points at a lesson that exists", () => {
  const orphaned = LIMITATIONS.filter((limitation) => findLesson(limitation.lesson) === null).map(
    (limitation) => limitation.lesson,
  );
  expect(orphaned).toEqual([]);
});

test("findLesson rejects ids that are not lessons", () => {
  expect(findLesson("basics/nope")).toBeNull();
  expect(findLesson("")).toBeNull();
  expect(isLessonId(FIRST_LESSON_ID)).toBe(true);
  expect(isLessonId("nope/nope")).toBe(false);
});
