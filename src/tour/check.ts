// src/tour/check.ts
//
// Deciding whether an exercise is solved. Behavioural, not structural: the
// visitor's program has to *do* what the exercise asked, and how they got
// there is their business.
//
// The comparison is deliberately unforgiving in one direction and forgiving
// in exactly one way. Every field the lesson declares must match, including
// the exit code and stderr — Brainrot v0.1.5 can exit 0 while reporting
// interpreter errors on stderr, so "right stdout" alone is not evidence
// that a program worked. The single concession is trailing spaces and tabs
// at the end of a line, which no reasonable exercise turns on and which are
// invisible in the editor.
//
// Trailing *newlines* are not normalised, on purpose: `yapping("x\n")`
// printing a blank line where `yapping("x")` does not is a real difference
// the curriculum teaches, and a checker that shrugged at it would undermine
// the lesson that explains it.

import type { RunResult } from "../playground/runtime";
import type { Expectation } from "./types";

export type CheckOutcome =
  | { status: "passed" }
  | { status: "failed"; reasons: readonly string[] };

function normalize(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n");
}

export function evaluateRun(result: RunResult, expected: Expectation): CheckOutcome {
  const reasons: string[] = [];

  if (expected.timedOut) {
    // The lesson is about a program that never finishes; finishing is the
    // failure.
    if (!result.timedOut) reasons.push("this program was supposed to run forever and get cut off, but it finished");
    return reasons.length === 0 ? { status: "passed" } : { status: "failed", reasons };
  }

  if (result.timedOut) {
    return {
      status: "failed",
      reasons: ["the program never finished — it got cut off, which usually means a loop that cannot end"],
    };
  }

  if (expected.stdout !== undefined && normalize(result.stdout) !== normalize(expected.stdout)) {
    reasons.push(`expected output ${JSON.stringify(expected.stdout)}, got ${JSON.stringify(result.stdout)}`);
  }

  if (expected.stderr !== undefined && normalize(result.stderr) !== normalize(expected.stderr)) {
    reasons.push(`expected stderr ${JSON.stringify(expected.stderr)}, got ${JSON.stringify(result.stderr)}`);
  } else if (expected.stderr === undefined && result.stderr !== "") {
    // Nothing was expected on stderr, and something showed up. That is the
    // interpreter complaining, and it is never what an exercise wanted.
    reasons.push(`the program wrote to stderr: ${JSON.stringify(result.stderr)}`);
  }

  if (result.exitCode !== expected.exitCode) {
    reasons.push(`expected exit code ${expected.exitCode}, got ${result.exitCode}`);
  }

  return reasons.length === 0 ? { status: "passed" } : { status: "failed", reasons };
}
