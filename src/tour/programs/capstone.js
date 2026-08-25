// src/tour/programs/capstone.js
//
// The final challenge. See usingTheTour.js for why these live in CommonJS
// rather than TypeScript, and why nothing here is annotated.
//
// Deliberately built only from shapes the interpreter handles: no arrays of
// structs, no array passed to a function, no struct field combined with
// another in one expression, no bussin inside a loop, and ragequit rather
// than a meaningful return from main. Every restriction the tour taught,
// respected in one program.

const rizzAnalyzer = {
  starter: `gyatt Tier {
    MID,
    CERTIFIED,
    GOATED
};

gang Report {
    rizz count;
    rizz total;
    rizz best;
};

gyatt Tier tier_for(rizz aura) {
    🚽 TODO 2: GOATED above 9000, CERTIFIED above 100, MID otherwise.
    bussin MID;
}

skibidi main {
    rizz count = 4;
    rizz scores[4];

    flex (rizz i = 0; i < count; i++) {
        scores[i] = slorp();
    }

    rizz total = 0;
    rizz best = scores[0];

    flex (rizz i = 0; i < count; i++) {
        🚽 TODO 1: add each score to total, and keep the biggest in best.
    }

    gang Report report;
    report.count = count;
    report.total = total;
    report.best = best;

    bet(report.count > 0, "a report needs at least one score");

    yapping("scores:  %d", report.count);
    yapping("total:   %d", report.total);
    yapping("average: %d", total / count);
    yapping("best:    %d", report.best);
    yapping("tier:    %d", tier_for(best));

    bussin 0;
}
`,
  solution: `gyatt Tier {
    MID,
    CERTIFIED,
    GOATED
};

gang Report {
    rizz count;
    rizz total;
    rizz best;
};

gyatt Tier tier_for(rizz aura) {
    edgy (aura > 9000) { bussin GOATED; }
    edgy (aura > 100) { bussin CERTIFIED; }
    bussin MID;
}

skibidi main {
    rizz count = 4;
    rizz scores[4];

    flex (rizz i = 0; i < count; i++) {
        scores[i] = slorp();
    }

    rizz total = 0;
    rizz best = scores[0];

    flex (rizz i = 0; i < count; i++) {
        total = total + scores[i];

        edgy (scores[i] > best) {
            best = scores[i];
        }
    }

    gang Report report;
    report.count = count;
    report.total = total;
    report.best = best;

    bet(report.count > 0, "a report needs at least one score");

    yapping("scores:  %d", report.count);
    yapping("total:   %d", report.total);
    yapping("average: %d", total / count);
    yapping("best:    %d", report.best);
    yapping("tier:    %d", tier_for(best));

    bussin 0;
}
`,
  stdin: "42\n500\n9001\n7\n",
  expect: {
    stdout: "scores:  4\ntotal:   9550\naverage: 2387\nbest:    9001\ntier:    2\n",
    exitCode: 0,
  },
};

module.exports = { "rizz-analyzer": rizzAnalyzer };
