import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Playground from "./Playground";
import { runBrainrot, RuntimeLoadError } from "./playground/runtime";
import type { RunResult } from "./playground/runtime";

// runtime.ts itself statically imports createWasmWorker.ts, which uses
// `new Worker(new URL(..., import.meta.url))` — real browser/webpack
// syntax that CRA's Jest/babel transform can't parse. Mocking the whole
// module (the same way runtime.test.ts mocks one level deeper, at
// createWasmWorker) keeps that out of the module graph entirely; this
// file only cares about runBrainrot's public Promise<RunResult> contract,
// not its internals (those are runtime.test.ts's job).
//
// RuntimeLoadError is redefined here (not pulled via requireActual) for
// the same reason: the real module isn't loadable under Jest at all. A
// standalone class works fine for the `instanceof` checks in
// Playground.tsx's catch handler, since both it and this test file import
// "RuntimeLoadError" from this same mocked module — same class reference.
jest.mock("./playground/runtime", () => ({
  runBrainrot: jest.fn(),
  RuntimeLoadError: class RuntimeLoadError extends Error {},
}));

const mockRunBrainrot = runBrainrot as jest.MockedFunction<typeof runBrainrot>;

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  mockRunBrainrot.mockReset();
  sessionStorage.clear();
});

test("renders idle with the hello world example loaded and Run enabled", () => {
  render(<Playground />);

  expect(screen.getByLabelText("Brainrot code editor").textContent).toContain("Hello, World!");
  expect(screen.getByRole("button", { name: /run/i })).toBeEnabled();
  expect(screen.getByText(/hit run.*to see what happens/i)).toBeInTheDocument();
});

test("running a program shows its stdout and exit code", async () => {
  const user = userEvent.setup();
  const { promise, resolve } = deferred<RunResult>();
  mockRunBrainrot.mockReturnValue(promise);
  render(<Playground />);

  await user.click(screen.getByRole("button", { name: /run/i }));
  resolve({ stdout: "Hello, World!\n", stderr: "", exitCode: 0, timedOut: false });

  await waitFor(() => expect(screen.getByText(/^Hello, World!$/)).toBeInTheDocument());
  expect(screen.getByText(/exit code: 0/i)).toBeInTheDocument();
  expect(mockRunBrainrot).toHaveBeenCalledWith(expect.stringContaining("Hello, World!"), "");
});

test("disables Run/Reset and shows a spinner while a run is in flight", async () => {
  const user = userEvent.setup();
  const { promise, resolve } = deferred<RunResult>();
  mockRunBrainrot.mockReturnValue(promise);
  render(<Playground />);

  await user.click(screen.getByRole("button", { name: /run/i }));

  expect(screen.getByRole("button", { name: /running/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: /reset/i })).toBeDisabled();

  resolve({ stdout: "hi\n", stderr: "", exitCode: 0, timedOut: false });
  await waitFor(() => expect(screen.getByRole("button", { name: /^run$/i })).toBeEnabled());
  expect(screen.getByRole("button", { name: /reset/i })).toBeEnabled();
});

test("a timed-out result shows an explicit infinite-loop message, not a bare error", async () => {
  const user = userEvent.setup();
  mockRunBrainrot.mockResolvedValue({ stdout: "", stderr: "", exitCode: -1, timedOut: true });
  render(<Playground />);

  await user.click(screen.getByRole("button", { name: /run/i }));

  expect(await screen.findByText(/infinite loop/i)).toBeInTheDocument();
});

test("stderr renders visually distinct from stdout", async () => {
  const user = userEvent.setup();
  mockRunBrainrot.mockResolvedValue({
    stdout: "normal output\n",
    stderr: "uh oh\n",
    exitCode: 1,
    timedOut: false,
  });
  render(<Playground />);

  await user.click(screen.getByRole("button", { name: /run/i }));

  const stderrLabel = await screen.findByText("stderr");
  const stdoutEl = screen.getByText(/^normal output$/);
  const stderrEl = screen.getByText(/^uh oh$/);

  // Distinct visually: a dedicated "stderr" label exists, and the stderr
  // block (color applied on its wrapping container, inherited by the
  // <pre> via `currentColor`) uses a different color than plain stdout.
  expect(stderrLabel).toBeInTheDocument();
  expect(stdoutEl.className).not.toMatch(/text-red/);
  expect(stderrEl.closest("div")?.className).toMatch(/text-red/);
});

test("a RuntimeLoadError degrades gracefully: read-only code, no Run button, install link", async () => {
  const user = userEvent.setup();
  mockRunBrainrot.mockRejectedValue(
    new RuntimeLoadError("Timed out loading the Brainrot runtime (no response after 15000ms)"),
  );
  render(<Playground />);

  await user.click(screen.getByRole("button", { name: /run/i }));

  await waitFor(() => expect(screen.getByText(/couldn't load the brainrot runtime/i)).toBeInTheDocument());

  // No dead Run button left around.
  expect(screen.queryByRole("button", { name: /run/i })).not.toBeInTheDocument();

  // The code is still visible, but not editable.
  const readOnlyEditor = screen.getByLabelText(/read-only/i);
  expect(readOnlyEditor).toHaveAttribute("contenteditable", "false");
  expect(readOnlyEditor.textContent).toContain("Hello, World!");

  // A way out: a link toward the local-install instructions.
  const installLink = screen.getByRole("link", { name: /install instructions/i });
  expect(installLink).toHaveAttribute("href", "#get-started-section");
});

test("a post-ready crash (plain Error, not RuntimeLoadError) shows in the output pane and leaves the playground runnable", async () => {
  // Regression test for a real bug caught in review: every runBrainrot()
  // rejection — including a wasm trap/abort *after* the module loaded
  // fine — was treated as "the runtime failed to load," permanently
  // bricking the section (no Run button, read-only editor) over what's
  // actually just this one run's problem.
  const user = userEvent.setup();
  mockRunBrainrot.mockRejectedValue(new Error("unreachable executed"));
  render(<Playground />);

  await user.click(screen.getByRole("button", { name: /run/i }));

  await screen.findByText(/unreachable executed/i);

  // Must NOT have degraded to the load-failed panel.
  expect(screen.queryByText(/couldn't load the brainrot runtime/i)).not.toBeInTheDocument();
  const runButton = screen.getByRole("button", { name: /^run$/i });
  expect(runButton).toBeEnabled();
  expect(screen.getByLabelText("Brainrot code editor")).toHaveAttribute("contenteditable", "true");

  // Running again must still work.
  mockRunBrainrot.mockResolvedValue({ stdout: "ok\n", stderr: "", exitCode: 0, timedOut: false });
  await user.click(runButton);
  await screen.findByText(/^ok$/);
});

test("Cmd/Ctrl+Enter key-repeat cannot start a second run before state catches up", async () => {
  // Regression test for a real bug caught in review: `isRunning` is React
  // state, so it doesn't block a second runProgram() call that happens in
  // the same tick (e.g. a held-down Cmd/Ctrl+Enter repeating through
  // BrainrotEditor's keymap, which doesn't check any disabled state).
  const user = userEvent.setup();
  const { promise, resolve } = deferred<RunResult>();
  mockRunBrainrot.mockReturnValue(promise);
  render(<Playground />);

  const editor = screen.getByLabelText("Brainrot code editor");
  await user.click(editor);

  // CodeMirror's keymap handles keydown via its own DOM listener,
  // entirely outside React's synthetic event system — `userEvent.keyboard`
  // yields to React between key presses (letting isRunning:true commit
  // before the second Enter), which does not reproduce the race. Firing
  // both raw keydown events inside a single `act()` call keeps them in
  // the same synchronous batch, so both handler invocations see the same
  // pre-update `runProgram` closure — the actual race a real held-down
  // key produces.
  act(() => {
    fireEvent.keyDown(editor, { key: "Enter", ctrlKey: true });
    fireEvent.keyDown(editor, { key: "Enter", ctrlKey: true });
  });

  expect(mockRunBrainrot).toHaveBeenCalledTimes(1);

  resolve({ stdout: "hi\n", stderr: "", exitCode: 0, timedOut: false });
  await screen.findByText(/^hi$/);
});

test("Reset restores the selected example's original source after edits", async () => {
  const user = userEvent.setup();
  render(<Playground />);

  const editor = screen.getByLabelText("Brainrot code editor");
  await user.click(editor);
  await user.paste("// scribble");
  expect(editor.textContent).toContain("scribble");

  await user.click(screen.getByRole("button", { name: /reset/i }));

  expect(editor.textContent).not.toContain("scribble");
  expect(editor.textContent).toContain("Hello, World!");
});

test("switching the examples dropdown loads that example's source and stdin", async () => {
  const user = userEvent.setup();
  render(<Playground />);

  await user.selectOptions(screen.getByLabelText("Examples:"), "Rate My Rizz (slorp)");

  expect(screen.getByLabelText("Brainrot code editor").textContent).toContain("slorp(name)");

  await user.click(screen.getByText("stdin (optional)"));
  expect(screen.getByLabelText("Program stdin")).toHaveValue("Chad\n");
});

test("the stdin disclosure's open state persists across a remount within the session", async () => {
  const user = userEvent.setup();
  const { unmount } = render(<Playground />);

  await user.click(screen.getByText("stdin (optional)"));
  expect(screen.getByLabelText("Program stdin")).toBeVisible();
  unmount();

  render(<Playground />);
  expect(screen.getByLabelText("Program stdin")).toBeVisible();
});

test("the output pane is a live region so screen readers announce results", async () => {
  const user = userEvent.setup();
  mockRunBrainrot.mockResolvedValue({ stdout: "hi\n", stderr: "", exitCode: 0, timedOut: false });
  render(<Playground />);

  await user.click(screen.getByRole("button", { name: /run/i }));
  await screen.findByText(/^hi$/);

  const liveRegion = screen.getByTestId("playground-output");
  expect(liveRegion).toHaveAttribute("aria-live", "polite");
  expect(liveRegion).toContainElement(screen.getByText(/^hi$/));
});

test("Cmd/Ctrl+Enter in the editor runs the program", async () => {
  const user = userEvent.setup();
  mockRunBrainrot.mockResolvedValue({ stdout: "hi\n", stderr: "", exitCode: 0, timedOut: false });
  render(<Playground />);

  const editor = screen.getByLabelText("Brainrot code editor");
  await user.click(editor);
  await user.keyboard("{Control>}{Enter}{/Control}");

  await waitFor(() => expect(mockRunBrainrot).toHaveBeenCalledTimes(1));
});

test("no output pane is left empty-looking before the first run", () => {
  render(<Playground />);
  // Regression guard for #9's "must not render... an empty box" — there
  // must always be *some* text content in the output pane, even idle.
  const outputRegion = screen.getByTestId("playground-output");
  expect(outputRegion.textContent?.trim()).not.toBe("");
});

test("shows FizzBuzz's real output", async () => {
  const user = userEvent.setup();
  mockRunBrainrot.mockResolvedValue({
    stdout: "1\n2\nFizz\n4\nBuzz\n",
    stderr: "",
    exitCode: 0,
    timedOut: false,
  });
  render(<Playground />);
  await user.selectOptions(screen.getByLabelText("Examples:"), "FizzBuzz");

  await user.click(screen.getByRole("button", { name: /run/i }));

  const output = screen.getByTestId("playground-output");
  await waitFor(() => expect(within(output).getByText(/Fizz/)).toBeInTheDocument());
  expect(within(output).getByText(/Buzz/)).toBeInTheDocument();
});
