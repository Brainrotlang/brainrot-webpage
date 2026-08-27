// src/tour/programs/userDefinedTypes.js
//
// Programs for the "Your own types" chapter. See usingTheTour.js for why
// these live in CommonJS rather than TypeScript, and why nothing here is
// annotated.
//
// Two shapes are avoided throughout because the interpreter cannot handle
// them (both recorded in claims.js): arrays of structs, and struct-typed
// pointer parameters. Field access inside ordinary expressions — p.x + p.y,
// p.x = p.x + 1, and the like — used to be a third restriction here; it was
// lifted as of v0.1.7, so programs below use it freely.

const gang = {
  starter: `🚽 Type definitions go at the top level, above every function.
gang Point {
    rizz x;
    rizz y;
};

skibidi main {
    gang Point p;          🚽 every field starts at zero
    yapping("fresh: %d %d", p.x, p.y);

    p.x = 3;
    p.y = 4;
    yapping("set:   %d %d", p.x, p.y);

    bussin 0;
}
`,
  expect: { stdout: "fresh: 0 0\nset:   3 4\n", exitCode: 0 },
};

const initializers = {
  starter: `gang Point {
    rizz x;
    rizz y;
    chad weight;
};

skibidi main {
    🚽 Values are matched to fields in declaration order.
    gang Point p = {3, 4, 1.5};

    yapping("%d %d %.1f", p.x, p.y, p.weight);
    yapping("a Point is %d bytes", maxxing(p));

    bussin 0;
}
`,
  expect: { stdout: "3 4 1.5\na Point is 12 bytes\n", exitCode: 0 },
};

const oneFieldAtATime = {
  starter: `gang Point {
    rizz x;
    rizz y;
};

skibidi main {
    gang Point p = {3, 4};

    🚽 Two fields in one expression.
    yapping("%d", p.x + p.y);

    🚽 A field on both sides of an assignment.
    p.x = p.x + 1;
    yapping("%d", p.x);

    🚽 A field read into a variable that already exists.
    rizz t = 0;
    t = p.y;
    yapping("%d", t);

    🚽 A field on each side of a comparison.
    edgy (p.x > p.y) {
        yapping("x is bigger");
    } amogus {
        yapping("y is bigger or equal");
    }

    bussin 0;
}
`,
  expect: { stdout: "7\n4\n4\ny is bigger or equal\n", exitCode: 0 },
};

const nested = {
  starter: `gang Point {
    rizz x;
    rizz y;
};

🚽 A field can be another type you have already defined.
gang Line {
    gang Point start;
    gang Point end;
};

skibidi main {
    🚽 Each nested field takes its own braces.
    gang Line l = { {1, 2}, {3, 4} };

    yapping("%d,%d -> %d,%d", l.start.x, l.start.y, l.end.x, l.end.y);

    l.end.y = 40;
    yapping("moved end to %d,%d", l.end.x, l.end.y);

    bussin 0;
}
`,
  expect: { stdout: "1,2 -> 3,4\nmoved end to 3,40\n", exitCode: 0 },
};

const withFunctions = {
  starter: `gang Point {
    rizz x;
    rizz y;
};

🚽 A struct parameter is a copy. Reading one field and returning it works.
rizz across(gang Point p) {
    bussin p.x;
}

🚽 Writing to that copy is allowed, and cannot be seen by the caller.
skibidi relocate(gang Point p) {
    p.x = 99;
    yapping("inside relocate: %d", p.x);
}

skibidi main {
    gang Point a = {3, 4};

    yapping("across: %d", across(a));

    relocate(a);
    yapping("a is untouched: %d", a.x);

    bussin 0;
}
`,
  expect: {
    stdout: "across: 3\ninside relocate: 99\na is untouched: 3\n",
    exitCode: 0,
  },
};

const chungus = {
  starter: `gang Both {
    rizz whole;
    chad fraction;
};

chungus Either {
    rizz whole;
    chad fraction;
};

skibidi main {
    gang Both b;
    chungus Either e = {1065353216};   🚽 exactly one value, always

    🚽 A gang gives each field its own storage; a chungus overlaps them.
    🚽 (maxxing needs a variable — a type name is a syntax error.)
    yapping("gang: %d bytes, chungus: %d bytes", maxxing(b), maxxing(e));

    yapping("as a whole number: %d", e.whole);
    yapping("the same bytes as a fraction: %.1f", e.fraction);

    bussin 0;
}
`,
  expect: {
    stdout: "gang: 8 bytes, chungus: 4 bytes\nas a whole number: 1065353216\nthe same bytes as a fraction: 1.0\n",
    exitCode: 0,
  },
};

const gyatt = {
  starter: `🚽 Values count up from zero unless you say otherwise.
gyatt Tier {
    MID,
    CERTIFIED,
    GOATED
};

gyatt Status {
    OK = 0,
    WARN = 5,
    ERR        🚽 carries on from WARN, so 6
};

skibidi main {
    yapping("%d %d %d", MID, CERTIFIED, GOATED);
    yapping("%d %d %d", OK, WARN, ERR);

    gyatt Tier mine = CERTIFIED;

    ohio (mine) {
        sigma rule MID:
            yapping("mid");
            bruh;
        sigma rule CERTIFIED:
            yapping("certified");
            bruh;
        based:
            yapping("off the charts");
    }

    bussin 0;
}
`,
  expect: { stdout: "0 1 2\n0 5 6\ncertified\n", exitCode: 0 },
};

const lit = {
  starter: `gang Point {
    rizz x;
    rizz y;
};

gyatt Tier { MID, CERTIFIED };

🚽 lit gives an existing type a second name. Top level only.
lit gang Point Coord;
lit gyatt Tier Rank;
lit rizz Aura;

skibidi main {
    Coord here = {3, 4};      🚽 exactly a gang Point
    Rank mine = CERTIFIED;    🚽 exactly a gyatt Tier
    Aura score = 9001;        🚽 exactly a rizz

    yapping("%d,%d %d %d", here.x, here.y, mine, score);
    yapping("a Coord is %d bytes, same as its Point", maxxing(here));

    bussin 0;
}
`,
  expect: { stdout: "3,4 1 9001\na Coord is 8 bytes, same as its Point\n", exitCode: 0 },
};

const profile = {
  starter: `gyatt Tier {
    MID,
    CERTIFIED,
    GOATED
};

gang Profile {
    rizz aura;
    gyatt Tier tier;
};

gyatt Tier tier_for(rizz aura) {
    🚽 GOATED above 9000, CERTIFIED above 100, MID otherwise.
    bussin MID;
}

skibidi main {
    rizz scores[3] = {42, 500, 9001};

    flex (rizz i = 0; i < 3; i++) {
        gang Profile p;
        p.aura = scores[i];
        p.tier = tier_for(p.aura);

        yapping("aura %d -> tier %d", p.aura, p.tier);
    }

    bussin 0;
}
`,
  solution: `gyatt Tier {
    MID,
    CERTIFIED,
    GOATED
};

gang Profile {
    rizz aura;
    gyatt Tier tier;
};

gyatt Tier tier_for(rizz aura) {
    edgy (aura > 9000) { bussin GOATED; }
    edgy (aura > 100) { bussin CERTIFIED; }
    bussin MID;
}

skibidi main {
    rizz scores[3] = {42, 500, 9001};

    flex (rizz i = 0; i < 3; i++) {
        gang Profile p;
        p.aura = scores[i];
        p.tier = tier_for(p.aura);

        yapping("aura %d -> tier %d", p.aura, p.tier);
    }

    bussin 0;
}
`,
  expect: { stdout: "aura 42 -> tier 0\naura 500 -> tier 1\naura 9001 -> tier 2\n", exitCode: 0 },
};

module.exports = {
  gang,
  initializers,
  "one-field-at-a-time": oneFieldAtATime,
  nested,
  "with-functions": withFunctions,
  chungus,
  gyatt,
  lit,
  profile,
};
