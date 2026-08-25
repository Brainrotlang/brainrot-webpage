// src/tour/content/pointers.tsx
//
// The "Pointers" chapter.
//
// The best-supported advanced feature in the language — every shape in this
// chapter worked on the first run, which is not something the struct chapter
// could say. The two rough edges are that a pointer must be initialised at
// its declaration, and that pointer arithmetic is unchecked where array
// indexing is checked.

import type { TourChapter } from "../types";
import { Snippet } from "../Snippet";
import programs from "../programs";

const chapterPrograms = programs.pointers;

export const pointersChapter: TourChapter = {
  id: "pointers",
  title: "Pointers",
  lessons: [
    {
      slug: "addresses",
      kind: "demo",
      title: "Addresses",
      summary: "& takes one, and a pointer variable holds one.",
      program: chapterPrograms.addresses,
      Body: () => (
        <>
          <p>
            Every variable lives somewhere. <code>&</code> gives you that somewhere, and a pointer is a
            variable that holds one — declared with a <code>*</code> after the type.
          </p>
          <Snippet>{`rizz aura = 69;
rizz *slot = &aura;   🚽 slot points at aura

yapping("%d", *slot); 🚽 69 — follow the pointer to read`}</Snippet>
          <p>
            <code>*</code> in a declaration means "pointer to"; <code>*</code> in an expression means "follow
            this". Same character, two jobs, and telling them apart is most of learning pointers.
          </p>
          <p className="mt-4 p-3 bg-amber-950/30 border border-amber-900 rounded-lg text-amber-200">
            <strong>A pointer must be given something to point at when it is declared.</strong>{" "}
            <code>rizz *slot;</code> on its own is rejected. C would have let you declare it uninitialised and
            crash later, so this is the language doing you a favour.
          </p>
        </>
      ),
    },
    {
      slug: "writing",
      kind: "demo",
      title: "Writing through a pointer",
      summary: "The reason pointers are worth the trouble.",
      program: chapterPrograms.writing,
      Body: () => (
        <>
          <p>
            A dereference works on the left of an assignment too. Writing through a pointer changes the
            variable it points at — which is the whole point of having one.
          </p>
          <Snippet>{`rizz aura = 1;
rizz *slot = &aura;

*slot = 9001;    🚽 aura is now 9001`}</Snippet>
          <p>
            The pointer itself is also just a variable, so it can be re-pointed. Note the difference:{" "}
            <code>slot = &other</code> changes where the pointer looks, while <code>*slot = 50</code> changes
            what is there. One star, entirely different outcome.
          </p>
        </>
      ),
    },
    {
      slug: "pointer-to-pointer",
      kind: "demo",
      title: "Pointers to pointers",
      summary: "Another level of indirection, and how to read it.",
      program: chapterPrograms["pointer-to-pointer"],
      Body: () => (
        <>
          <p>
            A pointer can point at a pointer. Add a star per level, going in and coming out — Brainrot allows
            as many as you can stand.
          </p>
          <Snippet>{`rizz aura = 5;
rizz *slot = &aura;
rizz **handle = &slot;

**handle = 42;   🚽 aura is now 42`}</Snippet>
          <p>
            Read it right to left: <code>handle</code> holds the address of <code>slot</code>, which holds the
            address of <code>aura</code>. Two stars go all the way down to the number.
          </p>
          <p>
            One level is common. Two shows up when a function needs to change which thing a caller's pointer
            points at. Beyond that, reconsider.
          </p>
        </>
      ),
    },
    {
      slug: "call-by-reference",
      kind: "demo",
      title: "Call by reference",
      summary: "Letting a function change its caller's variable.",
      program: chapterPrograms["call-by-reference"],
      Body: () => (
        <>
          <p>
            Arguments are copies, so a function that takes a <code>rizz</code> cannot change the caller's
            <code>rizz</code>. Pass the address instead and it can:
          </p>
          <Snippet>{`skibidi bump(rizz *value) {
    *value = *value + 1;
}

bump(&aura);   🚽 aura really does go up`}</Snippet>
          <p>
            The program below runs both versions back to back so the difference is visible rather than
            asserted. This is also the standard way to return more than one value: pass a pointer per result.
          </p>
          <p>
            It works for every primitive type. It does <em>not</em> work for structs — a{" "}
            <code>gang</code>-typed pointer parameter cannot be written through, as the types chapter covers.
            Numbers and characters only.
          </p>
        </>
      ),
    },
    {
      slug: "arithmetic",
      kind: "demo",
      title: "Pointer arithmetic",
      summary: "Stepping through an array a pointer at a time.",
      program: chapterPrograms.arithmetic,
      Body: () => (
        <>
          <p>
            Adding to a pointer moves it by <em>elements</em>, not bytes. Pointed at an array, adding one lands
            on the next value regardless of how wide the type is.
          </p>
          <Snippet>{`rizz aura[3] = {10, 20, 30};
rizz *walker = &aura[0];

walker = walker + 1;
yapping("%d", *walker);   🚽 20`}</Snippet>
          <p>
            Indexing is clearer for walking an array, and it is bounds-checked. Pointer arithmetic is worth
            knowing because it explains what indexing <em>is</em>.
          </p>
          <p className="mt-4 p-3 bg-amber-950/30 border border-amber-900 rounded-lg text-amber-200">
            <strong>Pointer arithmetic is not bounds-checked.</strong> <code>aura[5]</code> on a
            two-element array stops the program with a clear error; <code>walker + 5</code> quietly reads
            whatever is at that address and carries on. The safety net from the arrays chapter does not extend
            here, so stay inside arrays you know the length of.
          </p>
        </>
      ),
    },
    {
      slug: "swap",
      kind: "exercise",
      title: "Exercise: swap two values",
      summary: "The classic that only works with pointers.",
      program: chapterPrograms.swap,
      Body: () => (
        <>
          <p>
            <code>swap</code> receives the addresses of two variables and should exchange their values.{" "}
            <code>main</code> is already written and prints before and after.
          </p>
          <p className="mt-4 p-3 bg-purple-950/40 border border-purple-800 rounded-lg">
            <strong>Your turn.</strong> Fill in <code>swap</code> so the output ends{" "}
            <code>after: 2 1</code>, then press <strong>Check</strong>.
          </p>
          <p>
            You will need somewhere to keep the first value while you move the second — assigning one to the
            other first loses it. This is the exercise where pointers stop feeling abstract: without them
            there is no way to write this function at all.
          </p>
        </>
      ),
    },
  ],
};
