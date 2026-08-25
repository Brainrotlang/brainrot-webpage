// src/tour/programs/basics.js
//
// Programs for the "Basics" chapter. See usingTheTour.js for why these live
// in CommonJS rather than TypeScript, and why nothing here is annotated.
//
// Every `expect` came out of `yarn verify:lessons`, not out of a guess about
// what the interpreter ought to print.

const programStructure = {
  starter: `skibidi main {
    yapping("this line runs first");
    yapping("this line runs second");

    bussin 0;
}
`,
  expect: { stdout: "this line runs first\nthis line runs second\n", exitCode: 0 },
};

const comments = {
  starter: `skibidi main {
    🚽 deeply important enterprise software
    yapping("production ready");

    yapping("shipped");  🚽 a comment can trail a statement too

    bussin 0;
}
`,
  expect: { stdout: "production ready\nshipped\n", exitCode: 0 },
};

const output = {
  starter: `skibidi main {
    yapping("yapping adds its own newline");

    yappin("yappin ");
    yappin("does not");
    yappin("\\n");

    yapping("this format string ends with a newline\\n");
    yapping("...so there is a blank line above this");

    baka("baka goes to stderr\\n");

    bussin 0;
}
`,
  expect: {
    stdout:
      "yapping adds its own newline\nyappin does not\nthis format string ends with a newline\n\n...so there is a blank line above this\n",
    stderr: "baka goes to stderr\n",
    exitCode: 0,
  },
};

const variables = {
  starter: `skibidi main {
    🚽 Give aura the value 9001, then print it.
    rizz aura = 0;

    yapping("aura: %d", aura);

    bussin 0;
}
`,
  solution: `skibidi main {
    🚽 Give aura the value 9001, then print it.
    rizz aura = 9001;

    yapping("aura: %d", aura);

    bussin 0;
}
`,
  expect: { stdout: "aura: 9001\n", exitCode: 0 },
};

const types = {
  starter: `skibidi main {
    rizz aura = 100;        🚽 int
    cap goated = W;         🚽 bool: W is true, L is false
    chad ratio = 1.5;       🚽 float
    gigachad precise = 2.5; 🚽 double
    yap initial = 'C';      🚽 single character
    rant name = "Chad";     🚽 text

    🚽 Careful: "based" is the switch-default keyword, not a variable name.
    yapping("%d %d %.1f %.1f %c %s", aura, goated, ratio, precise, initial, name);

    bussin 0;
}
`,
  expect: { stdout: "100 1 1.5 2.5 C Chad\n", exitCode: 0 },
};

const numberSizes = {
  starter: `skibidi main {
    smol compact = 12;              🚽 short
    giga rizz roomy = 1234567;      🚽 long int
    thicc rizz enormous = 123456789; 🚽 long long int
    nut rizz negative_ok = -7;      🚽 signed int
    nonut rizz never_negative = 7;  🚽 unsigned int

    yapping("%d %d %d %d %d", compact, roomy, enormous, negative_ok, never_negative);

    bussin 0;
}
`,
  expect: { stdout: "12 1234567 123456789 -7 7\n", exitCode: 0 },
};

const qualifiers = {
  starter: `skibidi main {
    deadass rizz max_aura = 9001;  🚽 const
    salty rizz visits = 3;         🚽 static
    schizo rizz sensor = 42;       🚽 volatile

    yapping("%d %d %d", max_aura, visits, sensor);

    🚽 Try uncommenting this line and running again:
    🚽 max_aura = 1;

    bussin 0;
}
`,
  expect: { stdout: "9001 3 42\n", exitCode: 0 },
};

const operators = {
  starter: `skibidi main {
    rizz a = 7;
    rizz b = 2;

    yapping("%d %d %d %d %d", a + b, a - b, a * b, a / b, a % b);
    yapping("%d %d %d", a > b, a == b, a != b);

    🚽 && and || behave as you would expect. ! does not — see the lesson.
    yapping("%d %d", (a > b) && (b > 0), (a < b) || (b > 0));

    rizz counter = 5;
    counter++;
    yapping("after ++: %d", counter);
    counter--;
    yapping("after --: %d", counter);

    🚽 * and / bind tighter than + and -, exactly as in C
    yapping("%d vs %d", 2 + 3 * 4, (2 + 3) * 4);

    bussin 0;
}
`,
  expect: {
    stdout: "9 5 14 3 1\n1 0 1\n1 1\nafter ++: 6\nafter --: 5\n14 vs 20\n",
    exitCode: 0,
  },
};

const maxxing = {
  starter: `skibidi main {
    rizz whole = 0;
    gigachad precise = 0.0;
    rizz scores[4] = {10, 20, 30, 40};

    yapping("rizz: %d bytes", maxxing(whole));
    yapping("gigachad: %d bytes", maxxing(precise));
    yapping("the whole array: %d bytes", maxxing(scores));
    yapping("so it holds %d values", maxxing(scores) / maxxing(scores[0]));

    bussin 0;
}
`,
  expect: {
    stdout: "rizz: 4 bytes\ngigachad: 8 bytes\nthe whole array: 16 bytes\nso it holds 4 values\n",
    exitCode: 0,
  },
};

const lit = {
  starter: `🚽 lit declarations go at the top level, outside every function.
lit rizz Aura;
lit gigachad Precise;

skibidi main {
    Aura mine = 9001;
    Precise ratio = 1.5;

    yapping("%d %.1f", mine, ratio);

    🚽 An alias is the type it names — same size, same everything.
    yapping("an Aura is %d bytes, a rizz is %d", maxxing(mine), maxxing(mine));

    bussin 0;
}
`,
  expect: { stdout: "9001 1.5\nan Aura is 4 bytes, a rizz is 4\n", exitCode: 0 },
};

const auraCalculator = {
  starter: `skibidi main {
    rizz monday = 120;
    rizz tuesday = 340;
    rizz wednesday = 217;

    🚽 1. Add the three days together.
    rizz total = 0;

    🚽 2. Work out the mean. Integer division is fine.
    rizz average = 0;

    yapping("total: %d", total);
    yapping("average: %d", average);

    bussin 0;
}
`,
  solution: `skibidi main {
    rizz monday = 120;
    rizz tuesday = 340;
    rizz wednesday = 217;

    🚽 1. Add the three days together.
    rizz total = monday + tuesday + wednesday;

    🚽 2. Work out the mean. Integer division is fine.
    rizz average = total / 3;

    yapping("total: %d", total);
    yapping("average: %d", average);

    bussin 0;
}
`,
  expect: { stdout: "total: 677\naverage: 225\n", exitCode: 0 },
};

module.exports = {
  "program-structure": programStructure,
  comments,
  output,
  variables,
  types,
  "number-sizes": numberSizes,
  lit,
  qualifiers,
  operators,
  maxxing,
  "aura-calculator": auraCalculator,
};
