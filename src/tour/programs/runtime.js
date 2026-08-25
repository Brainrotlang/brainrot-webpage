// src/tour/programs/runtime.js
//
// Programs for the "Runtime" chapter. See usingTheTour.js for why these live
// in CommonJS rather than TypeScript, and why nothing here is annotated.
//
// Two things this chapter documents were found by running programs rather
// than reading docs: `baka` takes exactly one string, and `bussin` inside
// `main` is ignored entirely — it neither sets an exit code nor stops
// execution. Both are in claims.js.

const bet = {
  starter: `skibidi main {
    rizz aura = 9001;

    🚽 A passing assertion is invisible: it just carries on.
    bet(aura > 0, "aura must be positive");
    yapping("aura is fine: %d", aura);

    🚽 bet hands back W when it passes, so it can be used as a value.
    cap checked = bet(aura > 9000, "must be over nine thousand");
    yapping("checked: %d", checked);

    bussin 0;
}
`,
  expect: { stdout: "aura is fine: 9001\nchecked: 1\n", exitCode: 0 },
};

const betFails = {
  starter: `skibidi main {
    rizz aura = 5;

    yapping("checking the vibes");

    🚽 This one does not hold. Everything after it is unreachable.
    bet(aura > 9000, "aura must be over nine thousand");

    yapping("never printed");

    bussin 0;
}
`,
  expect: {
    stdout: "checking the vibes\n",
    stderr: "Error: bet: assertion failed at line 7: aura must be over nine thousand\n",
    exitCode: 1,
  },
};

const errors = {
  starter: `skibidi main {
    rizz aura = -5;

    edgy (aura < 0) {
        🚽 baka writes to stderr — and takes exactly one string, no
        🚽 format arguments, so build the message before you print it.
        baka("that aura is negative, which is not a thing\\n");
        ragequit(1);
    }

    yapping("aura: %d", aura);

    bussin 0;
}
`,
  expect: {
    stderr: "that aura is negative, which is not a thing\n",
    exitCode: 1,
  },
};

const exitCodes = {
  starter: `skibidi main {
    yapping("leaving with code 3");

    🚽 ragequit stops the program immediately with the code you give it.
    ragequit(3);

    yapping("never printed");

    bussin 0;
}
`,
  expect: { stdout: "leaving with code 3\n", exitCode: 3 },
};

const chill = {
  starter: `skibidi main {
    yapping("thinking about it");

    chill(1);   🚽 one second, doing nothing

    yapping("ok fine");

    bussin 0;
}
`,
  expect: { stdout: "thinking about it\nok fine\n", exitCode: 0 },
};

module.exports = {
  bet,
  "bet-fails": betFails,
  errors,
  "exit-codes": exitCodes,
  chill,
};
