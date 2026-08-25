// src/tour/content/basics.tsx
//
// Chapter 1. A first slice only — the framework lands before the
// curriculum does, so this chapter exists mainly to prove that an exercise
// works end to end.

import type { TourChapter } from "../types";
import { Snippet } from "../Snippet";
import programs from "../programs";

const chapterPrograms = programs.basics;

export const basicsChapter: TourChapter = {
  id: "basics",
  title: "Basics",
  lessons: [
    {
      slug: "variables",
      kind: "exercise",
      title: "Variables",
      summary: "Declare something, give it a value, print it. Then do it yourself.",
      program: chapterPrograms.variables,
      Body: () => (
        <>
          <p>
            A declaration is the type, then the name, then optionally a value — exactly like C, with the
            vocabulary swapped. <code>rizz</code> is an integer.
          </p>
          <Snippet>{`rizz aura = 100;      🚽 declare and initialise
aura = aura + 1;      🚽 assign later`}</Snippet>
          <p>
            Anything after <code>🚽</code> to the end of the line is a comment. Yes, the toilet is the comment
            marker. No, there is no block-comment form.
          </p>
          <p>
            <code>yapping</code> takes a format string like C's <code>printf</code>: <code>%d</code> for an
            integer, <code>%s</code> for text, <code>%f</code> for a float.
          </p>
          <p className="mt-4 p-3 bg-purple-950/40 border border-purple-800 rounded-lg">
            <strong>Your turn.</strong> Make the program print <code>aura: 9001</code>, then press{" "}
            <strong>Check</strong>. <strong>Run</strong> still just runs whatever you have written — Check is
            what compares it against what the exercise asked for.
          </p>
        </>
      ),
    },
    {
      slug: "types",
      kind: "demo",
      title: "Primitive types",
      summary: "The six types you will use constantly, and their format specifiers.",
      program: chapterPrograms.types,
      Body: () => (
        <>
          <p>Brainrot's everyday types map one-to-one onto C's:</p>
          <div className="overflow-x-auto my-4">
            <table className="text-sm">
              <tbody className="font-mono">
                {[
                  ["rizz", "int", "%d"],
                  ["cap", "bool", "%d"],
                  ["chad", "float", "%f"],
                  ["gigachad", "double", "%f"],
                  ["yap", "char", "%c"],
                  ["rant", "string", "%s"],
                ].map(([brainrot, c, spec]) => (
                  <tr key={brainrot}>
                    <td className="pr-8 text-purple-400">{brainrot}</td>
                    <td className="pr-8 text-gray-300">{c}</td>
                    <td className="text-gray-400">{spec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Booleans are written <code>W</code> and <code>L</code> — true and false. They print as{" "}
            <code>1</code> and <code>0</code>.
          </p>
          <p>
            Watch out for keywords: <code>based</code> looks like an ordinary word but it is Brainrot's{" "}
            <code>default</code>, so naming a variable <code>based</code> is a syntax error rather than a
            statement about the variable.
          </p>
          <p>
            The wider integer forms (<code>smol</code>, <code>giga rizz</code>, <code>thicc rizz</code>,{" "}
            <code>nut rizz</code>, <code>nonut rizz</code>) exist too and get their own lesson later.
          </p>
        </>
      ),
    },
  ],
};
