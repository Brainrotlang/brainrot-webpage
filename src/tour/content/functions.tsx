// src/tour/content/functions.tsx
//
// Chapter 3: functions.
//
// The interesting lesson here is "Returning early". The ordinary C shape —
// return from inside a loop — is broken in the pinned interpreter, and it is
// the shape everyone reaches for first, so it gets a lesson of its own
// rather than a footnote. src/tour/programs/claims.js keeps that warning
// honest.

import type { TourChapter } from "../types";
import { Snippet } from "../Snippet";
import programs from "../programs";

const chapterPrograms = programs.functions;

export const functionsChapter: TourChapter = {
  id: "functions",
  title: "Functions",
  lessons: [
    {
      slug: "defining",
      kind: "demo",
      title: "Defining functions",
      summary: "Return type, name, parameters, body — and where they have to go.",
      program: chapterPrograms.defining,
      Body: () => (
        <>
          <p>
            A function is the return type, the name, the parameters in parentheses, and a braced body — C's
            shape again.
          </p>
          <Snippet>{`rizz double_rizz(rizz x) {
    bussin x * 2;
}`}</Snippet>
          <p>
            Use <code>skibidi</code> as the return type for a function that returns nothing, and call it as a
            statement of its own.
          </p>
          <p className="mt-4 p-3 bg-amber-950/30 border border-amber-900 rounded-lg text-amber-200">
            <strong>Two rules with sharp edges.</strong> Functions must be defined <em>before</em>{" "}
            <code>skibidi main</code> — there are no forward declarations, and a definition after{" "}
            <code>main</code> is <code>syntax error, … expecting end of file</code>. And a non-
            <code>skibidi</code> function must actually <code>bussin</code>: leave it out and the body runs{" "}
            <em>twice</em> while the call yields 0, which is a confusing afternoon if you do not know it.
          </p>
        </>
      ),
    },
    {
      slug: "parameters",
      kind: "demo",
      title: "Parameters and return values",
      summary: "Typed parameters, typed returns, and the cap that needs a variable.",
      program: chapterPrograms.parameters,
      Body: () => (
        <>
          <p>
            Every parameter is typed, and types can be mixed freely. The return type can be any of the
            primitives.
          </p>
          <Snippet>{`gigachad blend(rizz parts, gigachad factor) {
    bussin parts * factor;
}`}</Snippet>
          <p>
            A <code>cap</code>-returning function is the one to watch. It can return a comparison directly,
            but its <em>result</em> cannot be tested in place:
          </p>
          <Snippet>{`cap even = is_even(10);   🚽 fine
edgy (even) { ... }

edgy (is_even(10)) { ... }  🚽 rejected: bool in an integer context`}</Snippet>
          <p>
            Assign it to a <code>cap</code> first. The upstream reference's own example uses the second form,
            so this is worth remembering when copying code from the docs. Note also that a{" "}
            <code>rizz</code> function may not return a comparison — the types have to line up.
          </p>
        </>
      ),
    },
    {
      slug: "calls",
      kind: "demo",
      title: "Calling functions",
      summary: "A call is an expression, usable anywhere a value fits.",
      program: chapterPrograms.calls,
      Body: () => (
        <>
          <p>
            Calls nest, and they work anywhere a value works — as an argument, in a loop condition, inside
            arithmetic.
          </p>
          <Snippet>{`yapping("%d", twice(twice(5)));

flex (rizz i = 0; i < limit(); i++) {
    yappin("%d ", twice(i));
}`}</Snippet>
          <p>
            A call in a loop condition is re-evaluated every iteration, exactly as in C, so keep it cheap or
            hoist it into a variable.
          </p>
          <p>
            One thing the interpreter will not stop you doing: calling with the wrong number of arguments
            reports <code>Mismatched number of arguments and parameters</code> on stderr but still exits 0 and
            yields 0. Watch the stderr pane, not just the exit code.
          </p>
        </>
      ),
    },
    {
      slug: "scope",
      kind: "demo",
      title: "Scope",
      summary: "What a function can see, and what it cannot.",
      program: chapterPrograms.scope,
      Body: () => (
        <>
          <p>
            Variables declared inside a function are that call's own. A name used in two functions is two
            unrelated variables, and neither can see the other.
          </p>
          <p>
            There is no way to share a variable by declaring it outside a function either:{" "}
            <strong>global variables do not parse</strong> in this release. Everything a function needs comes
            in through its parameters, and everything it produces goes out through <code>bussin</code>.
          </p>
          <p>
            That is a real constraint rather than a style preference — it is why the exercises in this tour
            keep their state in <code>main</code> and pass values down.
          </p>
        </>
      ),
    },
    {
      slug: "returning-early",
      kind: "demo",
      title: "Returning early",
      summary: "The one C habit that breaks here, and the two shapes that work.",
      program: chapterPrograms["returning-early"],
      Body: () => (
        <>
          <p>
            Returning as soon as you know the answer is normal C, and it works here — as long as the{" "}
            <code>bussin</code> is not inside a loop.
          </p>
          <p className="mt-4 p-3 bg-amber-950/30 border border-amber-900 rounded-lg text-amber-200">
            <strong>
              A <code>bussin</code> inside a loop body is broken in this release.
            </strong>{" "}
            One call is enough to trigger it: the program stops with{" "}
            <code>Error: No scope to exit</code>, exits non-zero, and loses its output. It happens in{" "}
            <code>flex</code> and <code>goon</code> alike, whether the <code>bussin</code> sits directly in the
            loop or inside an <code>edgy</code> within it.
          </p>
          <Snippet>{`🚽 Broken — the shape every C programmer writes first:
flex (rizz i = 2; i < n; i++) {
    edgy ((n % i) == 0) { bussin i; }
}

🚽 Works — keep the answer, leave the loop, return once:
rizz found = 0;
flex (rizz i = 2; i < n; i++) {
    edgy ((n % i) == 0) {
        found = i;
        bruh;
    }
}
bussin found;`}</Snippet>
          <p>
            <code>bruh</code> inside a function's loop is itself fine — it is only the{" "}
            <code>bussin</code> that cannot cross the loop boundary. Recursion is unaffected, since the return
            is not inside a loop.
          </p>
          <p className="text-sm text-gray-400">
            This warning is checked in CI against the interpreter the site ships, so if a release fixes it,
            this lesson fails verification and gets rewritten instead of quietly misleading you.
          </p>
        </>
      ),
    },
    {
      slug: "recursion",
      kind: "demo",
      title: "Recursion",
      summary: "Functions that call themselves, and where the floor is.",
      program: chapterPrograms.recursion,
      Body: () => (
        <>
          <p>
            A function can call itself. Both examples below have the two parts every recursion needs: a base
            case that returns without recursing, and a step that moves towards it.
          </p>
          <Snippet>{`rizz fact(rizz n) {
    edgy (n <= 1) { bussin 1; }   🚽 base case
    bussin n * fact(n - 1);       🚽 step
}`}</Snippet>
          <p>
            Recursion sidesteps the previous lesson's problem neatly: the returns are not inside a loop, so
            early <code>bussin</code> works normally.
          </p>
          <p>
            There is a floor, though. Around a thousand nested calls the WebAssembly stack runs out and the run
            fails as a crashed program rather than a polite error. And <code>fib</code> as written below is
            exponential — asking for <code>fib(40)</code> will hit the tour's few-second cutoff, which is a
            performance lesson delivered the hard way.
          </p>
        </>
      ),
    },
    {
      slug: "prime-checker",
      kind: "exercise",
      title: "Exercise: prime checker",
      summary: "Write a cap-returning function, in the shape that actually runs.",
      program: chapterPrograms["prime-checker"],
      Body: () => (
        <>
          <p>
            <code>main</code> is already written: it walks 1 to 20, asks <code>is_prime</code> about each
            number, and prints the ones that pass. Only the function is missing.
          </p>
          <p className="mt-4 p-3 bg-purple-950/40 border border-purple-800 rounded-lg">
            <strong>Your turn.</strong> Make <code>is_prime</code> return <code>W</code> for primes and{" "}
            <code>L</code> otherwise, so the program prints <code>2 3 5 7 11 13 17 19</code>. Then press{" "}
            <strong>Check</strong>.
          </p>
          <p>
            Two things to keep in mind, both from earlier lessons: nothing below 2 is prime, and{" "}
            <strong>
              you cannot <code>bussin</code> from inside the loop
            </strong>{" "}
            — keep the answer in a <code>cap</code>, <code>bruh</code> out, and return once at the end.
          </p>
          <p className="text-sm text-gray-400">
            Testing divisors up to <code>i * i &lt;= n</code> is enough. Anything larger would already have
            been found paired with something smaller.
          </p>
        </>
      ),
    },
  ],
};
