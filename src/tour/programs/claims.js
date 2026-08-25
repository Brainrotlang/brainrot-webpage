// src/tour/programs/claims.js
//
// The tour does not only teach what Brainrot does; several lessons warn
// about what it *doesn't* do — `!` that fails to negate, `grind` that will
// not parse, `smol rizz` that is a syntax error. Those warnings are claims
// about the interpreter, and until this file existed nothing checked them.
//
// The v0.1.5 → v0.1.6 bump is what made that gap concrete: `lit` went from
// "does not parse" to fully working, and no test noticed. A warning that has
// silently become false is worse than no warning, because a reader who
// believes it writes worse code than one who tries it.
//
// So each claim is a program plus the result that justifies the prose.
// `yarn verify:lessons` runs them all. A claim that *fails* means the
// interpreter changed and the lesson now lies — the fix is to update the
// lesson, and possibly to delete the claim with a small celebration.
//
// Deliberately not exported from ./index.js: these are evidence, not
// content. They are never rendered and never shipped to the browser.
//
// stderr is matched by substring rather than in full, unlike lesson
// programs, whose exact output *is* the teaching material. A claim only
// needs to show the interpreter still rejects the thing for the reason the
// lesson gives, and pinning whole diagnostics would fail on a reworded
// message that changes nothing a reader cares about.

const claims = {
  "no-block-comments": {
    lesson: "basics/comments",
    claim: "there is no /* ... */ block comment form",
    source: `skibidi main {
    /* not a comment */
    yapping("hi");
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "syntax error" },
  },

  "based-is-a-keyword": {
    lesson: "basics/types",
    claim: "`based` is the switch-default keyword, so it cannot name a variable",
    source: `skibidi main {
    cap based = W;
    yapping("%d", based);
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "unexpected DEFAULT" },
  },

  "smol-rizz-does-not-parse": {
    lesson: "basics/number-sizes",
    claim: "`smol` stands alone — `smol rizz` is a syntax error",
    source: `skibidi main {
    smol rizz a = 1;
    yapping("%d", a);
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "unexpected RIZZ" },
  },

  "bare-giga-does-not-parse": {
    lesson: "basics/number-sizes",
    claim: "`giga`, `thicc`, `nut` and `nonut` require the `rizz` and will not parse bare",
    source: `skibidi main {
    giga a = 1;
    yapping("%d", a);
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "syntax error" },
  },

  "deadass-is-enforced": {
    lesson: "basics/qualifiers",
    claim: "`deadass` is enforced: reassigning is rejected, on stderr, with a non-zero exit",
    source: `skibidi main {
    deadass rizz max_aura = 9001;
    max_aura = 1;
    yapping("%d", max_aura);
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "Cannot modify const variable" },
  },

  "logical-not-is-a-no-op": {
    lesson: "basics/operators",
    claim: "`!` returns its operand unchanged instead of negating it: !L is L, !W is W",
    source: `skibidi main {
    yapping("%d %d", !L, !W);
    bussin 0;
}
`,
    // The evidence is the output, not a rejection: 0 1 is `!L !W` handing
    // back L and W. Negation would print 1 0.
    expect: { exitCode: 0, stdout: "0 1\n" },
  },

  "logical-not-picks-the-wrong-branch": {
    lesson: "basics/operators",
    claim: "`edgy (!(a < b))` takes the branch it should have skipped",
    source: `skibidi main {
    rizz a = 7;
    rizz b = 2;

    edgy (!(a < b)) {
        yapping("not less");
    } amogus {
        yapping("less");
    }

    bussin 0;
}
`,
    // 7 is not less than 2, so a working `!` would print "not less".
    expect: { exitCode: 0, stdout: "less\n" },
  },

  "maxxing-rejects-a-type-name": {
    lesson: "basics/maxxing",
    claim: "`maxxing` takes a value, not a type name",
    source: `skibidi main {
    yapping("%d", maxxing(rizz));
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "syntax error" },
  },

  "arrays-cannot-be-parameters": {
    lesson: "basics/maxxing",
    claim: "arrays cannot be passed to functions, so their length must be computed where they are declared",
    source: `skibidi bump(rizz *a) {
    a[0] = a[0] + 1;
}

skibidi main {
    rizz arr[2] = {1, 2};
    bump(arr);
    yapping("%d", arr[0]);
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "is not an array" },
  },

  "mewing-needs-its-semicolon": {
    lesson: "control-flow/mewing",
    claim: "`mewing … goon (cond)` requires a trailing semicolon",
    source: `skibidi main {
    rizz i = 0;

    mewing {
        i++;
    } goon (i < 2)

    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "expecting SEMICOLON" },
  },

  "grind-does-not-parse": {
    lesson: "control-flow/bruh",
    claim: "`grind` (continue) does not parse in any form",
    source: `skibidi main {
    flex (rizz i = 0; i < 2; i++) {
        grind;
    }
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "unexpected CONTINUE" },
  },

  "array-elements-combine-freely": {
    lesson: "arrays-and-input/loops",
    claim: "unlike struct fields, two array elements can share an expression",
    source: `skibidi main {
    rizz a[2] = {3, 4};
    yapping("%d", a[0] + a[1]);
    bussin 0;
}
`,
    // The contrast the lesson draws only holds while this keeps working.
    expect: { exitCode: 0, stdout: "7\n" },
  },

  "negative-indices-are-caught-too": {
    lesson: "arrays-and-input/bounds",
    claim: "a negative index is caught by the same bounds check",
    source: `skibidi main {
    rizz a[2] = {1, 2};
    yapping("%d", a[-1]);
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "out of bounds" },
  },

  "deprecated-slorp-warns": {
    lesson: "arrays-and-input/slorp",
    claim: "the old `slorp(variable)` form still works but warns on stderr",
    source: `skibidi main {
    rizz n;
    slorp(n);
    yapping("%d", n);
    bussin 0;
}
`,
    stdin: "7\n",
    expect: { exitCode: 0, stdout: "7\n", stderrIncludes: "deprecated" },
  },

  "a-pointer-must-be-initialised": {
    lesson: "pointers/addresses",
    claim: "a pointer declaration without a value is rejected",
    source: `skibidi main {
    rizz *slot;
    yapping("%d", *slot);
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "expected a pointer" },
  },

  "pointer-arithmetic-is-unchecked": {
    lesson: "pointers/arithmetic",
    claim: "pointer arithmetic past the end of an array is not caught, unlike indexing",
    source: `skibidi main {
    rizz a[2] = {1, 2};
    rizz *walker = &a[0];
    walker = walker + 5;
    yapping("%d", *walker);
    bussin 0;
}
`,
    // No bounds error and no crash: it reads whatever is there. The lesson
    // contrasts this with a[5], which is refused.
    expect: { exitCode: 0 },
  },

  "two-fields-in-one-expression": {
    lesson: "your-own-types/one-field-at-a-time",
    claim: "an expression may hold at most one struct field: `p.x + p.y` yields the wrong answer",
    source: `gang Point { rizz x; rizz y; };

skibidi main {
    gang Point p = {3, 4};
    yapping("%d", p.x + p.y);
    bussin 0;
}
`,
    // Silently wrong rather than refused: 0 instead of 7, exit 0, complaint
    // on stderr only. The dangerous kind.
    expect: { exitCode: 0, stdout: "0\n", stderrIncludes: "Unsupported struct member access expression" },
  },

  "a-field-cannot-be-incremented": {
    lesson: "your-own-types/one-field-at-a-time",
    claim: "`p.x = p.x + 1` does not work — a field cannot appear on both sides of an assignment",
    source: `gang Point { rizz x; rizz y; };

skibidi main {
    gang Point p = {3, 4};
    p.x = p.x + 1;
    yapping("%d", p.x);
    bussin 0;
}
`,
    expect: { exitCode: 0, stdout: "0\n", stderrIncludes: "Unsupported variable type" },
  },

  "a-field-cannot-fill-an-existing-variable": {
    lesson: "your-own-types/one-field-at-a-time",
    claim: "reading a field into an *existing* variable fails; it has to be a fresh declaration",
    source: `gang Point { rizz x; rizz y; };

skibidi main {
    gang Point p = {3, 4};
    rizz t = 0;
    t = p.x;
    yapping("%d", t);
    bussin 0;
}
`,
    expect: { exitCode: 0, stdout: "0\n", stderrIncludes: "Unsupported variable type" },
  },

  "types-are-top-level-only": {
    lesson: "your-own-types/gang",
    claim: "a `gang` cannot be defined inside a function",
    source: `skibidi main {
    gang Point { rizz x; };
    gang Point p;
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "syntax error" },
  },

  "no-arrays-of-structs": {
    lesson: "your-own-types/gang",
    claim: "there are no arrays of structs",
    source: `gang Point { rizz x; };

skibidi main {
    gang Point ps[2];
    ps[0].x = 1;
    yapping("%d", ps[0].x);
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "syntax error" },
  },

  "nested-init-needs-braces": {
    lesson: "your-own-types/nested",
    claim: "a nested struct field needs its own braces — a flattened initialiser is rejected",
    source: `gang Point { rizz x; rizz y; };

gang Line { gang Point start; gang Point end; };

skibidi main {
    gang Line l = {1, 2, 3, 4};
    yapping("%d", l.start.x);
    bussin 0;
}
`,
    expect: { stderrIncludes: "needs a braced sub-initializer" },
  },

  "a-struct-cannot-contain-itself": {
    lesson: "your-own-types/nested",
    claim: "a struct cannot contain itself by value",
    source: `gang Node { rizz v; gang Node inner; };

skibidi main {
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "cannot contain itself by value" },
  },

  "struct-pointer-parameters-do-not-work": {
    lesson: "your-own-types/with-functions",
    claim: "a struct-typed pointer parameter cannot be written through, so there is no call by reference for structs",
    source: `gang Point { rizz x; };

skibidi bump(gang Point *p) {
    (*p).x = 9;
}

skibidi main {
    gang Point a = {1};
    bump(&a);
    yapping("%d", a.x);
    bussin 0;
}
`,
    expect: { stderrIncludes: "Invalid assignment target" },
  },

  "union-init-takes-one-value": {
    lesson: "your-own-types/chungus",
    claim: "a `chungus` initialiser must have exactly one value",
    source: `chungus Data { rizz i; chad f; };

skibidi main {
    chungus Data d = {1, 2.0};
    yapping("%d", d.i);
    bussin 0;
}
`,
    expect: { stderrIncludes: "exactly one value" },
  },

  "enum-constants-are-globally-unique": {
    lesson: "your-own-types/gyatt",
    claim: "enum constant names share one global namespace across every enum",
    source: `gyatt A { SAME };
gyatt B { SAME };

skibidi main {
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "already defined" },
  },

  "lit-is-top-level-only": {
    lesson: "your-own-types/lit",
    claim: "`lit` declarations are rejected inside a function body",
    source: `skibidi main {
    lit rizz Aura;
    Aura a = 1;
    yapping("%d", a);
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "only allowed at top level" },
  },

  "functions-must-precede-main": {
    lesson: "functions/defining",
    claim: "a function defined after `skibidi main` does not parse — there are no forward declarations",
    source: `skibidi main {
    yapping("%d", later(2));
    bussin 0;
}

rizz later(rizz x) {
    bussin x * 3;
}
`,
    expect: { exitCode: 1, stderrIncludes: "expecting end of file" },
  },

  "a-missing-bussin-runs-the-body-twice": {
    lesson: "functions/defining",
    claim: "a non-void function with no `bussin` runs its body twice and yields 0",
    source: `rizz forgot(rizz x) {
    yapping("called with %d", x);
}

skibidi main {
    rizz r = forgot(1);
    yapping("%d", r);
    bussin 0;
}
`,
    // Two "called with 1" lines for one call is the whole point.
    expect: { exitCode: 0, stdout: "called with 1\ncalled with 1\n0\n" },
  },

  "cap-result-cannot-be-tested-in-place": {
    lesson: "functions/parameters",
    claim: "a cap-returning call cannot be tested in place — it has to land in a cap first",
    source: `cap is_even(rizz n) {
    bussin (n % 2) == 0;
}

skibidi main {
    edgy (is_even(10)) {
        yapping("even");
    }
    bussin 0;
}
`,
    expect: { stderrIncludes: "cannot be used in an integer context" },
  },

  "globals-do-not-parse": {
    lesson: "functions/scope",
    claim: "a variable declared outside a function does not parse — there are no globals",
    source: `rizz counter = 0;

skibidi tick() {
    counter = counter + 1;
}

skibidi main {
    tick();
    yapping("%d", counter);
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "syntax error" },
  },

  "wrong-argument-count-is-not-fatal": {
    lesson: "functions/calls",
    claim: "calling with the wrong number of arguments reports on stderr but still exits 0",
    source: `rizz twice(rizz x) {
    bussin x * 2;
}

skibidi main {
    yapping("%d", twice());
    bussin 0;
}
`,
    expect: { exitCode: 0, stderrIncludes: "Mismatched number of arguments" },
  },

  "deep-recursion-exhausts-the-stack": {
    lesson: "functions/recursion",
    claim: "recursion deep enough to exhaust the WebAssembly stack fails as a crashed program",
    source: `rizz deep(rizz n) {
    edgy (n <= 0) { bussin 0; }
    bussin deep(n - 1);
}

skibidi main {
    yapping("%d", deep(5000));
    bussin 0;
}
`,
    expect: { exitCode: -1, stderrIncludes: "call stack size exceeded" },
  },

  "bussin-inside-a-loop-breaks": {
    lesson: "functions/returning-early",
    claim: "a `bussin` inside a loop body in a function fails with 'No scope to exit'",
    source: `rizz first_divisor(rizz n) {
    flex (rizz i = 2; i < n; i++) {
        edgy ((n % i) == 0) {
            bussin i;
        }
    }
    bussin 0;
}

skibidi main {
    yapping("%d", first_divisor(9));
    bussin 0;
}
`,
    expect: { exitCode: 1, stderrIncludes: "No scope to exit" },
  },

  "slorp-needs-input": {
    lesson: "using-the-tour/running-brainrot",
    claim: "`slorp` on empty input fails outright rather than reading a zero",
    source: `skibidi main {
    rizz n = slorp();
    yapping("%d", n);
    bussin 0;
}
`,
    stdin: "",
    expect: { exitCode: 1, stderrIncludes: "Invalid integer format" },
  },
};

module.exports = claims;
