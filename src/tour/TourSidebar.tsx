// src/tour/TourSidebar.tsx
//
// The chapter/lesson index, built from the manifest. On wide screens it
// sits beside the lesson; on narrow ones it collapses into a native
// <details> disclosure — not a modal drawer, specifically to avoid owning
// a focus trap that <details> gets right for free.

import { NavLink } from "react-router-dom";
import { CHAPTERS } from "./content";
import { lessonId } from "./types";
import type { TourProgress } from "./progress";

interface TourSidebarProps {
  currentLessonId: string;
  progress: TourProgress;
}

function ChapterList({ currentLessonId, progress }: TourSidebarProps) {
  return (
    <ol className="space-y-5">
      {CHAPTERS.map((chapter) => (
        <li key={chapter.id}>
          <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2">{chapter.title}</h3>
          <ul className="space-y-1">
            {chapter.lessons.map((lesson) => {
              const id = lessonId(chapter.id, lesson.slug);
              const isCurrent = id === currentLessonId;
              const isDone = progress.completed.includes(id);
              const isSkipped = !isDone && progress.skipped.includes(id);
              return (
                <li key={id}>
                  <NavLink
                    to={`/tour/${id}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`block rounded px-2 py-1 text-sm ${
                      isCurrent
                        ? "bg-purple-900/60 text-white font-semibold"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    {lesson.title}
                    {/* Text, not just a colour or a tick: state a visitor
                        cannot perceive is state they do not have. */}
                    {isDone && <span className="ml-2 text-xs text-green-400">done</span>}
                    {isSkipped && <span className="ml-2 text-xs text-amber-400">skipped</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}

export function TourSidebar({ currentLessonId, progress }: TourSidebarProps) {
  return (
    <>
      <nav aria-label="Tour contents" className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-4">
          <NavLink to="/tour" className="block text-sm text-purple-400 hover:text-purple-300 mb-4">
            ← Tour overview
          </NavLink>
          <ChapterList currentLessonId={currentLessonId} progress={progress} />
        </div>
      </nav>

      <details className="lg:hidden mb-4 bg-gray-800 rounded-lg">
        <summary className="cursor-pointer px-4 py-3 text-sm text-gray-200 select-none">
          All lessons
        </summary>
        <nav aria-label="Tour contents" className="px-4 pb-4">
          <NavLink to="/tour" className="block text-sm text-purple-400 hover:text-purple-300 mb-4">
            ← Tour overview
          </NavLink>
          <ChapterList currentLessonId={currentLessonId} progress={progress} />
        </nav>
      </details>
    </>
  );
}
