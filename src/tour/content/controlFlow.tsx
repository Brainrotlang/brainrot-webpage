// src/tour/content/controlFlow.tsx
//
// The "Control Flow" chapter: branching and looping.
//
// Two lessons here exist because of what the interpreter actually does
// rather than what a C programmer would assume: the never-ending goon
// (which the runner is expected to cut off) and the note that `grind` —
// continue — does not parse in this release at all.

import type { TourChapter } from "../types";
import { Snippet } from "../Snippet";
import programs from "../programs";

const chapterPrograms = programs["control-flow"];

export const controlFlowChapter: TourChapter = {
  id: "control-flow",
  title: "Control Flow",
  lessons: [
    {
      slug: "edgy",
      kind: "demo",
      title: "edgy",
      summary: "The if statement, with a condition in parentheses and a braced body.",
      program: chapterPrograms.edgy,
      Body: () => (
        <>
          <p>
            <code>edgy</code> is <code>if</code>. The condition goes in parentheses and the body in braces —
            C's shape, C's semantics.
          </p>
          <Snippet>{`edgy (aura > 9000) {
    yapping("certified W");
}`}</Snippet>
          <p>
            Any non-zero value counts as true, so <code>edgy (count)</code> is a legitimate way to ask "is this
            not zero". <code>W</code> and <code>L</code> are just <code>1</code> and <code>0</code> wearing
            hats.
          </p>
          <p>
            One thing not to reach for: <code>!</code> does not negate in this release (see{" "}
            <strong>Operators</strong>). Write the comparison the other way round instead.
          </p>
        </>
      ),
    },
    {
      slug: "edgy-amogus",
      kind: "demo",
      title: "edgy / amogus",
      summary: "Else, and chained branches.",
      program: chapterPrograms["edgy-amogus"],
      Body: () => (
        <>
          <p>
            <code>amogus</code> is <code>else</code>. Chain them by following <code>amogus</code> with another{" "}
            <code>edgy</code> — there is no dedicated "else if" keyword, exactly as in C.
          </p>
          <Snippet>{`edgy (score > 9000) {
    yapping("certified W");
} amogus edgy (score > 100) {
    yapping("mid");
} amogus {
    yapping("skill issue");
}`}</Snippet>
          <p>
            Branches are tested top to bottom and the first match wins, so order the conditions from most to
            least specific. Try changing <code>score</code> in the program below until each branch fires.
          </p>
        </>
      ),
    },
    {
      slug: "goon",
      kind: "demo",
      title: "goon",
      summary: "The while loop.",
      program: chapterPrograms.goon,
      Body: () => (
        <>
          <p>
            <code>goon</code> is <code>while</code>: test the condition, run the body, repeat.
          </p>
          <Snippet>{`goon (i < 3) {
    yapping("i = %d", i);
    i++;
}`}</Snippet>
          <p>
            Nothing advances the loop for you, so the body has to change something the condition reads. Forget
            that and you get the next lesson.
          </p>
        </>
      ),
    },
    {
      slug: "never-ending-goon",
      kind: "demo",
      title: "A goon that never stops",
      summary: "What happens when a loop cannot end — and why your browser survives it.",
      program: chapterPrograms["never-ending-goon"],
      Body: () => (
        <>
          <p>
            This program cannot finish. <code>goon (W)</code> is always true and the body changes nothing:
          </p>
          <Snippet>{`goon (W) {
}`}</Snippet>
          <p>
            Run it. After a few seconds the run is cut off and the output pane says so, instead of the tab
            freezing. Programs execute in a Web Worker that the page can terminate from outside, which is the
            only way to stop a loop like this — a running program cannot be asked politely to stop from inside
            itself.
          </p>
          <p>
            Note what you <em>don't</em> get: no exit code, and no output. The program never reached an end, so
            there is nothing to report about how it ended. That is a different outcome from a program that
            crashed, and the tour shows them differently.
          </p>
          <p className="text-sm text-gray-400">
            This is also the one lesson whose expected result is "does not terminate", checked in CI like every
            other lesson — a release that made this program finish would be a surprise worth hearing about.
          </p>
        </>
      ),
    },
    {
      slug: "flex",
      kind: "demo",
      title: "flex",
      summary: "The for loop: initialiser, condition, step.",
      program: chapterPrograms.flex,
      Body: () => (
        <>
          <p>
            <code>flex</code> is <code>for</code>, with the same three semicolon-separated parts.
          </p>
          <Snippet>{`flex (rizz i = 1; i <= 3; i++) {
    yapping("attempt %d", i);
}`}</Snippet>
          <p>
            The counter can be declared in the initialiser, as above, or declared earlier and merely assigned
            there — both appear in the program below. Prefer declaring it in the loop when nothing after the
            loop needs it.
          </p>
        </>
      ),
    },
    {
      slug: "mewing",
      kind: "demo",
      title: "mewing … goon",
      summary: "Do-while: the body runs before the condition is ever tested.",
      program: chapterPrograms.mewing,
      Body: () => (
        <>
          <p>
            <code>mewing … goon</code> is <code>do … while</code>. The body runs first and the condition is
            checked afterwards, so it always executes at least once.
          </p>
          <Snippet>{`mewing {
    tries++;
} goon (tries < 3);`}</Snippet>
          <p className="mt-4 p-3 bg-amber-950/30 border border-amber-900 rounded-lg text-amber-200">
            <strong>The trailing semicolon is required.</strong> Leaving it off is a syntax error —{" "}
            <code>unexpected …, expecting SEMICOLON</code> — and the upstream user guide's own example omits
            it. If you copy a <code>mewing</code> loop from the docs and it will not parse, this is why.
          </p>
        </>
      ),
    },
    {
      slug: "bruh",
      kind: "demo",
      title: "bruh",
      summary: "Break out of a loop early — and the keyword that is missing.",
      program: chapterPrograms.bruh,
      Body: () => (
        <>
          <p>
            <code>bruh</code> is <code>break</code>: leave the innermost loop immediately, skipping the rest of
            the body and the condition.
          </p>
          <Snippet>{`flex (rizz i = 0; i < 10; i++) {
    edgy (i == 3) {
        bruh;
    }
    yapping("%d", i);
}`}</Snippet>
          <p className="mt-4 p-3 bg-amber-950/30 border border-amber-900 rounded-lg text-amber-200">
            <strong>
              <code>grind</code> (C's <code>continue</code>) does not work in this release.
            </strong>{" "}
            The keyword exists in the lexer, so it looks supported, but no form of it parses — inside{" "}
            <code>goon</code>, inside <code>flex</code>, braced or bare, it is{" "}
            <code>syntax error, unexpected CONTINUE</code>. Until that lands, express "skip this one" by
            inverting the condition: put the work inside an <code>edgy</code> instead of guarding it with a
            jump.
          </p>
          <p>
            <code>bruh</code> does double duty as the <code>break</code> that ends a{" "}
            <code>sigma rule</code> case — the next lesson.
          </p>
        </>
      ),
    },
    {
      slug: "ohio",
      kind: "demo",
      title: "ohio",
      summary: "Switch, sigma rule, based.",
      program: chapterPrograms.ohio,
      Body: () => (
        <>
          <p>
            <code>ohio</code> is <code>switch</code>, <code>sigma rule</code> is <code>case</code>, and{" "}
            <code>based</code> is <code>default</code>.
          </p>
          <Snippet>{`ohio (tier) {
    sigma rule 1:
        yapping("mid");
        bruh;
    sigma rule 2:
        yapping("certified");
        bruh;
    based:
        yapping("unrecognised tier");
}`}</Snippet>
          <p>
            <code>sigma rule</code> is a single two-word keyword, not the word <code>sigma</code> followed by
            the word <code>rule</code>. Cases fall through without a <code>bruh</code>, same as C, so end each
            one unless falling through is what you want.
          </p>
          <p>
            Because <code>based</code> is a keyword, it cannot be used as a variable name — a trap worth
            remembering when naming things.
          </p>
        </>
      ),
    },
    {
      slug: "fizzbuzz",
      kind: "exercise",
      title: "Exercise: FizzBuzz",
      summary: "The interview classic, in a language that will not help your prospects.",
      program: chapterPrograms.fizzbuzz,
      Body: () => (
        <>
          <p>
            Everything needed is now on the table: a <code>flex</code> loop, <code>edgy</code>/
            <code>amogus</code> chains, and <code>%</code>.
          </p>
          <p className="mt-4 p-3 bg-purple-950/40 border border-purple-800 rounded-lg">
            <strong>Your turn.</strong> For each number from 1 to 15, print <code>FizzBuzz</code> when it
            divides by 15, <code>Fizz</code> when it divides by 3, <code>Buzz</code> when it divides by 5, and
            otherwise the number itself. Then press <strong>Check</strong>.
          </p>
          <p className="text-sm text-gray-400">
            Hint: test the 15 case first. A chain tested from least to most specific never reaches its later
            branches.
          </p>
        </>
      ),
    },
  ],
};
