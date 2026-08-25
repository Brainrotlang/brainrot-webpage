// src/tour/content/runtime.tsx
//
// The "Runtime" chapter: bet, baka, ragequit, chill, and how a Brainrot
// program actually ends.
//
// The exit-codes lesson exists because `bussin` inside `main` turned out to
// be ignored entirely — no early return, no exit code — which the Basics
// chapter originally claimed otherwise. `ragequit` is the only way to end a
// program deliberately.

import type { TourChapter } from "../types";
import { Snippet } from "../Snippet";
import programs from "../programs";

const chapterPrograms = programs.runtime;

export const runtimeChapter: TourChapter = {
  id: "runtime",
  title: "Runtime",
  lessons: [
    {
      slug: "bet",
      kind: "demo",
      title: "bet",
      summary: "Assertions: state what must be true and stop if it is not.",
      program: chapterPrograms.bet,
      Body: () => (
        <>
          <p>
            <code>bet</code> is <code>assert</code>. Give it a condition and an optional message; if the
            condition holds, nothing happens and the program carries on.
          </p>
          <Snippet>{`bet(aura > 0, "aura must be positive");`}</Snippet>
          <p>
            It also <em>returns</em> <code>W</code> on success, so it can sit in a{" "}
            <code>cap</code> if you want the check and the value in one line.
          </p>
          <p>
            The condition must genuinely be a <code>cap</code> — <code>bet(1, "…")</code> is rejected before
            the program runs, with <code>expected bool, got int</code>. This is stricter than C's{" "}
            <code>assert</code>, which takes anything zero-ish. The message, if given, must be a string
            literal or a <code>rant</code>.
          </p>
        </>
      ),
    },
    {
      slug: "bet-fails",
      kind: "demo",
      title: "When bet fails",
      summary: "What a failed assertion looks like from the outside.",
      program: chapterPrograms["bet-fails"],
      Body: () => (
        <>
          <p>Run this one. A failing assertion stops the program where it stands:</p>
          <Snippet>{`Error: bet: assertion failed at line 7: aura must be over nine thousand`}</Snippet>
          <p>
            The message names the line and repeats what you wrote, the exit code is 1, and nothing after the{" "}
            <code>bet</code> runs — the output pane shows how far it got before giving up.
          </p>
          <p>
            Note where that text lands: stderr, not stdout. A program that fails an assertion has still
            "worked" in the sense that it told you precisely what was wrong, which is the entire argument for
            using assertions while you are still figuring a program out.
          </p>
        </>
      ),
    },
    {
      slug: "errors",
      kind: "demo",
      title: "Reporting errors",
      summary: "baka for the message, ragequit for the exit.",
      program: chapterPrograms.errors,
      Body: () => (
        <>
          <p>
            An assertion is for things that should be impossible. For input that is merely wrong, say so with{" "}
            <code>baka</code> and leave with <code>ragequit</code>.
          </p>
          <Snippet>{`edgy (aura < 0) {
    baka("that aura is negative, which is not a thing\\n");
    ragequit(1);
}`}</Snippet>
          <p className="mt-4 p-3 bg-amber-950/30 border border-amber-900 rounded-lg text-amber-200">
            <strong>
              <code>baka</code> takes exactly one string.
            </strong>{" "}
            Unlike <code>yapping</code> and <code>yappin</code>, it accepts no format arguments —{" "}
            <code>baka("value %d\n", 42)</code> does not even parse. So an error message that needs a value in
            it cannot be built with <code>baka</code> alone; print the detail with{" "}
            <code>yapping</code> first, or keep the message general.
          </p>
          <p>
            <code>baka</code> adds no newline of its own, so include <code>\n</code> yourself. A program that
            exits this way produces nothing on stdout, which is exactly what a caller checking exit codes
            wants.
          </p>
        </>
      ),
    },
    {
      slug: "exit-codes",
      kind: "demo",
      title: "Exit codes",
      summary: "How a program tells the outside world it failed.",
      program: chapterPrograms["exit-codes"],
      Body: () => (
        <>
          <p>
            <code>ragequit</code> ends the program immediately with the code you hand it. The output pane
            shows that code after every run, which is how the earlier lessons on failed assertions and out-of-
            bounds indexing could show a <code>1</code>.
          </p>
          <Snippet>{`ragequit(3);   🚽 stops here, exit code 3`}</Snippet>
          <p className="mt-4 p-3 bg-amber-950/30 border border-amber-900 rounded-lg text-amber-200">
            <strong>
              <code>bussin</code> inside <code>main</code> does nothing at all in this release.
            </strong>{" "}
            It does not set an exit code — <code>bussin 7;</code> still exits 0 — and it does not even return
            early: statements after it keep running. Inside an ordinary function <code>bussin</code> works
            perfectly; it is only <code>main</code> where it is ignored.
          </p>
          <p>
            So: keep writing <code>bussin 0;</code> at the end of <code>main</code>, because every other
            Brainrot program does and it is what the language means. But when the exit code or an early exit
            actually matters, reach for <code>ragequit</code> — it is the only thing that works.
          </p>
        </>
      ),
    },
    {
      slug: "chill",
      kind: "demo",
      title: "chill",
      summary: "Doing nothing, on purpose, for a whole second.",
      program: chapterPrograms.chill,
      Body: () => (
        <>
          <p>
            <code>chill</code> sleeps for a whole number of seconds. It is the entire API: no milliseconds, no
            fractions.
          </p>
          <Snippet>{`chill(1);   🚽 one second`}</Snippet>
          <p>
            Worth knowing where the limits are before you experiment. Programs here are cut off after a few
            seconds, so <code>chill(30)</code> will be terminated as though it were an infinite loop — from
            the outside, a program asleep is indistinguishable from a program stuck.
          </p>
          <p>
            The example uses one second so you can see it happen: press Run and watch the pause before the
            second line appears.
          </p>
        </>
      ),
    },
  ],
};
