// src/tour/content/userDefinedTypes.tsx
//
// The "Your Own Types" chapter: gang, chungus, gyatt and lit.
//
// Struct field access used to carry a restriction the reference manual did
// not mention: an expression could hold at most one field access, which
// ruled out `p.x + p.y` and even `p.x = p.x + 1`. That restriction was
// lifted as of v0.1.7 (see src/tour/programs/claims.js), so the
// "one-field-at-a-time" lesson now demonstrates the forms that used to fail
// rather than working around them.
//
// `lit` lives here rather than in Basics because `lit gang Point Coord;` is
// the reason the feature exists; aliasing `rizz` alone is a curiosity.

import type { TourChapter } from "../types";
import { Snippet } from "../Snippet";
import programs from "../programs";

const chapterPrograms = programs["your-own-types"];

export const userDefinedTypesChapter: TourChapter = {
  id: "your-own-types",
  title: "Your Own Types",
  lessons: [
    {
      slug: "gang",
      kind: "demo",
      title: "gang",
      summary: "Group several values under one name.",
      program: chapterPrograms.gang,
      Body: () => (
        <>
          <p>
            <code>gang</code> is <code>struct</code>: a type of your own, made of named fields. Define it at
            the top level, above every function, and end the definition with <code>{"};"}</code> — the
            semicolon is part of it.
          </p>
          <Snippet>{`gang Point {
    rizz x;
    rizz y;
};`}</Snippet>
          <p>
            Declare a variable of that type with <code>gang Point p;</code> and reach a field with{" "}
            <code>.</code>, exactly as in C. Every field starts at zero, so a fresh struct is never full of
            rubbish.
          </p>
          <p>
            Two limits to know now. A <code>gang</code> can only be <em>defined</em> at the top level — inside
            a function body it is a syntax error. And there are no arrays of structs:{" "}
            <code>gang Point ps[2];</code> does not parse, so a collection of structs has to be separate
            variables in this release.
          </p>
        </>
      ),
    },
    {
      slug: "initializers",
      kind: "demo",
      title: "Struct initialisers",
      summary: "Fill every field at once, in declaration order.",
      program: chapterPrograms.initializers,
      Body: () => (
        <>
          <p>
            A braced list initialises the fields in the order they were declared — no field names, just
            position.
          </p>
          <Snippet>{`gang Point p = {3, 4, 1.5};`}</Snippet>
          <p>
            Fields can be of different types, and <code>maxxing</code> on the variable reports the whole
            struct's size. That size is the sum of its fields (plus any padding), which is the thing worth
            comparing against <code>chungus</code> later in this chapter.
          </p>
        </>
      ),
    },
    {
      slug: "one-field-at-a-time",
      kind: "demo",
      title: "Fields in expressions",
      summary: "Struct fields behave like any other value — this release lifted the old restriction.",
      program: chapterPrograms["one-field-at-a-time"],
      Body: () => (
        <>
          <p>
            Reading and writing fields works exactly the way it looks like it should: a field can appear
            anywhere a plain variable can, combined with other fields, assigned from an expression that reads
            the same field, or compared directly.
          </p>
          <Snippet>{`yapping("%d", p.x + p.y);   🚽 two fields in one expression
p.x = p.x + 1;               🚽 a field on both sides of an assignment
t = p.y;                     🚽 a field read into an existing variable
edgy (p.x > p.y) { ... }     🚽 a field on each side of a comparison`}</Snippet>
          <p className="text-sm text-gray-400">
            This is new: earlier Brainrot releases allowed at most one field access per expression, and broke
            silently rather than refusing to parse — <code>p.x + p.y</code> would print <code>0</code>,
            exit 0, and complain only on stderr. That restriction is gone as of v0.1.7, checked against the
            shipped interpreter in CI, so this lesson cannot go stale the way the old one could.
          </p>
        </>
      ),
    },
    {
      slug: "nested",
      kind: "demo",
      title: "Nested aggregates",
      summary: "A struct whose fields are structs.",
      program: chapterPrograms.nested,
      Body: () => (
        <>
          <p>
            A field can be any type already defined above it, including another <code>gang</code> or a{" "}
            <code>chungus</code>. Access chains with <code>.</code> as deeply as the nesting goes.
          </p>
          <Snippet>{`gang Line {
    gang Point start;
    gang Point end;
};

gang Line l = { {1, 2}, {3, 4} };   🚽 braces inside braces
l.end.y = 40;`}</Snippet>
          <p>
            The nested initialiser needs its own braces: the flattened{" "}
            <code>{"gang Line l = {1, 2, 3, 4};"}</code> is rejected, with a message that tells you which
            field wanted braces.
          </p>
          <p>
            A struct cannot contain <em>itself</em> by value — it would have no finite size, and the
            interpreter says so plainly. A self-referencing pointer field is allowed to declare, but reaching
            through it (<code>a.ptr.b</code>) is not supported, so linked structures are out of reach in this
            release.
          </p>
        </>
      ),
    },
    {
      slug: "with-functions",
      kind: "demo",
      title: "Structs and functions",
      summary: "Passing one in, and why nothing comes back out.",
      program: chapterPrograms["with-functions"],
      Body: () => (
        <>
          <p>
            A struct can be a parameter. It arrives as a <strong>copy</strong>, so writes inside the function
            never reach the caller's variable — C's by-value semantics, with no way to opt out.
          </p>
          <Snippet>{`rizz across(gang Point p) {
    bussin p.x;          🚽 one field, returned: fine
}

skibidi relocate(gang Point p) {
    p.x = 99;            🚽 writes the copy, not the caller's Point
}`}</Snippet>
          <p>
            There is no opting out because <strong>struct pointer parameters do not work</strong>:{" "}
            <code>gang Point *p</code> parses, but assigning through it is rejected. So the call-by-reference trick from
            the pointers chapter is unavailable for structs.
          </p>
          <p>
            With no way to write back through a struct parameter, the practical shape is: keep structs in{" "}
            <code>main</code>, pass <em>fields</em> into functions as plain numbers, and let functions return
            plain numbers. The exercise at the end of this chapter is built that way, and it is not a
            stylistic preference — it is the only arrangement that reliably works.
          </p>
        </>
      ),
    },
    {
      slug: "chungus",
      kind: "demo",
      title: "chungus",
      summary: "One piece of storage, several ways to read it.",
      program: chapterPrograms.chungus,
      Body: () => (
        <>
          <p>
            <code>chungus</code> is <code>union</code>. It looks like a <code>gang</code>, but all its fields
            share the <em>same</em> storage: writing one and reading another reinterprets the same bytes.
          </p>
          <Snippet>{`chungus Either {
    rizz whole;
    chad fraction;
};`}</Snippet>
          <p>
            The program below makes the difference concrete: the <code>gang</code> with those two fields is 8
            bytes, the <code>chungus</code> is 4 — one slot, not two. Write{" "}
            <code>1065353216</code> as an integer, read it as a <code>chad</code>, and out comes{" "}
            <code>1.0</code>: that integer is what <code>1.0</code> looks like as raw float bits.
          </p>
          <p>
            An initialiser must have <strong>exactly one</strong> value, since there is only one slot to fill.
            Passing two is an error rather than a silent truncation.
          </p>
          <p>
            Unions are for reinterpreting bytes and for saving space when only one field is meaningful at a
            time. Reading a field you did not write is legal here and tells you about representation, not about
            values.
          </p>
        </>
      ),
    },
    {
      slug: "gyatt",
      kind: "demo",
      title: "gyatt",
      summary: "Named integer constants.",
      program: chapterPrograms.gyatt,
      Body: () => (
        <>
          <p>
            <code>gyatt</code> is <code>enum</code>: a set of named integers. Values count up from zero unless
            you assign one, and assigning one restarts the counting from there.
          </p>
          <Snippet>{`gyatt Tier {
    MID,        🚽 0
    CERTIFIED,  🚽 1
    GOATED      🚽 2
};`}</Snippet>
          <p>
            Constants are plain <code>int</code>-valued names in the global namespace — not scoped to the enum,
            so it is <code>CERTIFIED</code> and never <code>Tier.CERTIFIED</code>. That also means{" "}
            <strong>constant names must be unique across every enum in the program</strong>; two enums both
            declaring <code>SAME</code> is an error.
          </p>
          <p>
            An enum-typed variable behaves like a <code>rizz</code>: print it with <code>%d</code>, compare
            it, switch on it with <code>ohio</code>, pass it to functions and return it. Which makes it the
            most usable of the custom types in this release — unlike structs, there are no restrictions to
            work around.
          </p>
        </>
      ),
    },
    {
      slug: "lit",
      kind: "demo",
      title: "Type aliases with lit",
      summary: "Give a type a second name — new in the release this site runs.",
      program: chapterPrograms.lit,
      Body: () => (
        <>
          <p>
            <code>lit</code> is <code>typedef</code>. Now that types have names like{" "}
            <code>gang Point</code> and <code>gyatt Tier</code>, it earns its keep: an alias drops the keyword
            and gives the type a name that reads the way you think about it.
          </p>
          <Snippet>{`lit gang Point Coord;
lit gyatt Tier Rank;
lit rizz Aura;

Coord here = {3, 4};    🚽 exactly a gang Point
Rank mine = CERTIFIED;  🚽 exactly a gyatt Tier`}</Snippet>
          <p>
            An alias is not a new type — it is the same type wearing a better label, interchangeable with the
            original everywhere, including as a parameter type, a return type, an array element, or the target
            of a pointer. You can alias an alias, and <code>maxxing</code> reports the same size either way.
          </p>
          <p className="mt-4 p-3 bg-amber-950/30 border border-amber-900 rounded-lg text-amber-200">
            <strong>
              <code>lit</code> only works at the top level.
            </strong>{" "}
            Inside a function body it is rejected with{" "}
            <code>lit declarations are only allowed at top level</code>. Declaring the same alias twice is an
            error too, and an alias cannot be named after a keyword.
          </p>
          <p className="text-sm text-gray-400">
            This is new: <code>lit</code> did not parse at all in the previous Brainrot release. The tour
            teaches the version this site actually runs, so it appeared here as soon as the pin moved.
          </p>
        </>
      ),
    },
    {
      slug: "profile",
      kind: "exercise",
      title: "Exercise: a cursed user profile",
      summary: "Put a struct, an enum and a function together.",
      program: chapterPrograms.profile,
      Body: () => (
        <>
          <p>
            A <code>Profile</code> holds an aura score and a tier. <code>main</code> already builds one per
            score and prints it; the classifier is missing.
          </p>
          <p className="mt-4 p-3 bg-purple-950/40 border border-purple-800 rounded-lg">
            <strong>Your turn.</strong> Make <code>tier_for</code> return <code>GOATED</code> above 9000,{" "}
            <code>CERTIFIED</code> above 100, and <code>MID</code> otherwise — so the three scores come out as
            tiers 0, 1 and 2. Then press <strong>Check</strong>.
          </p>
          <p>
            Notice how <code>main</code> is arranged: the function takes a plain <code>rizz</code>, not a{" "}
            <code>Profile</code>, and the struct field is filled from the result. That is the shape this
            chapter has been building towards, and the reason the exercise is comfortable to write.
          </p>
          <p className="text-sm text-gray-400">
            Chapter 2's warning still applies: return early with <code>bussin</code> only outside loops. There
            is no loop in <code>tier_for</code>, so plain early returns are fine here.
          </p>
        </>
      ),
    },
  ],
};
