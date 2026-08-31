// src/tour/content/advanced.tsx
//
// The "Advanced" chapter. All three lessons are reference lessons: two
// describe features the browser runner or the interpreter cannot execute,
// and the third is an index of what does not work yet.
//
// The limitations list comes from ../limitations, whose wording is checked
// against src/tour/programs/claims.js in content.test.ts — so this page
// cannot claim a limitation CI is not still verifying.

import type { TourChapter } from "../types";
import { Link } from "react-router-dom";
import { LIMITATIONS } from "../limitations";

// Only used to show what a multi-file program looks like; nothing runs it.
const COOKED_MAIN = `#cooked "mathutils.brainrot"

skibidi main {
    yapping("%d", square(6));
    bussin 0;
}`;

const COOKED_MODULE = `🚽 mathutils.brainrot
rizz square(rizz n) {
    bussin n * n;
}`;

export const advancedChapter: TourChapter = {
  id: "advanced",
  title: "Advanced",
  lessons: [
    {
      slug: "cooked",
      kind: "reference",
      title: "Modules with #cooked",
      summary: "Splitting a program across files — on a real machine, not here.",
      notRunnableReason:
        "this runner hands the interpreter a single source file, and #cooked needs a second one sitting next to it.",
      snippets: [COOKED_MODULE, COOKED_MAIN],
      Body: () => (
        <>
          <p>
            <code>#cooked</code> is Brainrot's <code>#include</code>. It splices another file's definitions in
            at that point, so a program can be split up:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              The directive goes alone on its line, and only the quoted form exists — there is no{" "}
              <code>&lt;...&gt;</code> equivalent, because the built-ins are always available anyway.
            </li>
            <li>
              A relative path resolves against the directory of the file <em>containing</em> the directive, not
              the directory you ran the compiler from.
            </li>
            <li>
              An included file should hold definitions only — no <code>skibidi main</code> of its own, since a
              program has exactly one and splicing in a second is a parse error.
            </li>
            <li>
              Including the same file twice is a no-op after the first time, and a cycle is an error that
              reports the include chain rather than hanging.
            </li>
          </ul>
          <p>
            Everything above is real and works — with the compiler installed locally. It is only this page that
            cannot demonstrate it, and pretending otherwise by faking a filesystem would teach you about our
            fake filesystem rather than about Brainrot.
          </p>
          <p className="text-sm text-gray-400">
            For what it is worth, the interpreter compiled to WebAssembly resolves <code>#cooked</code>{" "}
            perfectly well once a second file exists in its filesystem — so a future version of this tour
            could run these. It is written down as a possible improvement rather than a limitation of the
            language.
          </p>
        </>
      ),
    },
    {
      slug: "native-calls",
      kind: "reference",
      title: "Native calls",
      summary: "What yapping actually is, and why you cannot add your own.",
      notRunnableReason:
        "these are fragments — aura is never declared and slorp waits on stdin — shown to illustrate the shape of a native call, not to run.",
      snippets: [
        `🚽 Every built-in is a native call, and native calls are ordinary
🚽 expressions — usable wherever a value of that type fits.
cap ok = bet(aura > 0);
rizz n = slorp();`,
      ],
      Body: () => (
        <>
          <p>
            <code>yapping</code>, <code>slorp</code>, <code>bet</code>, <code>ragequit</code> and{" "}
            <code>chill</code> are not statements built into the grammar — they are <em>native calls</em>,
            functions the runtime provides. That is why they behave like functions: they take typed arguments,
            they return values you can use, and they are type-checked before the program runs. The same is true
            of the string library (<code>yaplen</code>, <code>yapcat</code>, …) and the file I/O library you
            met in the previous chapter.
          </p>
          <p>
            You have already seen that checking bite: <code>bet(1, "…")</code> is rejected because argument one
            must be a <code>cap</code>, and a <code>cap</code>-returning call cannot be used where an integer
            is expected. Those are the native-call signatures being enforced, not special-case rules.
          </p>
          <p>
            What you cannot do is add your own. Brainrot has no <code>extern</code>: every native call is one
            the runtime ships. Two placeholder keywords that once hinted otherwise — <code>whopper</code>{" "}
            (<code>extern</code>) and <code>cringe</code> (<code>goto</code>) — were reserved but never wired
            up, and v0.4.0 removed them outright, so both are ordinary identifiers now. New native functions
            come from the interpreter's standard library, not from Brainrot source.
          </p>
        </>
      ),
    },
    {
      slug: "limitations",
      kind: "reference",
      title: "Current limitations",
      summary: "Everything this tour had to warn you about, in one place.",
      notRunnableReason:
        "this is an index of things that do not work, so there is nothing here worth running — each entry has a lesson that demonstrates it.",
      snippets: [
        `🚽 A sample of what is on this page — none of it does what it looks like:
p.x = p.x + 1;      🚽 a field cannot be incremented
grind;              🚽 continue does not parse
edgy (!(a < b))     🚽 ! does not negate
bussin 7;           🚽 in main: no exit code, no early return`,
      ],
      Body: () => (
        <>
          <p>
            The tour has been honest about the rough edges as they came up. Here they all are together — useful
            when something you are writing behaves impossibly, and a reasonable measure of where the language
            is.
          </p>
          <p className="text-sm text-gray-400">
            Each of these is checked in CI against the interpreter this site runs. When one gets fixed, the
            check fails and the lesson gets rewritten — so a stale entry here is a build failure rather than a
            lie you would have to discover yourself.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            {LIMITATIONS.map((limitation) => (
              <li key={limitation.text}>
                {limitation.text}{" "}
                <Link
                  to={`/tour/${limitation.lesson}`}
                  className="text-purple-400 hover:text-purple-300 text-sm whitespace-nowrap"
                >
                  → lesson
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6">
            Two of these are worth reporting rather than working around, if you have the appetite: <code>!</code>{" "}
            silently failing to negate, and <code>bussin</code> being ignored inside <code>main</code>. Both are
            small, self-contained, and have reproductions sitting in this repository's{" "}
            <code>claims.js</code>.
          </p>
          <p>
            None of this is a reason not to write Brainrot. It is a joke language that grew a semantic
            analyser, bounds checking and typed native calls; the surprising thing is how much of it works.
          </p>
        </>
      ),
    },
  ],
};
