// src/tour/content/arraysAndInput.tsx
//
// The "Arrays, Text and Input" chapter.
//
// Arrays turn out to be one of the better-supported parts of the language —
// worth saying out loud, because the previous chapters have been full of
// caveats and this one mostly is not. The two things that do surprise: array
// indexing is bounds-checked at runtime (C would not), and every stdin lesson
// has to ship with its input pre-filled because slorp on empty input is fatal.

import type { TourChapter } from "../types";
import { Snippet } from "../Snippet";
import programs from "../programs";

const chapterPrograms = programs["arrays-and-input"];

export const arraysAndInputChapter: TourChapter = {
  id: "arrays-and-input",
  title: "Arrays, Text and Input",
  lessons: [
    {
      slug: "arrays",
      kind: "demo",
      title: "Arrays",
      summary: "Many values of one type, reached by index.",
      program: chapterPrograms.arrays,
      Body: () => (
        <>
          <p>
            An array declaration puts the length in brackets after the name. Indices start at zero, and every
            slot starts at zero too.
          </p>
          <Snippet>{`rizz scores[3];              🚽 three slots, all zero
scores[0] = 42;

rizz aura[4] = {10, 20, 30, 40};   🚽 or fill them all at once`}</Snippet>
          <p>
            Any of the primitive types works — <code>rizz</code>, <code>cap</code>, <code>chad</code>,{" "}
            <code>gigachad</code>, <code>yap</code>. The length must be a literal, and it is fixed: there is no
            growing an array later.
          </p>
          <p>
            Array elements combine freely in expressions: <code>aura[0] + aura[1]</code> works,{" "}
            <code>aura[i] = aura[i] + 1</code> works, and two elements can be compared to each other directly.
          </p>
        </>
      ),
    },
    {
      slug: "loops",
      kind: "demo",
      title: "Walking an array",
      summary: "The length idiom, and the loop that goes with it.",
      program: chapterPrograms.loops,
      Body: () => (
        <>
          <p>
            An array does not carry its own length, so the count has to be computed — with{" "}
            <code>maxxing</code>, from the total size divided by the size of one element.
          </p>
          <Snippet>{`rizz count = maxxing(aura) / maxxing(aura[0]);

flex (rizz i = 0; i < count; i++) {
    total = total + aura[i];
}`}</Snippet>
          <p>
            Do that where the array is declared. It cannot be done inside a function, because{" "}
            <strong>arrays cannot be passed to functions at all</strong> — neither as{" "}
            <code>rizz *a</code> nor as <code>rizz a[]</code>. Anything that walks an array walks it in the
            function that declared it.
          </p>
          <p>
            The running-maximum pattern in the program below is worth stealing: start with the first element
            rather than zero, so it works for arrays of negative numbers too.
          </p>
        </>
      ),
    },
    {
      slug: "bounds",
      kind: "demo",
      title: "Going out of bounds",
      summary: "What happens when an index is wrong — and it is good news.",
      program: chapterPrograms.bounds,
      Body: () => (
        <>
          <p>
            Reading past the end of an array is where C hands you whatever byte happened to be there. Brainrot
            checks the index and stops the program:
          </p>
          <Snippet>{`Error: Array index out of bounds: dimension 1 (index=5, size=2)`}</Snippet>
          <p>
            The message names the dimension, the index you asked for, and the size that was actually there.
            Negative indices are caught by the same check. The program exits non-zero, and anything after the
            bad access does not run — the output pane shows exactly how far it got.
          </p>
          <p>
            This is one of the places where Brainrot is genuinely kinder than the language it is imitating.
            Do not rely on it for correctness, but do let it save you an afternoon.
          </p>
        </>
      ),
    },
    {
      slug: "matrices",
      kind: "demo",
      title: "Multidimensional arrays",
      summary: "Arrays of arrays, and the braces that go with them.",
      program: chapterPrograms.matrices,
      Body: () => (
        <>
          <p>
            Add a second pair of brackets for a grid. The initialiser nests to match: one set of braces per
            row.
          </p>
          <Snippet>{`rizz grid[2][3] = { {1, 2, 3}, {4, 5, 6} };

grid[1][2] = 60;`}</Snippet>
          <p>
            Index in the order the dimensions were declared — <code>grid[row][col]</code> for{" "}
            <code>grid[2][3]</code> — and nest loops the same way. Three dimensions work too, if you have a
            reason.
          </p>
          <p>
            The bounds check from the previous lesson covers every dimension separately, which is why its
            message says which dimension you overran.
          </p>
        </>
      ),
    },
    {
      slug: "text",
      kind: "demo",
      title: "Characters and text",
      summary: "yap, rant, and the character buffer in between.",
      program: chapterPrograms.text,
      Body: () => (
        <>
          <p>There are three ways to hold text, and picking the wrong one is the usual beginner tax:</p>
          <div className="overflow-x-auto my-4">
            <table className="text-sm">
              <tbody className="font-mono">
                {[
                  ["yap c = 'C';", "one character, single quotes"],
                  ['rant s = "Chad";', "a string literal you can print and reassign"],
                  ["yap buffer[16];", "room for a line you are about to read in"],
                ].map(([code, meaning]) => (
                  <tr key={code}>
                    <td className="pr-6 text-purple-400">{code}</td>
                    <td className="text-gray-300">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            A buffer is just a <code>yap</code> array, so <code>buffer[0]</code> is its first character and the{" "}
            <code>maxxing</code> idiom gives its capacity.
          </p>
          <p className="mt-4 p-3 bg-amber-950/30 border border-amber-900 rounded-lg text-amber-200">
            <strong>Compare with <code>yapcmp</code>, not <code>==</code>.</strong> There is now a small string
            library — length, join, compare and search — covered in the next lesson. What still does{" "}
            <em>not</em> work is the <code>==</code> operator on strings: <code>s == "chad"</code> prints
            interpreter errors to stderr and cannot be trusted, so reach for <code>yapcmp</code> instead.
          </p>
        </>
      ),
    },
    {
      slug: "strings",
      kind: "demo",
      title: "The string toolkit",
      summary: "yaplen, yapcat, yapcmp, yapidx — measure, join, compare, search.",
      program: chapterPrograms.strings,
      Body: () => (
        <>
          <p>
            A <code>rant</code> now comes with four builtins — the v1 string library. They measure, join,
            compare and search, and that is deliberately the whole set: no substring, split or replace yet.
          </p>
          <div className="overflow-x-auto my-4">
            <table className="text-sm">
              <tbody className="font-mono">
                {[
                  ["yaplen(s)", "length in bytes"],
                  ["yapcat(a, b)", "a joined to b, as a new rant"],
                  ["yapcmp(a, b)", "-1, 0 or 1 — lexicographic order"],
                  ["yapidx(hay, needle)", "byte index of needle, or -1"],
                ].map(([code, meaning]) => (
                  <tr key={code}>
                    <td className="pr-6 text-purple-400">{code}</td>
                    <td className="text-gray-300">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            <code>yapidx</code> returns <code>-1</code> when the needle is absent, so{" "}
            <code>yapidx(hay, needle) &gt;= 0</code> is the idiomatic "contains" test — and it stays correct
            even for an empty needle, which returns <code>0</code>. <code>yapcmp</code> returns exactly{" "}
            <code>-1</code>, <code>0</code> or <code>1</code>, and a prefix always sorts before the string that
            extends it: <code>yapcmp("app", "apple")</code> is <code>-1</code>.
          </p>
          <p>
            Strings are immutable, so <code>yapcat</code> touches neither argument and hands back a new{" "}
            <code>rant</code> — which is also why a <code>rant</code> can now be a function parameter and a
            return value, as <code>full_name</code> below shows.
          </p>
          <p className="mt-4 p-3 bg-amber-950/30 border border-amber-900 rounded-lg text-amber-200">
            <strong>Everything is bytes, not characters.</strong> <code>yaplen("é")</code> is <code>2</code>,
            because that is two bytes of UTF-8, and comparison and searching work on bytes too. One sharper
            trap: a <code>yap[N]</code> buffer — what <code>slorp</code> fills — always reports length{" "}
            <code>N</code>, its declared capacity, not the length of the text in it. Measure and compare a{" "}
            <code>rant</code>, not a raw buffer.
          </p>
        </>
      ),
    },
    {
      slug: "slorp",
      kind: "demo",
      title: "slorp",
      summary: "Reading a number from stdin, with the type taken from context.",
      program: chapterPrograms.slorp,
      Body: () => (
        <>
          <p>
            <code>slorp()</code> reads one value from standard input. It takes no arguments — the type comes
            from where the value is going:
          </p>
          <Snippet>{`rizz aura = slorp();      🚽 reads an integer
chad ratio = slorp();     🚽 reads a float
cap flag = slorp();       🚽 reads 1 or 0
yap letter = slorp();     🚽 reads one character`}</Snippet>
          <p>
            "Where the value is going" is a short list: a declaration's initialiser, an assignment's
            right-hand side, a <code>bussin</code>, or an argument to a function with one fixed parameter type.
            Anywhere else it has nothing to infer from and is rejected — <code>slorp() + 1</code> and{" "}
            <code>yapping("%d", slorp())</code> both fail, which reads like a bug and is in fact the design.
          </p>
          <p>
            The <strong>stdin</strong> box under the editor is what the program reads. This lesson arrives with
            a value in it, because <code>slorp</code> on empty input is a hard error rather than a zero — try
            emptying the box and running it to see. Reading several values means several lines.
          </p>
          <p className="text-sm text-gray-400">
            You may see <code>slorp(variable)</code> in older code. It still works and still writes back into
            the variable, but it prints a deprecation warning on stderr; prefer{" "}
            <code>variable = slorp()</code>.
          </p>
        </>
      ),
    },
    {
      slug: "slorp-buffer",
      kind: "demo",
      title: "Reading a line",
      summary: "The other slorp: a whole line into a buffer.",
      program: chapterPrograms["slorp-buffer"],
      Body: () => (
        <>
          <p>
            Given a <code>yap</code> buffer, <code>slorp</code> reads an entire line into it — spaces included
            — and hands it back as a <code>rant</code> you can print.
          </p>
          <Snippet>{`yap line[32];
rant answer = slorp(line);

yapping("hello, %s", answer);
yapping("first letter: %c", line[0]);`}</Snippet>
          <p>
            Unlike the scalar form, this one is an ordinary expression: assign it, pass it, or ignore the
            return value and read the buffer directly. Both views refer to the same characters.
          </p>
          <p>
            Size the buffer for the longest line you expect. And since there is no string comparison, a name
            read this way can be printed but not usefully tested against another.
          </p>
        </>
      ),
    },
    {
      slug: "census",
      kind: "exercise",
      title: "Exercise: rizz census",
      summary: "Read three scores, classify each, total them up.",
      program: chapterPrograms.census,
      Body: () => (
        <>
          <p>
            The loop and the input are already written. Three scores come in from stdin — they are in the{" "}
            <strong>stdin</strong> box, one per line — and each needs classifying and adding up.
          </p>
          <p className="mt-4 p-3 bg-purple-950/40 border border-purple-800 rounded-lg">
            <strong>Your turn.</strong> Add each score to <code>total</code>, and print{" "}
            <code>&lt;score&gt; certified</code> when it is above 100 and <code>&lt;score&gt; mid</code>{" "}
            otherwise. The final line should read <code>total: 9543</code>. Then press <strong>Check</strong>.
          </p>
          <p className="text-sm text-gray-400">
            Change the numbers in the stdin box to try other inputs — but change them back before pressing
            Check, since the exercise is graded on the input it ships with.
          </p>
        </>
      ),
    },
  ],
};
