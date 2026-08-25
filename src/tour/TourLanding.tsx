// src/tour/TourLanding.tsx
//
// /tour — what this is, where to start, and where you left off.

import { Link } from "react-router-dom";
import { CHAPTERS, FIRST_LESSON_ID, LESSON_COUNT, findLesson } from "./content";
import { lessonId } from "./types";
import type { TourProgress } from "./progress";

interface TourLandingProps {
  progress: TourProgress;
  onResetProgress: () => void;
}

export function TourLanding({ progress, onResetProgress }: TourLandingProps) {
  // Progress is filtered against the manifest on read, so a "Continue" here
  // can never point at a lesson that has since been renamed away.
  const resume = progress.lastLessonId ? findLesson(progress.lastLessonId) : null;

  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold mb-4">A Tour of Brainrot 🧠</h1>
      <p className="text-gray-300 leading-relaxed mb-4">
        A guided walk through the language, from <code className="text-purple-300">yapping("Hello, World!")</code>{" "}
        to the parts that will genuinely damage you. Every example runs in this tab against the real
        interpreter — there is nothing to install, and nothing you write leaves your browser.
      </p>
      <p className="text-gray-400 text-sm mb-8">
        {LESSON_COUNT} {LESSON_COUNT === 1 ? "lesson" : "lessons"} so far, across {CHAPTERS.length}{" "}
        {CHAPTERS.length === 1 ? "chapter" : "chapters"}. Your place is remembered in this browser only.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-12">
        {resume && (
          <Link
            to={`/tour/${resume.id}`}
            className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-lg font-semibold"
          >
            Continue: {resume.lesson.title}
          </Link>
        )}
        <Link
          to={`/tour/${FIRST_LESSON_ID}`}
          className={
            resume
              ? "bg-gray-700 hover:bg-gray-600 px-5 py-3 rounded-lg font-semibold"
              : "bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-lg font-semibold"
          }
        >
          {resume ? "Start from the beginning" : "Start the tour"}
        </Link>
        {(progress.completed.length > 0 || progress.lastLessonId) && (
          <button type="button" onClick={onResetProgress} className="text-sm text-gray-400 hover:text-gray-200 underline">
            Reset progress
          </button>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4">Chapters</h2>
      <ol className="space-y-6">
        {CHAPTERS.map((chapter) => (
          <li key={chapter.id}>
            <h3 className="font-semibold text-lg">{chapter.title}</h3>
            <ul className="mt-2 space-y-1">
              {chapter.lessons.map((lesson) => {
                const id = lessonId(chapter.id, lesson.slug);
                const isDone = progress.completed.includes(id);
                return (
                  <li key={id} className="text-sm">
                    <Link to={`/tour/${id}`} className="text-purple-400 hover:text-purple-300">
                      {lesson.title}
                    </Link>
                    {lesson.kind === "exercise" && <span className="ml-2 text-xs text-gray-500">exercise</span>}
                    {isDone && <span className="ml-2 text-xs text-green-400">done</span>}
                    <span className="block text-gray-400">{lesson.summary}</span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      <p className="text-sm text-gray-400 mt-10">
        Looking something up rather than learning it?{" "}
        <a
          href="https://github.com/Brainrotlang/brainrot/tree/main/docs"
          className="text-purple-400 hover:text-purple-300 underline"
        >
          The language reference
        </a>{" "}
        is the exhaustive version.
      </p>
    </div>
  );
}
