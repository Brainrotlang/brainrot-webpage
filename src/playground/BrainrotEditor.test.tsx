import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrainrotEditor } from "./BrainrotEditor";

test("renders with an accessible label", () => {
  render(<BrainrotEditor value="skibidi main { }" onChange={() => {}} ariaLabel="Brainrot code editor" />);
  expect(screen.getByLabelText("Brainrot code editor")).toBeInTheDocument();
});

test("typing fires onChange with the new controlled value", async () => {
  // jsdom has no real layout (Range.getClientRects/getBoundingClientRect
  // are polyfilled with zero-size rects in setupTests.ts, since jsdom
  // doesn't implement them at all), so click-to-cursor-position isn't
  // pixel-accurate here the way it is in a real browser — clicking
  // reliably lands at the start of the document instead of wherever it
  // was visually clicked. That's a known jsdom limitation orthogonal to
  // what this test needs to prove: that a keystroke reaches onChange
  // with the actually-updated document content, not that click
  // positioning is pixel-perfect (the real-browser check covers that).
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(<BrainrotEditor value="rizz x" onChange={onChange} ariaLabel="editor" />);

  const content = screen.getByLabelText("editor");
  await user.click(content);
  await user.keyboard("!");

  expect(onChange).toHaveBeenCalled();
  const lastValue = onChange.mock.calls[onChange.mock.calls.length - 1][0];
  expect(lastValue).toContain("!");
  expect(lastValue).toContain("rizz x");
});

test("Cmd/Ctrl+Enter fires onRun", async () => {
  const user = userEvent.setup();
  const onRun = jest.fn();
  render(<BrainrotEditor value="skibidi main { }" onChange={() => {}} onRun={onRun} ariaLabel="editor" />);

  const content = screen.getByLabelText("editor");
  await user.click(content);
  await user.keyboard("{Control>}{Enter}{/Control}");

  expect(onRun).toHaveBeenCalledTimes(1);
});

test("an external (parent-driven) value change does not re-fire onChange", () => {
  // Regression test for a real bug caught in review: the sync effect used
  // to dispatch a plain transaction, which the updateListener couldn't
  // distinguish from user typing — a Reset/template-load would spuriously
  // call onChange right back, even though the parent (not the user) is
  // the one that changed the value.
  const onChange = jest.fn();
  const { rerender } = render(<BrainrotEditor value="rizz x = 1;" onChange={onChange} ariaLabel="editor" />);

  rerender(<BrainrotEditor value="rizz y = 2;" onChange={onChange} ariaLabel="editor" />);

  expect(screen.getByLabelText("editor").textContent).toBe("rizz y = 2;");
  expect(onChange).not.toHaveBeenCalled();
});

test("an external value change does not pollute the undo stack", async () => {
  // Regression test for a real bug caught in review: without
  // Transaction.addToHistory.of(false), a Reset/template-load is
  // recorded as a normal edit, so Cmd/Ctrl+Z right after loading a
  // sample would restore whatever was there before the load — not what
  // a user pressing undo would expect (they didn't type anything).
  const user = userEvent.setup();
  const onChange = jest.fn();
  const { rerender } = render(<BrainrotEditor value="rizz x = 1;" onChange={onChange} ariaLabel="editor" />);

  rerender(<BrainrotEditor value="rizz y = 2;" onChange={onChange} ariaLabel="editor" />);
  expect(screen.getByLabelText("editor").textContent).toBe("rizz y = 2;");

  const content = screen.getByLabelText("editor");
  await user.click(content);
  await user.keyboard("{Control>}z{/Control}");

  // Must still show the synced value — undo had nothing of the user's own
  // to revert.
  expect(screen.getByLabelText("editor").textContent).toBe("rizz y = 2;");
});

test("an ariaLabel prop change updates the editor's accessible name", () => {
  // Regression test for a real bug caught in review: ariaLabel was baked
  // into the extensions list at creation time and never revisited, so a
  // later prop change silently had no effect on the DOM.
  const { rerender } = render(<BrainrotEditor value="rizz x" onChange={() => {}} ariaLabel="first label" />);
  expect(screen.getByLabelText("first label")).toBeInTheDocument();

  rerender(<BrainrotEditor value="rizz x" onChange={() => {}} ariaLabel="second label" />);

  expect(screen.queryByLabelText("first label")).not.toBeInTheDocument();
  expect(screen.getByLabelText("second label")).toBeInTheDocument();
});
