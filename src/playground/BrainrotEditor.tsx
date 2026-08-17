// src/playground/BrainrotEditor.tsx
//
// A controlled CodeMirror 6 editor for Brainrot source, wired directly
// (no React binding package) to keep bundle size down — see brainrotLanguage.ts
// for why StreamLanguage over a full Lezer grammar, and #8 for why
// CodeMirror over Monaco in the first place.

import { useEffect, useRef } from "react";
import { Compartment, EditorState } from "@codemirror/state";
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

const ariaLabelCompartment = new Compartment();

/**
 * value/onChange are controlled the way any other form input is, but
 * CodeMirror 6 itself is imperative — the EditorView is created once (see
 * the empty-deps effect below) and external `value` changes are synced in
 * via a second effect that only acts when the doc actually differs, so the
 * user's own typing (which already updates `value` in the parent through
 * onChange) doesn't round-trip back in and reset the cursor/undo stack on
 * every keystroke.
 *
 * That sync is done via `view.setState()` with a *fresh* EditorState
 * rather than a dispatched transaction. A dispatched replace, even with
 * `Transaction.addToHistory.of(false)`, only keeps that one transaction
 * off the stack — pre-existing undo items are still mapped through it, so
 * a user who types, then triggers a Reset/template-load, then hits
 * Cmd/Ctrl+Z would land on a buffer that's neither "undo my last
 * keystroke" nor "undo the reset," just corrupted. A fresh EditorState
 * gets a fresh (empty) history extension instance, so undo has nothing to
 * replay across the boundary — Cmd/Ctrl+Z right after loading a sample is
 * correctly a no-op instead of restoring (or mangling) whatever was there
 * before. It also means the updateListener's `docChanged` is naturally
 * false for this path (setState produces an update with no transactions),
 * so no annotation is needed to keep it from re-invoking onChange.
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

  const createState = (doc: string, label: string) =>
    EditorState.create({
      doc,
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
        // In its own Compartment, not baked directly into the extensions
        // list as a plain value, so a later ariaLabel prop change (unlike
        // onChange/onRun, this one isn't read from a ref) can be applied
        // via reconfigure in the effect below without a full state reset.
        ariaLabelCompartment.of(EditorView.contentAttributes.of({ "aria-label": label })),
      ],
    });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const view = new EditorView({ state: createState(value, ariaLabel), parent: container });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Deliberately empty: the editor is created once per mount. `value`
    // and `ariaLabel` changes are handled by the sync effects below
    // instead of recreating the whole editor (which would lose cursor
    // position/undo history); onChange/onRun changes are picked up via
    // the refs above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.setState(createState(value, ariaLabel));
    }
    // ariaLabel is intentionally not a dependency here: this effect should
    // only reset state (and clear history) when the *content* changes.
    // An ariaLabel-only change is handled by the reconfigure effect below,
    // which doesn't touch history/selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: ariaLabelCompartment.reconfigure(EditorView.contentAttributes.of({ "aria-label": ariaLabel })),
    });
  }, [ariaLabel]);

  return <div ref={containerRef} className={className} data-testid="brainrot-editor" />;
}
