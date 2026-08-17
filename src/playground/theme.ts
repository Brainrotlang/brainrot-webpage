// src/playground/theme.ts
//
// Dark editor theme matching the rest of the site's palette rather than a
// stock CodeMirror theme — bg-gray-900/800 and purple-600 accents, same as
// Hero.tsx's CTA button and GetStarted.tsx's code blocks.

import { EditorView } from "@codemirror/view";

export const brainrotEditorTheme = EditorView.theme(
  {
    "&": {
      color: "#e5e7eb", // gray-200
      backgroundColor: "#111827", // gray-900, matches GetStarted.tsx's <pre> blocks
      borderRadius: "0.5rem", // rounded-lg, matches the rest of the site's cards
      fontSize: "0.9rem",
    },
    "&.cm-editor.cm-focused": {
      outline: "2px solid #9333ea", // purple-600 — visible focus ring, required by #8
      outlineOffset: "1px",
    },
    ".cm-content": {
      fontFamily:
        'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
      caretColor: "#c084fc", // purple-400
      padding: "0.75rem 0",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#c084fc",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "#4c1d95aa", // purple-900 at ~67% opacity
    },
    ".cm-gutters": {
      backgroundColor: "#1f2937", // gray-800
      color: "#6b7280", // gray-500
      border: "none",
      borderTopLeftRadius: "0.5rem",
      borderBottomLeftRadius: "0.5rem",
    },
    ".cm-activeLine": {
      backgroundColor: "#1f293780", // gray-800 at ~50% opacity
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#374151", // gray-700
      color: "#e5e7eb",
    },
    ".cm-matchingBracket, .cm-nonmatchingBracket": {
      backgroundColor: "#9333ea55",
      outline: "1px solid #c084fc",
    },
    // Mobile: don't let a long unwrapped line force the page to scroll
    // horizontally past the editor's own bounds — #8 asks for "reasonable
    // mobile behaviour... must not break the page layout".
    ".cm-scroller": {
      overflow: "auto",
    },
  },
  { dark: true },
);
