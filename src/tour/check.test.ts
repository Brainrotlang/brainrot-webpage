import { evaluateRun } from "./check";
import type { RunResult } from "../playground/runtime";

function result(overrides: Partial<RunResult> = {}): RunResult {
  return { stdout: "", stderr: "", exitCode: 0, timedOut: false, ...overrides };
}

test("matching stdout and exit code passes", () => {
  const outcome = evaluateRun(result({ stdout: "aura: 9001\n" }), { stdout: "aura: 9001\n", exitCode: 0 });
  expect(outcome).toEqual({ status: "passed" });
});

test("wrong stdout fails, and says what it wanted", () => {
  const outcome = evaluateRun(result({ stdout: "aura: 0\n" }), { stdout: "aura: 9001\n", exitCode: 0 });
  expect(outcome.status).toBe("failed");
  expect(outcome.status === "failed" && outcome.reasons.join()).toContain("aura: 9001");
});

test("right stdout with a non-zero exit code still fails", () => {
  // The mistake this guards: a program that prints the right thing and then
  // falls over is not a solved exercise.
  const outcome = evaluateRun(result({ stdout: "done\n", exitCode: 1 }), { stdout: "done\n", exitCode: 0 });
  expect(outcome.status).toBe("failed");
  expect(outcome.status === "failed" && outcome.reasons.join()).toContain("exit code");
});

test("right stdout and exit code but interpreter noise on stderr still fails", () => {
  // Brainrot v0.1.5 really does this — `rant == "literal"` reports errors on
  // stderr and exits 0. A checker looking only at stdout would call it solved.
  const outcome = evaluateRun(result({ stdout: "eq\n", stderr: "Error: Unknown node type\n" }), {
    stdout: "eq\n",
    exitCode: 0,
  });
  expect(outcome.status).toBe("failed");
  expect(outcome.status === "failed" && outcome.reasons.join()).toContain("stderr");
});

test("stderr the lesson asked for is not treated as noise", () => {
  const outcome = evaluateRun(result({ stdout: "out\n", stderr: "expected warning\n" }), {
    stdout: "out\n",
    stderr: "expected warning\n",
    exitCode: 0,
  });
  expect(outcome).toEqual({ status: "passed" });
});

test("trailing spaces are forgiven; trailing newlines are not", () => {
  expect(evaluateRun(result({ stdout: "hi  \n" }), { stdout: "hi\n", exitCode: 0 })).toEqual({ status: "passed" });

  // yapping("x\n") prints a blank line where yapping("x") does not, and the
  // curriculum teaches that difference — so the checker must see it too.
  expect(evaluateRun(result({ stdout: "hi\n\n" }), { stdout: "hi\n", exitCode: 0 }).status).toBe("failed");
});

test("a timed-out run fails a lesson that expected output", () => {
  const outcome = evaluateRun(result({ timedOut: true, exitCode: -1 }), { stdout: "anything\n", exitCode: 0 });
  expect(outcome.status).toBe("failed");
  expect(outcome.status === "failed" && outcome.reasons.join()).toContain("never finished");
});

test("a lesson about non-termination passes only when the run is cut off", () => {
  expect(evaluateRun(result({ timedOut: true, exitCode: -1 }), { exitCode: -1, timedOut: true })).toEqual({
    status: "passed",
  });
  expect(evaluateRun(result({ stdout: "finished\n" }), { exitCode: -1, timedOut: true }).status).toBe("failed");
});
