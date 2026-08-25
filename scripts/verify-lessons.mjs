// scripts/verify-lessons.mjs
//
// Runs every tour lesson's canonical program against the pinned Brainrot
// release and checks it still does what the lesson claims — and then runs
// the *claims*: the programs behind every "this does not work in this
// release" warning the lessons make (src/tour/programs/claims.js).
//
// This is the guard on the tour's one unfixable failure mode: teaching
// syntax the shipped interpreter rejects. Documentation is not evidence —
// the upstream keyword table lists `lit`, which does not parse; the upstream
// user guide's own `is_prime` example does not run as written. So the
// lessons' expectations are compared against the artifact the site actually
// loads, and a wasmVersion.json bump that breaks a lesson fails here
// instead of shipping.
//
// It reads src/tour/programs directly — the same CommonJS modules the app
// renders from, not a generated copy — so there is nothing to keep in sync.
//
// Each program runs in a child process with a hard deadline. Plain Node
// cannot interrupt a synchronous wasm call, so without that a single
// non-terminating lesson would hang CI instead of failing it. One lesson is
// *expected* to hit the deadline; that is a property being verified, not an
// accident being tolerated.
//
// Usage: node scripts/verify-lessons.mjs
//   (after public/wasm/brainrot.mjs exists — see scripts/fetch-wasm.mjs)

import { execFile } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { RESULT_MARKER, repoRoot, requireWasmModulePath } from "./lib/brainrot-node.mjs";

const RUNNER = path.join(repoRoot, "scripts", "lib", "run-one-program.mjs");

/** Generous next to the browser's 5s program budget: this covers module
 *  load plus execution on a cold CI runner. */
const DEADLINE_MS = 20_000;
/** Long enough to prove a program is not merely slow, short enough that the
 *  one lesson which never terminates does not dominate the run. */
const NON_TERMINATING_DEADLINE_MS = 4_000;

requireWasmModulePath();

const { default: programs } = await import(path.join(repoRoot, "src", "tour", "programs", "index.js"));
const { default: claims } = await import(path.join(repoRoot, "src", "tour", "programs", "claims.js"));

const scratch = mkdtempSync(path.join(tmpdir(), "brainrot-lessons-"));

function runInChild(source, stdin, deadlineMs) {
  const requestPath = path.join(scratch, `request-${Math.random().toString(36).slice(2)}.json`);
  writeFileSync(requestPath, JSON.stringify({ source, stdin }));

  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [RUNNER, requestPath],
      { cwd: repoRoot, timeout: deadlineMs, killSignal: "SIGKILL", maxBuffer: 8 * 1024 * 1024 },
      (error, stdout, stderr) => {
        rmSync(requestPath, { force: true });

        const line = stdout.split("\n").find((candidate) => candidate.startsWith(RESULT_MARKER));
        if (line) {
          resolve({ ...JSON.parse(line.slice(RESULT_MARKER.length)), timedOut: false });
          return;
        }
        if (error?.killed) {
          resolve({ stdout: "", stderr: "", exitCode: -1, timedOut: true });
          return;
        }
        resolve({
          stdout: "",
          stderr: stderr || error?.message || "the runner produced no result",
          exitCode: -1,
          timedOut: false,
          runnerFailed: true,
        });
      },
    );
  });
}

/** Same normalisation the in-browser exercise checker applies: trailing
 *  spaces and tabs are invisible in an editor, everything else is
 *  significant — including trailing newlines, which are the whole
 *  difference between `yapping` and `yappin`. */
function normalize(text) {
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n");
}

function compare(actual, expected) {
  const problems = [];

  if (actual.runnerFailed) {
    problems.push(`the runner itself failed: ${actual.stderr.trim()}`);
    return problems;
  }

  if (expected.timedOut) {
    if (!actual.timedOut) problems.push("expected this program never to terminate, but it finished");
    return problems;
  }

  if (actual.timedOut) {
    problems.push(`did not finish within ${DEADLINE_MS}ms`);
    return problems;
  }

  for (const field of ["stdout", "stderr"]) {
    if (expected[field] === undefined) continue;
    if (normalize(actual[field]) !== normalize(expected[field])) {
      problems.push(`${field}: expected ${JSON.stringify(expected[field])}, got ${JSON.stringify(actual[field])}`);
    }
  }

  if (expected.stderr === undefined && actual.stderr !== "") {
    problems.push(`unexpected stderr: ${JSON.stringify(actual.stderr)}`);
  }

  if (actual.exitCode !== expected.exitCode) {
    problems.push(`exit code: expected ${expected.exitCode}, got ${actual.exitCode}`);
  }

  return problems;
}

let checked = 0;
let failures = 0;

for (const [chapterId, chapterPrograms] of Object.entries(programs)) {
  for (const [slug, program] of Object.entries(chapterPrograms)) {
    const id = `${chapterId}/${slug}`;
    const deadline = program.expect.timedOut ? NON_TERMINATING_DEADLINE_MS : DEADLINE_MS;

    // The canonical program: an exercise's answer, a demo's starter.
    const canonical = program.solution ?? program.starter;
    const problems = compare(await runInChild(canonical, program.stdin ?? "", deadline), program.expect);
    checked++;

    // An exercise whose starter already satisfies the expectation is not an
    // exercise. Cheap to check, and impossible to notice by reading.
    if (program.solution) {
      const starter = await runInChild(program.starter, program.stdin ?? "", deadline);
      if (compare(starter, program.expect).length === 0) {
        problems.push("the starter program already passes — there is nothing for the visitor to do");
      }
      checked++;
    }

    if (problems.length === 0) {
      console.log(`✓ ${id}`);
    } else {
      failures++;
      console.error(`✗ ${id}\n  ${problems.join("\n  ")}`);
    }
  }
}

console.log("\nClaims the lessons make about what does not work:");

let brokenClaims = 0;

for (const [id, claim] of Object.entries(claims)) {
  const actual = await runInChild(claim.source, claim.stdin ?? "", DEADLINE_MS);
  const problems = [];

  if (actual.runnerFailed) {
    problems.push(`the runner itself failed: ${actual.stderr.trim()}`);
  } else if (actual.timedOut) {
    problems.push(`did not finish within ${DEADLINE_MS}ms`);
  } else {
    if (claim.expect.exitCode !== undefined && actual.exitCode !== claim.expect.exitCode) {
      problems.push(`exit code: expected ${claim.expect.exitCode}, got ${actual.exitCode}`);
    }
    if (claim.expect.stdout !== undefined && normalize(actual.stdout) !== normalize(claim.expect.stdout)) {
      problems.push(`stdout: expected ${JSON.stringify(claim.expect.stdout)}, got ${JSON.stringify(actual.stdout)}`);
    }
    if (claim.expect.stderrIncludes !== undefined && !actual.stderr.includes(claim.expect.stderrIncludes)) {
      problems.push(
        `stderr: expected it to mention ${JSON.stringify(claim.expect.stderrIncludes)}, got ${JSON.stringify(actual.stderr)}`,
      );
    }
  }
  checked++;

  if (problems.length === 0) {
    console.log(`✓ ${claim.lesson} — ${claim.claim}`);
  } else {
    brokenClaims++;
    console.error(
      `✗ ${claim.lesson} — ${claim.claim}\n  ${problems.join("\n  ")}\n` +
        `  This claim no longer holds (claim id: ${id}), so the lesson that makes it is now wrong.\n` +
        `  Update the lesson — and if the interpreter simply got better, delete the claim.`,
    );
  }
}

rmSync(scratch, { recursive: true, force: true });

const total = failures + brokenClaims;
const summary =
  total === 0
    ? "All lessons and claims match the pinned interpreter"
    : [
        failures > 0 ? `${failures} lesson(s) drifted` : null,
        brokenClaims > 0 ? `${brokenClaims} claim(s) no longer hold` : null,
      ]
        .filter(Boolean)
        .join(", ");

console.log(`\n${summary} (${checked} run${checked === 1 ? "" : "s"})`);
process.exit(total > 0 ? 1 : 0);
