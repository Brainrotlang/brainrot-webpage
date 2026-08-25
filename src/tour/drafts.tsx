// src/tour/drafts.tsx
//
// Keeps whatever the visitor typed into one lesson while they wander off to
// another and come back. Scoped to the tour subtree and held in memory
// only: half-finished code is not something to restore silently on a visit
// three weeks later, and Reset must always be able to get back to the
// lesson's own program.
//
// Deliberately a ref rather than state: nothing renders from the whole map,
// so a keystroke should not re-render the tour.

import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import type { ReactNode } from "react";

export interface LessonDraft {
  source: string;
  stdin: string;
}

interface DraftStore {
  getDraft: (lessonId: string) => LessonDraft | undefined;
  setDraft: (lessonId: string, draft: LessonDraft) => void;
  clearDraft: (lessonId: string) => void;
}

const DraftsContext = createContext<DraftStore | null>(null);

export function TourDraftsProvider({ children }: { children: ReactNode }) {
  const drafts = useRef(new Map<string, LessonDraft>());

  const store = useMemo<DraftStore>(
    () => ({
      getDraft: (lessonId) => drafts.current.get(lessonId),
      setDraft: (lessonId, draft) => {
        drafts.current.set(lessonId, draft);
      },
      clearDraft: (lessonId) => {
        drafts.current.delete(lessonId);
      },
    }),
    [],
  );

  return <DraftsContext.Provider value={store}>{children}</DraftsContext.Provider>;
}

/** Throws when used outside the provider — a silent no-op store would look
 *  like "edits are not preserved", which is exactly the bug it would be. */
export function useTourDrafts(): DraftStore {
  const store = useContext(DraftsContext);
  if (!store) throw new Error("useTourDrafts must be used inside TourDraftsProvider");
  return store;
}

/** Convenience for lesson state that must survive a lesson switch. */
export function useLessonDraft(lessonId: string, fallback: LessonDraft) {
  const { getDraft, setDraft, clearDraft } = useTourDrafts();
  const initial = getDraft(lessonId) ?? fallback;
  const save = useCallback((draft: LessonDraft) => setDraft(lessonId, draft), [lessonId, setDraft]);
  const discard = useCallback(() => clearDraft(lessonId), [lessonId, clearDraft]);
  return { initial, save, discard };
}
