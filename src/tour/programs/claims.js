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
