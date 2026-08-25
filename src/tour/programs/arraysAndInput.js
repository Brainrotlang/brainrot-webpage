// src/tour/programs/arraysAndInput.js
//
// Programs for the "Arrays, Text and Input" chapter. See usingTheTour.js for
// why these live in CommonJS rather than TypeScript, and why nothing here is
// annotated.
//
// Arrays are noticeably more capable than structs: `a[0] + a[1]` works,
// where `p.x + p.y` does not. Every stdin lesson ships with its input
// pre-filled, because slorp on empty input is a hard error.

const arrays = {
  starter: `skibidi main {
    rizz scores[3];         🚽 three slots, all starting at zero
    yapping("fresh: %d %d %d", scores[0], scores[1], scores[2]);

    scores[0] = 42;
    scores[2] = 9001;
    yapping("set:   %d %d %d", scores[0], scores[1], scores[2]);

    🚽 Or fill every slot at the declaration.
    rizz aura[4] = {10, 20, 30, 40};
    yapping("init:  %d %d", aura[1], aura[3]);

    bussin 0;
}
`,
  expect: {
    stdout: "fresh: 0 0 0\nset:   42 0 9001\ninit:  20 40\n",
    exitCode: 0,
  },
};

const loops = {
  starter: `skibidi main {
    rizz aura[5] = {12, 40, 3, 88, 7};

    🚽 An array does not carry its length, so work it out from the sizes.
    rizz count = maxxing(aura) / maxxing(aura[0]);

    rizz total = 0;
    rizz biggest = aura[0];

    flex (rizz i = 0; i < count; i++) {
        total = total + aura[i];

        edgy (aura[i] > biggest) {
            biggest = aura[i];
        }
    }

    yapping("%d values, total %d, biggest %d", count, total, biggest);

    bussin 0;
}
`,
  expect: { stdout: "5 values, total 150, biggest 88\n", exitCode: 0 },
};

const bounds = {
  starter: `skibidi main {
    rizz aura[2] = {1, 2};

    yapping("in range: %d %d", aura[0], aura[1]);

    🚽 This one is out of range. Brainrot stops the program instead of
    🚽 handing back whatever was next in memory.
    yapping("out of range: %d", aura[5]);

    yapping("never printed");

    bussin 0;
}
`,
  expect: {
    stdout: "in range: 1 2\n",
    stderr: "Error: Array index out of bounds: dimension 1 (index=5, size=2) at line 13\n",
    exitCode: 1,
  },
};

const matrices = {
  starter: `skibidi main {
    🚽 Braces inside braces: one set per row.
    rizz grid[2][3] = { {1, 2, 3}, {4, 5, 6} };

    grid[1][2] = 60;

    flex (rizz row = 0; row < 2; row++) {
        flex (rizz col = 0; col < 3; col++) {
            yappin("%d ", grid[row][col]);
        }
        yappin("\\n");
    }

    bussin 0;
}
`,
  expect: { stdout: "1 2 3 \n4 5 60 \n", exitCode: 0 },
};

const text = {
  starter: `skibidi main {
    🚽 A single character.
    yap initial = 'C';

    🚽 A string literal, held in a rant.
    rant name = "Chad";

    🚽 A character buffer: a yap array with room for a line of text.
    yap buffer[16];

    yapping("%c is for %s", initial, name);
    yapping("the buffer holds %d characters", maxxing(buffer) / maxxing(initial));

    name = "Gigachad";
    yapping("renamed: %s", name);

    bussin 0;
}
`,
  expect: {
    stdout: "C is for Chad\nthe buffer holds 16 characters\nrenamed: Gigachad\n",
    exitCode: 0,
  },
};

const slorp = {
  starter: `skibidi main {
    yapping("how much aura are we talking?");

    🚽 slorp() takes its type from where the value is going.
    rizz aura = slorp();

    yapping("you said %d, which doubled is %d", aura, aura * 2);

    bussin 0;
}
`,
  stdin: "4500\n",
  expect: {
    stdout: "how much aura are we talking?\nyou said 4500, which doubled is 9000\n",
    exitCode: 0,
  },
};

const slorpBuffer = {
  starter: `skibidi main {
    yap line[32];

    yapping("name?");

    🚽 With a buffer, slorp reads a whole line and hands it back as a rant.
    rant answer = slorp(line);

    yapping("hello, %s", answer);
    yapping("first letter: %c", line[0]);

    bussin 0;
}
`,
  stdin: "Gigachad Flexington\n",
  expect: {
    stdout: "name?\nhello, Gigachad Flexington\nfirst letter: G\n",
    exitCode: 0,
  },
};

const census = {
  starter: `skibidi main {
    rizz total = 0;

    flex (rizz i = 0; i < 3; i++) {
        rizz score = slorp();

        🚽 1. Add each score to total.
        🚽 2. Print "<score> certified" when the score is above 100,
        🚽    "<score> mid" otherwise.
        yapping("%d", score);
    }

    yapping("total: %d", total);

    bussin 0;
}
`,
  solution: `skibidi main {
    rizz total = 0;

    flex (rizz i = 0; i < 3; i++) {
        rizz score = slorp();

        total = total + score;

        edgy (score > 100) {
            yapping("%d certified", score);
        } amogus {
            yapping("%d mid", score);
        }
    }

    yapping("total: %d", total);

    bussin 0;
}
`,
  stdin: "42\n500\n9001\n",
  expect: {
    stdout: "42 mid\n500 certified\n9001 certified\ntotal: 9543\n",
    exitCode: 0,
  },
};

module.exports = {
  arrays,
  loops,
  bounds,
  matrices,
  text,
  slorp,
  "slorp-buffer": slorpBuffer,
  census,
};
