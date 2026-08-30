// src/tour/programs/functions.js
//
// Programs for the "Functions" chapter. See usingTheTour.js for why these
// live in CommonJS rather than TypeScript, and why nothing here is
// annotated.
//
// One shape is still avoided throughout, because the interpreter cannot
// handle it (see claims.js): a function defined after `skibidi main`. An
// early `bussin` from inside a loop used to be the other; it works as of
// v0.3.0, and these programs now use it directly.

const defining = {
  starter: `rizz double_rizz(rizz x) {
    bussin x * 2;
}

skibidi announce(rizz value) {
    yapping("the value is %d", value);
}

skibidi main {
    rizz doubled = double_rizz(21);

    announce(doubled);
    yapping("%d", double_rizz(doubled));

    bussin 0;
}
`,
  expect: { stdout: "the value is 42\n84\n", exitCode: 0 },
};

const parameters = {
  starter: `gigachad blend(rizz parts, gigachad factor) {
    bussin parts * factor;
}

cap is_even(rizz n) {
    bussin (n % 2) == 0;
}

skibidi main {
    yapping("%.2f", blend(4, 1.5));

    🚽 A cap-returning call can be tested directly, or kept in a cap first.
    edgy (is_even(10)) {
        yapping("10 is even");
    }

    bussin 0;
}
`,
  expect: { stdout: "6.00\n10 is even\n", exitCode: 0 },
};

const calls = {
  starter: `rizz twice(rizz x) {
    bussin x * 2;
}

rizz limit() {
    bussin 3;
}

skibidi main {
    🚽 A call is an expression: nest them, or use one anywhere a value fits.
    yapping("%d", twice(twice(5)));

    flex (rizz i = 0; i < limit(); i++) {
        yappin("%d ", twice(i));
    }
    yapping("");

    bussin 0;
}
`,
  expect: { stdout: "20\n0 2 4 \n", exitCode: 0 },
};

const scope = {
  starter: `rizz bump(rizz x) {
    rizz local = x + 1;
    bussin local;
}

skibidi main {
    rizz local = 100;

    yapping("inside bump: %d", bump(1));
    yapping("still ours: %d", local);

    bussin 0;
}
`,
  expect: { stdout: "inside bump: 2\nstill ours: 100\n", exitCode: 0 },
};

const returningEarly = {
  starter: `🚽 Return the moment you know the answer — including from a chain of
🚽 guards at the top of a function.
rizz classify(rizz aura) {
    edgy (aura > 9000) { bussin 2; }
    edgy (aura > 100) { bussin 1; }
    bussin 0;
}

🚽 An early bussin from inside a loop works too: return on the first hit,
🚽 and fall through to a default if the loop finds nothing.
rizz first_divisor(rizz n) {
    flex (rizz i = 2; i < n; i++) {
        edgy ((n % i) == 0) {
            bussin i;
        }
    }

    bussin 0;
}

skibidi main {
    yapping("%d %d %d", classify(5), classify(500), classify(9001));
    yapping("%d %d", first_divisor(9), first_divisor(7));

    bussin 0;
}
`,
  expect: { stdout: "0 1 2\n3 0\n", exitCode: 0 },
};

const recursion = {
  starter: `rizz fact(rizz n) {
    edgy (n <= 1) { bussin 1; }
    bussin n * fact(n - 1);
}

rizz fib(rizz n) {
    edgy (n < 2) { bussin n; }
    bussin fib(n - 1) + fib(n - 2);
}

skibidi main {
    flex (rizz i = 1; i <= 5; i++) {
        yapping("%d! = %d", i, fact(i));
    }

    flex (rizz i = 0; i < 8; i++) {
        yappin("%d ", fib(i));
    }
    yapping("");

    bussin 0;
}
`,
  expect: {
    stdout: "1! = 1\n2! = 2\n3! = 6\n4! = 24\n5! = 120\n0 1 1 2 3 5 8 13 \n",
    exitCode: 0,
  },
};

const primeChecker = {
  starter: `cap is_prime(rizz n) {
    🚽 Return W when n is prime and L when it is not.
    🚽
    🚽 An early bussin from inside the loop is the natural shape here: the
    🚽 moment you find a divisor, you have your answer.
    bussin W;
}

skibidi main {
    flex (rizz n = 1; n <= 20; n++) {
        cap prime = is_prime(n);
        edgy (prime) {
            yappin("%d ", n);
        }
    }
    yapping("");

    bussin 0;
}
`,
  solution: `cap is_prime(rizz n) {
    edgy (n < 2) { bussin L; }

    flex (rizz i = 2; i * i <= n; i++) {
        edgy ((n % i) == 0) { bussin L; }
    }

    bussin W;
}

skibidi main {
    flex (rizz n = 1; n <= 20; n++) {
        cap prime = is_prime(n);
        edgy (prime) {
            yappin("%d ", n);
        }
    }
    yapping("");

    bussin 0;
}
`,
  expect: { stdout: "2 3 5 7 11 13 17 19 \n", exitCode: 0 },
};

module.exports = {
  defining,
  parameters,
  calls,
  scope,
  "returning-early": returningEarly,
  recursion,
  "prime-checker": primeChecker,
};
