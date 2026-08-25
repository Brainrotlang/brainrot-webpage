// src/tour/programs/pointers.js
//
// Programs for the "Pointers" chapter. See usingTheTour.js for why these live
// in CommonJS rather than TypeScript, and why nothing here is annotated.
//
// Pointers are one of the better-supported corners of the language: every
// shape below worked first time. The two rough edges — a pointer must be
// initialised at its declaration, and pointer arithmetic is unchecked where
// array indexing is checked — are in claims.js.

const addresses = {
  starter: `skibidi main {
    rizz aura = 69;

    🚽 & is "the address of". A pointer variable holds one.
    rizz *slot = &aura;

    🚽 %d prints the value; the address itself is not worth printing.
    yapping("aura is %d", aura);
    yapping("through the pointer: %d", *slot);

    bussin 0;
}
`,
  expect: { stdout: "aura is 69\nthrough the pointer: 69\n", exitCode: 0 },
};

const writing = {
  starter: `skibidi main {
    rizz aura = 1;
    rizz *slot = &aura;

    🚽 Writing through the pointer changes the original variable.
    *slot = 9001;

    yapping("aura is now %d", aura);

    🚽 A pointer can be pointed somewhere else entirely.
    rizz other = 5;
    slot = &other;
    *slot = 50;

    yapping("aura %d, other %d", aura, other);

    bussin 0;
}
`,
  expect: { stdout: "aura is now 9001\naura 9001, other 50\n", exitCode: 0 },
};

const pointerToPointer = {
  starter: `skibidi main {
    rizz aura = 5;
    rizz *slot = &aura;
    rizz **handle = &slot;

    🚽 One star per level of indirection, going in and coming out.
    yapping("%d %d %d", aura, *slot, **handle);

    **handle = 42;
    yapping("aura is now %d", aura);

    bussin 0;
}
`,
  expect: { stdout: "5 5 5\naura is now 42\n", exitCode: 0 },
};

const callByReference = {
  starter: `🚽 A pointer parameter lets a function change the caller's variable.
skibidi bump(rizz *value) {
    *value = *value + 1;
}

🚽 Without the pointer, the function only ever sees a copy.
skibidi bump_copy(rizz value) {
    value = value + 1;
}

skibidi main {
    rizz aura = 10;

    bump_copy(aura);
    yapping("after bump_copy: %d", aura);

    bump(&aura);
    yapping("after bump:      %d", aura);

    bussin 0;
}
`,
  expect: { stdout: "after bump_copy: 10\nafter bump:      11\n", exitCode: 0 },
};

const arithmetic = {
  starter: `skibidi main {
    rizz aura[3] = {10, 20, 30};

    rizz *walker = &aura[0];
    yapping("first: %d", *walker);

    🚽 Adding one moves to the next element, not the next byte.
    walker = walker + 1;
    yapping("second: %d", *walker);

    walker = walker + 1;
    yapping("third: %d", *walker);

    🚽 A pointer is the same size whatever it points at.
    yapping("a pointer is %d bytes", maxxing(walker));

    bussin 0;
}
`,
  expect: {
    stdout: "first: 10\nsecond: 20\nthird: 30\na pointer is 4 bytes\n",
    exitCode: 0,
  },
};

const swap = {
  starter: `skibidi swap(rizz *a, rizz *b) {
    🚽 Exchange the two values through the pointers.
    🚽 You will need somewhere to put the first one while you move the second.
}

skibidi main {
    rizz x = 1;
    rizz y = 2;

    yapping("before: %d %d", x, y);
    swap(&x, &y);
    yapping("after:  %d %d", x, y);

    bussin 0;
}
`,
  solution: `skibidi swap(rizz *a, rizz *b) {
    rizz held = *a;
    *a = *b;
    *b = held;
}

skibidi main {
    rizz x = 1;
    rizz y = 2;

    yapping("before: %d %d", x, y);
    swap(&x, &y);
    yapping("after:  %d %d", x, y);

    bussin 0;
}
`,
  expect: { stdout: "before: 1 2\nafter:  2 1\n", exitCode: 0 },
};

module.exports = {
  addresses,
  writing,
  "pointer-to-pointer": pointerToPointer,
  "call-by-reference": callByReference,
  arithmetic,
  swap,
};
