// src/playground/BrainrotEditor.tsx
//
// A controlled CodeMirror 6 editor for Brainrot source, wired directly
// (no React binding package) to keep bundle size down — see brainrotLanguage.ts
// for why StreamLanguage over a full Lezer grammar, and #8 for why
// CodeMirror over Monaco in the first place.

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from "@codemirror/view";
import { indentOnInput, bracketMatching, indentUnit } from "@codemirror/language";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { brainrotLanguageSupport } from "./brainrotLanguage";
import { brainrotEditorTheme } from "./theme";

export interface BrainrotEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Fired on Cmd/Ctrl+Enter. Optional so this component is usable
   * standalone (e.g. a read-only-ish preview) without a run handler. */
  onRun?: () => void;
  /** Required, not optional — a code editor with no accessible name is a
   * real gap, not a nice-to-have (#8 requirement: "focusable, labelled"). */
  ariaLabel: string;
  className?: string;
}

/**
 * value/onChange are controlled the way any other form input is, but
 * CodeMirror 6 itself is imperative — the EditorView is created once (see
 * the empty-deps effect below) and external `value` changes are synced in
 * via a second effect that only dispatches when the doc actually differs,
 * so the user's own typing (which already updates `value` in the parent
 * through onChange) doesn't round-trip back in and reset the cursor/undo
 * stack on every keystroke.
 */
export function BrainrotEditor({ value, onChange, onRun, ariaLabel, className }: BrainrotEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Latest-callback refs so the editor doesn't need to be torn down and
  // rebuilt (losing cursor position and undo history) whenever a parent
  // re-render hands this component new onChange/onRun function identities.
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  onChangeRef.current = onChange;
  onRunRef.current = onRun;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        bracketMatching(),
        indentOnInput(),
        indentUnit.of("    "),
        EditorView.lineWrapping,
        brainrotLanguageSupport(),
        brainrotEditorTheme,
        keymap.of([
          {
            key: "Mod-Enter",
            run: () => {
              onRunRef.current?.();
              return true;
            },
          },
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
      ],
    });

    const view = new EditorView({ state, parent: container });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Deliberately empty: the editor is created once per mount. `value`
    // changes are handled by the sync effect below instead of recreating
    // the whole editor (which would lose cursor position/undo history);
    // onChange/onRun changes are picked up via the refs above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  return <div ref={containerRef} className={className} data-testid="brainrot-editor" />;
}
