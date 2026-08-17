// src/setupTests.ts
//
// Auto-detected by react-scripts' Jest config (setupFilesAfterEnv) — see
// createJestConfig.js. Extends `expect` with jest-dom's DOM matchers
// (toBeInTheDocument, toHaveAttribute, etc.) for every test file.
import "@testing-library/jest-dom";

// jsdom doesn't implement Range.getClientRects()/getBoundingClientRect()
// (real layout isn't computed), which CodeMirror 6 calls during its own
// measure cycle and while resolving click position — without these,
// mounting an EditorView and clicking into it throws
// "getClientRects is not a function" and cursor placement silently
// breaks. This is a well-known jsdom gap for any DOM-measuring editor
// (CodeMirror, Monaco, Slate, ...), not specific to this component.
// Zero-sized fake rects are fine for BrainrotEditor.test.tsx's purposes —
// it asserts on document content and callback invocations, not on pixel
// layout.
if (!Range.prototype.getClientRects) {
  Range.prototype.getClientRects = () =>
    ({
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {},
    }) as unknown as DOMRectList;
}
if (!Range.prototype.getBoundingClientRect) {
  Range.prototype.getBoundingClientRect = () =>
    ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, toJSON: () => {} }) as DOMRect;
}
