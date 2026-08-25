// src/runner/StdinPanel.tsx
//
// The stdin disclosure: collapsed by default, because most programs don't
// read input and an always-open box implies they do.
//
// Its open/closed state is remembered per surface for the session, so a
// visitor who opened it once doesn't have to keep reopening it while
// working through several programs.

import { useState } from "react";

export interface StdinPanelProps {
  /** DOM id for the textarea; also ties the visually hidden label to it. */
  id: string;
  /** sessionStorage key for the remembered open state. Distinct per
   *  surface — the playground and the tour have separate boxes, and a
   *  shared key would let one surface's preference silently move the
   *  other's. */
  storageKey: string;
  value: string;
  onChange: (value: string) => void;
  /** Used only when nothing is remembered yet: a lesson that feeds stdin
   *  should show the input it is about to feed, rather than hiding it
   *  behind a disclosure the visitor has no reason to open. Read once, at
   *  mount, like any other initial state. */
  defaultOpen?: boolean;
}

/** sessionStorage access is wrapped in try/catch throughout — privacy
 * modes and some embedded/iframe contexts can throw on access, and a
 * remembered UI preference isn't worth a crash over. */
function readOpenPreference(storageKey: string, fallback: boolean): boolean {
  try {
    const stored = sessionStorage.getItem(storageKey);
    return stored === null ? fallback : stored === "true";
  } catch {
    return fallback;
  }
}

function writeOpenPreference(storageKey: string, open: boolean): void {
  try {
    sessionStorage.setItem(storageKey, String(open));
  } catch {
    // Storage disabled — the toggle just won't persist. Not fatal.
  }
}

export function StdinPanel({ id, storageKey, value, onChange, defaultOpen = false }: StdinPanelProps) {
  const [open, setOpen] = useState(() => readOpenPreference(storageKey, defaultOpen));

  const toggle = (nextOpen: boolean) => {
    setOpen(nextOpen);
    writeOpenPreference(storageKey, nextOpen);
  };

  return (
    <details className="mt-4" open={open} onToggle={(e) => toggle(e.currentTarget.open)}>
      <summary className="cursor-pointer text-sm text-gray-300 select-none">stdin (optional)</summary>
      <label htmlFor={id} className="sr-only">
        Program stdin
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Input fed to slorp() calls, one value per line…"
        className="mt-2 w-full bg-gray-900 text-green-400 font-mono text-sm rounded-lg p-3"
      />
    </details>
  );
}
