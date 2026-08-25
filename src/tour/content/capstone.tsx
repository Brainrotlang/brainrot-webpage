// src/tour/content/capstone.tsx
//
// The final challenge. One exercise, deliberately larger than the others and
// deliberately built only from shapes the interpreter handles — see
// ../programs/capstone.js.
//
// Being the last lesson is what makes solving it complete the tour;
// TourLesson shows the finishing panel when an exercise with no `next` passes.

import type { TourChapter } from "../types";
import programs from "../programs";

const chapterPrograms = programs.capstone;

export const capstoneChapter: TourChapter = {
  id: "capstone",
  title: "Final Challenge",
  lessons: [
    {
      slug: "rizz-analyzer",
      kind: "exercise",
      title: "The Ultimate Rizz Analyzer™",
      summary: "Everything at once: input, arrays, a loop, a struct, an enum, an assertion.",
      program: chapterPrograms["rizz-analyzer"],
      Body: () => (
        <>
          <p>
            One program, most of the language. It reads four aura scores from stdin, works out the total, the
            average and the best, files them in a <code>Report</code>, asserts the report is worth printing,
            and classifies the best score into a tier.
          </p>
          <p>
            The scaffolding is written. Two pieces are missing, both marked with <code>TODO</code>:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              the loop body that accumulates <code>total</code> and keeps the largest score in{" "}
              <code>best</code>;
            </li>
            <li>
              <code>tier_for</code>, which returns <code>GOATED</code> above 9000, <code>CERTIFIED</code>{" "}
              above 100, and <code>MID</code> otherwise.
            </li>
          </ol>
          <p className="mt-4 p-3 bg-purple-950/40 border border-purple-800 rounded-lg">
            <strong>Your turn.</strong> With the stdin box as it arrives, the finished program prints{" "}
            <code>total: 9550</code>, <code>average: 2387</code>, <code>best: 9001</code> and{" "}
            <code>tier: 2</code>. Then press <strong>Check</strong>.
          </p>
          <p>Everything the tour warned you about is relevant here, which is rather the point:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm text-gray-400">
            <li>
              <code>tier_for</code> has no loop, so plain early <code>bussin</code> is fine.
            </li>
            <li>
              It takes a <code>rizz</code> rather than a <code>Report</code>, because a struct field cannot be
              combined with anything.
            </li>
            <li>
              The array is walked in <code>main</code>, because arrays cannot be passed to functions.
            </li>
            <li>
              Each <code>report</code> field is set from a plain variable — one field per statement.
            </li>
            <li>
              The integer division in <code>average</code> truncates, which is why 2387.5 prints as 2387.
            </li>
          </ul>
          <p className="text-sm text-gray-400">
            If it comes out wrong, read the Check verdict rather than guessing: it compares stdout, stderr and
            the exit code, and tells you which one disagreed.
          </p>
        </>
      ),
    },
  ],
};
