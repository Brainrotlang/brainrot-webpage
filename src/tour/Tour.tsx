// src/tour/Tour.tsx
//
// The /tour subtree: its routes, its shared frame, and the two pieces of
// state that outlive a single lesson — the visitor's progress and their
// in-progress edits.
//
// Progress is held here rather than read inside each component so the
// sidebar and the lesson agree about it within a single render, instead of
// racing to re-read localStorage after each other's writes.

import { useCallback, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import NotFound from "../NotFound";
import { TourDraftsProvider } from "./drafts";
import { TourLanding } from "./TourLanding";
import { TourLesson } from "./TourLesson";
import { TourSidebar } from "./TourSidebar";
import { findLesson } from "./content";
import { readProgress, resetProgress } from "./progress";
import type { TourProgress } from "./progress";

interface WithProgress {
  progress: TourProgress;
  refreshProgress: () => void;
}

function LessonRoute({ progress, refreshProgress }: WithProgress) {
  const { chapterSlug, lessonSlug } = useParams();
  const resolved = findLesson(`${chapterSlug}/${lessonSlug}`);

  // A URL shaped like a lesson but naming one that does not exist is a 404,
  // not an empty lesson frame. Renaming content, or mistyping a shared
  // link, both land here.
  if (!resolved) return <NotFound />;

  return (
    <div className="flex gap-10">
      <TourSidebar currentLessonId={resolved.id} progress={progress} />
      {/* Keyed by lesson: a new lesson gets fresh editor, run and check
          state rather than inheriting the previous one's. Edits survive
          anyway, because the draft store lives above this. */}
      <TourLesson key={resolved.id} resolved={resolved} onProgressChange={refreshProgress} />
    </div>
  );
}

export default function Tour() {
  const [progress, setProgress] = useState<TourProgress>(() => readProgress());
  const refreshProgress = useCallback(() => setProgress(readProgress()), []);
  const clearProgress = useCallback(() => setProgress(resetProgress()), []);

  return (
    <TourDraftsProvider>
      <div className="container mx-auto py-10 px-4">
        <Routes>
          <Route index element={<TourLanding progress={progress} onResetProgress={clearProgress} />} />
          <Route
            path=":chapterSlug/:lessonSlug"
            element={<LessonRoute progress={progress} refreshProgress={refreshProgress} />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </TourDraftsProvider>
  );
}
