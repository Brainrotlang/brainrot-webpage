// src/routerFuture.ts
//
// React Router 6 warns on every render about two behaviours that change in
// v7, and both changes are safe here today, so opt in rather than train
// ourselves to ignore console warnings:
//
//   v7_startTransition    — route state updates go through
//                           React.startTransition. Nothing here depends on
//                           those updates being synchronous.
//   v7_relativeSplatPath  — relative link resolution inside splat ("*")
//                           routes changes. The only splat route is the 404
//                           page, and it links absolutely.
//
// Shared by index.tsx and the tests so the app under test is configured the
// same way as the app that ships. React Router 7 itself is deliberately not
// adopted: CRA 5's jest-resolve cannot resolve its `react-router/dom`
// subpath export, which breaks every suite that imports the router.

import type { BrowserRouterProps } from "react-router-dom";

export const ROUTER_FUTURE: BrowserRouterProps["future"] = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};
