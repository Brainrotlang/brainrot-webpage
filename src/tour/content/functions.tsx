// src/tour/content/functions.tsx
//
// The "Functions" chapter.
//
// "Returning early" was once the interesting lesson here: return from inside
// a loop — the shape everyone reaches for first — was broken in the pinned
// interpreter. It works as of v0.3.0, so the lesson now teaches the shape
// directly. src/tour/programs/claims.js is what caught the fix and forced
// the rewrite instead of letting the old warning quietly mislead.

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
            <code>skibidi</code> function must actually <code>bussin</code>: leave it out and the call{" "}
            <em>silently</em> yields 0 — no error, no warning — which is a confusing afternoon if you do not
            know it.
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
            A <code>cap</code>-returning function can return a comparison directly, and its result can be
            tested in place or kept in a <code>cap</code> first — both work:
          </p>
          <Snippet>{`edgy (is_even(10)) { ... }   🚽 fine

cap even = is_even(10);      🚽 also fine
edgy (even) { ... }`}</Snippet>
          <p>
            Testing the call in place was rejected in earlier releases and is fine as of v0.3.0. Note that a{" "}
            <code>rizz</code> function may not return a comparison, though — the types still have to line up.
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
      summary: "Return the moment you know the answer — including from inside a loop.",
      program: chapterPrograms["returning-early"],
      Body: () => (
        <>
          <p>
            Returning as soon as you know the answer is normal C, and it works here — a chain of guards at the
            top of a function, or a <code>bussin</code> in the middle of the body, both do what they look like.
          </p>
          <p>
            That includes returning from <em>inside a loop</em>: the natural search shape, where you return on
            the first match and fall through to a default if the loop finds nothing.
          </p>
          <Snippet>{`rizz first_divisor(rizz n) {
    flex (rizz i = 2; i < n; i++) {
        edgy ((n % i) == 0) {
            bussin i;      🚽 return on the first hit
        }
    }
    bussin 0;              🚽 nothing found
}`}</Snippet>
          <p>
            <code>bruh</code> (break) still works inside a function's loop too, if you would rather leave the
            loop and return once at the end — but you no longer have to.
          </p>
          <p className="text-sm text-gray-400">
            Earlier releases could not do this: a <code>bussin</code> inside a loop failed with{" "}
            <code>Error: No scope to exit</code>. It works as of v0.3.0, verified in CI against the interpreter
            the site ships — the check is what forced this lesson to be rewritten rather than left misleading.
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
            Early <code>bussin</code> works normally inside a recursive function — the base case returns as
            soon as it is reached, exactly like the search in the previous lesson.
          </p>
          <p className="mt-4 p-3 bg-amber-950/30 border border-amber-900 rounded-lg text-amber-200">
            <strong>There is a floor, and it is closer than it looks.</strong> Past about 84 nested calls the
            run crashes — the stack overflows and the program stops with <code>memory access out of bounds</code>,
            no result. 84 levels is not a deliberately extreme case; ordinary recursive code can reach it by
            accident.
          </p>
          <p>
            <code>fib</code> as written below is a different hazard: it is exponential, so asking for{" "}
            <code>fib(40)</code> does not run out of stack — its depth is small — it just does too much work
            and hits the run timeout instead. Two different walls, reached two different ways.
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
            One thing to keep in mind from an earlier lesson: nothing below 2 is prime. And you can{" "}
            <code>bussin</code> straight out of the loop the moment you find a divisor — no need to stash the
            answer and break.
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
