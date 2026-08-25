// src/useScrollToHash.ts
//
// The browser scrolls to `#some-id` by itself only for a plain same-document
// anchor click and for the initial load — neither of which describes a
// client-side route change. Once the navbar's "Playground" link became a
// router link (it has to be: from /tour a bare "#playground" resolves
// against /tour, which has no such section), nothing was left to do the
// scrolling.
//
// This also covers the case the native behaviour misses even on first
// load: React has not rendered the target element yet when the browser
// looks for it, so /#playground typed directly into the address bar would
// otherwise land at the top of the page.

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useScrollToHash(): void {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    // The id is whatever the link author wrote; a malformed one must not
    // throw out of an effect (querySelector rejects e.g. "#1"), and CSS.escape
    // is not available in every target browser this site supports.
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    target?.scrollIntoView();
  }, [pathname, hash]);
}
