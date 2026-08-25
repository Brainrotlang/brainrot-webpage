// src/tour/programs/basics.js
//
// Programs for the "Basics" chapter. See usingTheTour.js for why these live
// in CommonJS rather than TypeScript.

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

module.exports = { variables, types };
