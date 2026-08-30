// src/tour/lessonCount.ts
//
// How many lessons the tour has, for the homepage to advertise.
//
// A constant rather than an import of the manifest, because the manifest
// pulls in every chapter's prose: importing `LESSON_COUNT` from
// ./content in Hero.tsx would drag the entire curriculum into the main
// bundle and undo the lazily loaded tour chunk for the sake of one number.
//
// content.test.ts asserts this equals the manifest's real count, so it
// cannot quietly fall behind the curriculum.

export const LESSON_COUNT = 62;
