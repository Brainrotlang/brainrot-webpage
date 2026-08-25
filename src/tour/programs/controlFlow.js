// src/tour/programs/controlFlow.js
//
// Programs for the "Control Flow" chapter. See usingTheTour.js for why these
// live in CommonJS rather than TypeScript, and why nothing here is
// annotated.
//
// Every `expect` came out of `yarn verify:lessons`.

const edgy = {
  starter: `skibidi main {
    rizz aura = 9001;

    edgy (aura > 9000) {
        yapping("certified W");
    }

    bussin 0;
}
`,
  expect: { stdout: "certified W\n", exitCode: 0 },
};

const edgyAmogus = {
  starter: `skibidi main {
    rizz score = 42;

    edgy (score > 9000) {
        yapping("certified W");
    } amogus edgy (score > 100) {
        yapping("mid");
    } amogus {
        yapping("skill issue");
    }

    bussin 0;
}
`,
  expect: { stdout: "skill issue\n", exitCode: 0 },
};

const goon = {
  starter: `skibidi main {
    rizz i = 0;

    goon (i < 3) {
        yapping("i = %d", i);
        i++;
    }

    yapping("done, i = %d", i);

    bussin 0;
}
`,
  expect: { stdout: "i = 0\ni = 1\ni = 2\ndone, i = 3\n", exitCode: 0 },
};

// The one lesson that is *supposed* to hit the watchdog. Nothing about its
// output is asserted: the worker is terminated mid-run, so there is no exit
// code and no reliable stdout — which is exactly what the lesson is about.
const neverEndingGoon = {
  starter: `skibidi main {
    yapping("this line runs, and then nothing else ever does");

    🚽 A goon that never stops. Nothing in here changes the condition.
    goon (W) {
    }

    yapping("unreachable");

    bussin 0;
}
`,
  expect: { exitCode: -1, timedOut: true },
};

const flex = {
  starter: `skibidi main {
    flex (rizz i = 1; i <= 3; i++) {
        yapping("attempt %d", i);
    }

    🚽 The counter can also be declared outside the loop.
    rizz j;
    flex (j = 3; j > 0; j--) {
        yapping("countdown %d", j);
    }

    bussin 0;
}
`,
  expect: {
    stdout: "attempt 1\nattempt 2\nattempt 3\ncountdown 3\ncountdown 2\ncountdown 1\n",
    exitCode: 0,
  },
};

const mewing = {
  starter: `skibidi main {
    rizz tries = 0;

    mewing {
        tries++;
        yapping("try %d", tries);
    } goon (tries < 3);

    🚽 The body runs before the condition is ever checked, so it runs at
    🚽 least once even when the condition is false from the start.
    rizz plenty = 10;
    mewing {
        yapping("ran anyway, plenty = %d", plenty);
    } goon (plenty < 5);

    bussin 0;
}
`,
  expect: {
    stdout: "try 1\ntry 2\ntry 3\nran anyway, plenty = 10\n",
    exitCode: 0,
  },
};

const bruh = {
  starter: `skibidi main {
    flex (rizz i = 0; i < 10; i++) {
        edgy (i == 3) {
            bruh;
        }
        yapping("%d", i);
    }

    yapping("out of the loop");

    bussin 0;
}
`,
  expect: { stdout: "0\n1\n2\nout of the loop\n", exitCode: 0 },
};

const ohio = {
  starter: `skibidi main {
    rizz tier = 2;

    ohio (tier) {
        sigma rule 1:
            yapping("mid");
            bruh;
        sigma rule 2:
            yapping("certified");
            bruh;
        based:
            yapping("unrecognised tier");
    }

    bussin 0;
}
`,
  expect: { stdout: "certified\n", exitCode: 0 },
};

const fizzbuzz = {
  starter: `skibidi main {
    flex (rizz i = 1; i <= 15; i++) {
        🚽 Print "FizzBuzz" when i divides by 15, "Fizz" when it divides by
        🚽 3, "Buzz" when it divides by 5, and the number itself otherwise.
        yapping("%d", i);
    }

    bussin 0;
}
`,
  solution: `skibidi main {
    flex (rizz i = 1; i <= 15; i++) {
        edgy ((i % 15) == 0) {
            yapping("FizzBuzz");
        } amogus edgy ((i % 3) == 0) {
            yapping("Fizz");
        } amogus edgy ((i % 5) == 0) {
            yapping("Buzz");
        } amogus {
            yapping("%d", i);
        }
    }

    bussin 0;
}
`,
  expect: {
    stdout: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n",
    exitCode: 0,
  },
};

module.exports = {
  edgy,
  "edgy-amogus": edgyAmogus,
  goon,
  "never-ending-goon": neverEndingGoon,
  flex,
  mewing,
  bruh,
  ohio,
  fizzbuzz,
};
