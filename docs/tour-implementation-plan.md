# Implementation plan: A Tour of Brainrot

Plan for [Brainrotlang/brainrot-webpage#14](https://github.com/Brainrotlang/brainrot-webpage/issues/14)
("Tutorial section"). No production code is changed by this document.

The issue is large and prescriptive, so this plan does three things: it fixes
the architecture and public contracts before any lesson is written, it records
what the pinned interpreter **actually** does (which is not what the issue and
the upstream docs assume), and it slices the work into PRs that can each be
reviewed on their own.

---

## 1. Contract

**What ships, observably:** a visitor can open `brainrotlang.com/tour`, work
through chapters of short lessons, edit and run every runnable example in the
browser against the same WASM interpreter the homepage playground uses, solve
exercises that are validated deterministically, share or refresh any lesson URL,
and come back later to find their place — with no account and no install.

**Public surface this introduces** (each item is a promise the codebase keeps
afterwards):

| Surface | Promise |
| --- | --- |
| `src/runner/*` | The single React-side implementation of "edit, run, show output" — used by both the homepage playground and every tour lesson. |
| `src/tour/content/*` | Data-driven lesson manifest. Navigation, progress and CI verification are all derived from it; adding a lesson touches no routing or layout code. |
| `src/tour/progress.ts` | Local, best-effort progress persistence. Never throws, never blocks the tour. |
| `scripts/verify-lessons.mjs` | Executes every runnable lesson's canonical program against the pinned artifact and asserts its declared output. |
| Routes `/`, `/tour`, `/tour/:chapter/:lesson`, `*` | Stable, deep-linkable, refresh-safe URLs. |

**Explicitly out of scope** (issue's own non-goals, plus what §7 shows is not
deliverable at the pinned version): replacing the reference docs, a second
interpreter, user accounts, synced progress, a CMS, MDX, a virtual filesystem
for `#cooked`, and lessons for language features that do not exist in
`v0.1.5`.

**Invariant that must survive the whole project:** there is exactly one browser
execution path, `runBrainrot()` → `createWasmWorker()` → `wasmWorker.ts` →
`runInModule()`. The tour adds UI and content on top of it and nothing else.
The four constraints in `AGENTS.md` ("Playground architecture — read this
before touching it") are not renegotiated by this feature.

---

## 2. What was verified before planning

Everything in §7 and the numbers below were measured in this repository at
`2e5e2de`, with `wasmVersion.json` = `v0.1.5`, not inferred from documentation.

**Repository baseline (green):** `CI=true yarn test --watchAll=false` → 44
tests in 4 suites pass. `yarn fetch-wasm` → v0.1.5 artifacts. `yarn build` →
succeeds, `159.55 kB` gzipped main bundle.

**Router choice is forced by the toolchain.** `react-router-dom@7.18.2`
installs and builds but **breaks the test suite**: CRA 5's `jest-resolve`
cannot resolve v7's `react-router/dom` subpath export, so any suite importing
it fails to run with `Cannot find module 'react-router/dom'`.
`react-router-dom@6.30.6` works untouched — a scratch suite covering deep-link
rendering, a `*` fallback and programmatic navigation passed on the first run,
and the cost measured against the real build is **+5.8 kB gzip** (`159.55` →
`165.35`). Recommendation: **pin `react-router-dom@^6.30.6`**. Do not adopt v7
as part of this feature (it would require a `moduleNameMapper` workaround in
`package.json`'s jest config, which buys nothing here). Note that Dependabot
has an open TypeScript 4.9 → 7.0 bump ([#33](https://github.com/Brainrotlang/brainrot-webpage/pull/33));
that lands or not on its own schedule and should not gate the tour.

**Nothing currently typechecks this repository, and this plan depends on types.**
Verified: adding `const brokenOnPurpose: number = 'not a number';` to
`src/Footer.tsx` and running `yarn build` reports **`Compiled successfully`**.
Three causes stack up, all pre-existing:

- `src/App.tsx` and `src/index.tsx` import with explicit `.tsx` extensions,
  which requires `allowImportingTsExtensions` — a TypeScript **5.0** option
  that 4.9.5 does not recognise, so the config itself is invalid;
- `@types/node@^26` fails to *parse* under 4.9.5 (`TS1139` and friends in
  `ffi.d.ts`), which `skipLibCheck` does not suppress because they are syntax
  errors, not type errors;
- consequently CRA's type-check step contributes nothing and `yarn build`
  reduces to a Babel transpile.

A three-part fix was verified end to end: pin `@types/node` to `^20`, drop
`allowImportingTsExtensions` from `tsconfig.json`, and remove the `.tsx`
extensions from those seven imports. After it, `npx tsc --noEmit -p
tsconfig.json` exits **0** on the whole repository, and the same deliberate
error now correctly fails `yarn build` with `TS2322`.

This matters beyond tidiness: §3.3 makes "an exercise without a verifiable
solution" a *compile* error, which is worth nothing while nothing compiles.
It belongs in P0, and it is small and mechanical — but it is a separate
concern from the tour and should be its own PR.

**The Docker path is very likely broken and matters here.** `Dockerfile` runs
`yarn install --frozen-lockfile` on `node:18-alpine`, whose bundled Yarn is
1.22, against a Yarn 4 lockfile, without Corepack and without copying
`.yarnrc.yml` (it is only copied later by `COPY . .`); its comment also claims
Node 18 "matches CI", while CI is on Node 24. This is the only in-repo way to
exercise `nginx.conf`, which is exactly what the new SPA fallback needs
testing against — see §5 and phase P0b.

---

## 3. Architecture

### 3.1 Routing

Add `react-router-dom@^6.30.6` and a `BrowserRouter` at `src/index.tsx`.

```
/                              existing landing page (unchanged composition)
/tour                          tour landing: Start / Continue / chapter overview
/tour/:chapterSlug/:lessonSlug a lesson
*                              branded 404 with a link back to /tour
```

Every lesson URL is two segments, always — no bare `/tour/welcome`. Lesson IDs
are `"<chapterSlug>/<lessonSlug>"`, so the URL, the manifest key and the
progress key are the same string and cannot drift.

Three details that are easy to get wrong and must be handled in the same PR:

- **Existing in-page anchors regress the moment a router exists.**
  `Navbar.tsx` links to `#playground` and `Playground.tsx`'s load-failure panel
  links to `#get-started-section`. From `/tour/...` those resolve to
  `/tour/...#playground` and scroll nowhere. Both must become router links to
  `/#playground` / `/#get-started-section`, plus a small effect that scrolls to
  `location.hash` after a navigation that changes the route.
- **Lazy-load the tour.** `React.lazy` the tour subtree so the landing page
  bundle does not grow by the whole curriculum. The playground's own top-level
  `runtime.ts` import stays as-is (see the rationale comment at the top of
  `Playground.tsx`).
- **The 404 route must be reachable by an invalid lesson slug**, not only by a
  bad path — a valid-looking `/tour/basics/does-not-exist` must render the
  fallback, not an empty lesson shell.

### 3.2 Shared runner extraction

`Playground.tsx` currently holds the run-state machine, the output pane, the
controls and the stdin disclosure inline. Extract, without behavior change:

```
src/runner/
  runState.ts        RunState discriminated union (idle | running | result | loadFailed)
  useBrainrotRun.ts  the run state machine: runId guard, synchronous in-flight
                     gate, RuntimeLoadError vs Error split, unmount cleanup
  OutputPane.tsx     output pane + RunResultView (aria-live, timeout copy, stderr styling)
  RunControls.tsx    Run / Reset, with an optional slot for Check
  StdinPanel.tsx     the <details> stdin disclosure + its session preference
```

Contracts worth stating explicitly, because they are where a "shared" component
usually stops being shared:

- `useBrainrotRun` owns **all** of the error semantics. `RuntimeLoadError` →
  `loadFailed` (execution disabled, degraded panel); any other rejection →
  a normal `result` with `exitCode: -1` and the message on stderr. Callers do
  not branch on error classes themselves.
- `StdinPanel` takes `storageKey` and `defaultOpen`. The playground keeps
  `brainrot-playground-stdin-open` verbatim; the tour passes its own key and
  `defaultOpen` derived from whether the lesson declares stdin. Storage access
  stays wrapped in `try`/`catch` exactly as `readStdinOpenPreference` does now.
- `useBrainrotRun` returns a `reset()` that clears state to `idle`, and the
  tour calls it on lesson change so one lesson's output can never appear under
  the next lesson's prose.

**Acceptance test for this refactor: `src/Playground.test.tsx` must pass
unmodified.** All 44 existing tests stay green and that file is not touched in
the PR. If a test needs editing, the refactor changed behavior and is wrong.

**One optional runtime addition, decided deliberately:** `runBrainrot()` has no
cancellation. A visitor clicking through lessons during a slow run leaves up to
one orphaned Worker per navigation until it settles or hits its ≤5 s budget.
The `runId` guard already makes late results harmless, so this is a resource
nit, not a correctness bug. Recommendation: add an optional `AbortSignal`
parameter to `runBrainrot()` in the framework PR (additive, keeps the single
execution path, terminates the Worker on abort) rather than letting the tour
work around it. If it is skipped, say so in the PR instead of leaving it
undiscussed.

### 3.3 Tour content model

Lessons are data, not hand-wired pages. Make the invalid combinations
unrepresentable rather than validating them at runtime:

```ts
interface LessonBase {
  id: `${string}/${string}`;   // "basics/variables" — URL, manifest key, progress key
  chapterId: string;
  title: string;
  summary: string;
  Body: () => JSX.Element;     // prose as TSX; no MDX, no new dependency
}

interface ReferenceLesson extends LessonBase {
  kind: "reference";
  /** Why this cannot run in the browser. Rendered to the visitor — a
   *  non-runnable lesson must always say what is missing. */
  notRunnableReason: string;
  snippets: readonly string[]; // shown read-only, never given a Run button
}

interface DemoLesson extends LessonBase {
  kind: "demo";
  starter: string;
  stdin?: string;
  expect: Expectation;         // required, so CI can verify every demo
}

interface ExerciseLesson extends LessonBase {
  kind: "exercise";
  starter: string;
  solution: string;            // required
  stdin?: string;
  expect: Expectation;         // required
}

type Expectation =
  | { kind: "output"; stdout?: string; stderr?: string; exitCode: number }
  | { kind: "timeout" };       // the deliberate infinite-loop lesson
```

`kind: "exercise"` cannot exist without a `solution` and an `expect`, so
"unverifiable exercise" is a compile error, and `{ kind: "timeout" }` exists so
the "a `goon` that never stops" lesson does not hang CI (§4).

Programs are the one thing both TypeScript and plain Node must read, so they
live in **CommonJS `.js` modules** under `src/tour/programs/`, exporting the
`starter` / `solution` / `stdin` / `expect` for each lesson id as ordinary
template literals. The TSX lesson modules import them for rendering;
`scripts/verify-lessons.mjs` imports the very same files under Node. No build
step, no duplicated program text, no new dependency.

CommonJS specifically, and this was verified rather than assumed: `package.json`
has no `"type": "module"`, so an ESM `.js` file would be loaded as CJS by Node
and fail, and TypeScript 4.9 with `moduleResolution: "node"` cannot resolve a
`.mjs` import. A CJS module threads both needles — `import programs from
"./programs/basics.js"` works from TypeScript via `esModuleInterop`, `import
programs from "…/basics.js"` works from an `.mjs` script via Node's ESM→CJS
default-import interop, and `allowJs` (already enabled) gives **real inference**
rather than `any`: a deliberate `number`-into-`string` mistake through that
import was caught as `TS2322`. That last property only holds once typechecking
is restored (§2).

A Jest test asserts the manifest and the program map are exactly in
correspondence — no orphan programs, no lesson missing its program.

Manifest objects are `readonly`/frozen: "Reset" restores from them and must
never be able to mutate them.

`src/playground/examples.ts` stays as it is. The dropdown examples and the tour
curriculum are different products with different lifecycles; merging them would
create the sync problem `AGENTS.md` warns about.

### 3.4 Progress

`src/tour/progress.ts`, `localStorage` key `brainrot-tour-progress`:

```ts
{ v: 1, lastLessonId: string | null, completed: string[], skipped: string[] }
```

Rules: every access wrapped in `try`/`catch` (privacy mode must degrade to a
working-but-forgetful tour, per the issue); the parsed value is shape-validated
and unknown/renamed lesson IDs are dropped on read, so a curriculum edit cannot
strand "Continue" on a lesson that no longer exists; nothing is persisted before
validation. `/tour` shows **Continue** only when a valid `lastLessonId`
survives that filter, and offers **Reset progress**.

### 3.5 Exercises

`Check` runs the current editor contents with the lesson's stdin through the
same `runBrainrot()` and compares against `expect`. Deliberate, documented
normalization: strip trailing whitespace per line and collapse a single
trailing newline; nothing else. `exitCode` is always compared, and `stderr` is
compared whenever the lesson declares it.

That last point is load-bearing, not pedantry: §7 shows v0.1.5 programs that
exit `0` while printing interpreter errors to stderr. An exercise checker that
looks only at stdout, or only at the exit code, would mark those "passed".

States are `not-run | passed | failed`, communicated with text and an icon —
never colour alone. Skipping is always allowed; a failed or skipped exercise
never blocks Next.

### 3.6 Layout, keyboard, accessibility

Desktop: persistent chapter/lesson sidebar (current lesson marked with
`aria-current`), lesson prose above editor above output, `← Previous` /
`Next →` at the end. Mobile: prose → editor → controls → output → prev/next,
with the sidebar behind a drawer that traps focus and returns it on close.

Keyboard: `Cmd/Ctrl+Enter` runs (already in `BrainrotEditor`'s keymap — reused,
not reimplemented). `PageUp`/`PageDown` for lesson navigation only when focus
is outside the editor, so they never fight the editor's own scrolling. On
lesson change, move focus to the lesson heading and reset `RunState`. Output
keeps the existing `aria-live="polite"` region. `.eslintrc` already enforces
`jsx-a11y/recommended`; no rule gets silenced to land this.

---

## 4. Version alignment and CI

The issue's sharpest requirement is that the tour must teach the version the
site actually runs. §7 shows that trusting the upstream docs instead of the
artifact would have shipped at least four lessons that cannot parse.

`scripts/verify-lessons.mjs`:

1. imports the CommonJS program modules and iterates every runnable lesson;
2. runs each `solution` (exercises) or `starter` (demos) against
   `public/wasm/brainrot.mjs` with the lesson's stdin;
3. asserts the declared stdout / stderr / exit code, or that a
   `{ kind: "timeout" }` lesson does in fact fail to terminate;
4. runs **each program in a child process with a hard kill deadline**. Plain
   Node cannot interrupt a synchronous WASM call, so without this a single bad
   lesson hangs CI instead of failing it (confirmed locally: an infinite
   `goon (W) {}` pinned a probe process until an external `timeout` killed it);
5. exits non-zero listing every lesson that drifted.

The WASM-running helper is factored into `scripts/lib/` and shared by
`verify-wasm-runtime.mjs` and `verify-lessons.mjs`. This keeps the deliberate
separation `AGENTS.md` describes — these scripts stay an independent plain-JS
implementation from `runInModule.ts`, so a bug in one cannot hide in the other
— while avoiding a third copy. `AGENTS.md` gets updated to describe the split.

Wiring: `package.json` script `verify:lessons`, `Makefile` target
`verify-lessons`, and a new step in `.github/workflows/build.yml` after
`verify:wasm`. Bumping `wasmVersion.json` then fails loudly on any lesson the
new interpreter no longer runs, which is the entire point.

---

## 5. Deployment

- **nginx** (`nginx.conf`): add `try_files $uri $uri/ /index.html;` to
  `location /`. The `.mjs` `location` block must keep winning for `.mjs` URLs —
  regex locations are matched before prefix locations, so the existing block is
  unaffected, but verify it rather than assuming.
- **CRA dev server**: deep routes already work (history API fallback is on by
  default). No change.
- **S3 / CloudFront: cannot be fixed from this repository.** A REST-origin
  distribution returns `403` for a missing key like `/tour/basics/variables`;
  the fix is a CloudFront custom error response mapping `403` (and `404`) to
  `/index.html` with status `200`, or an equivalent CloudFront Function. This
  is an infrastructure change owned by the repo owner (`CODEOWNERS`:
  `@araujo88`) and it **blocks the tour being usable in production**, no matter
  how correct the app code is. Track it explicitly; document the requirement in
  `README.md` and `AGENTS.md` next to the existing `.mjs` content-type note,
  which is the same class of "deploy detail the app cannot enforce" trap.
- Note that `index.html` is already uploaded with `no-cache` while everything
  else is `immutable`; SPA fallback does not change that split.

---

## 6. Curriculum

Chapters follow the issue's dependency order. Every runnable lesson's canonical
program is verified by §4. Lessons marked **reference** have no Run button and
must state why on the page.

| Ch | Lessons | Notes |
| --- | --- | --- |
| 0 Using the Tour | Welcome; Running Brainrot; Brainrot ↔ C | Welcome runs hello world immediately. The Rosetta table is orientation only — and must not list keywords the interpreter rejects (§7). |
| 1 Basics | `skibidi main`; comments (`🚽`); output (`yapping`/`yappin`/`baka`); variables; primitive types; type modifiers; qualifiers (`deadass`/`salty`/`schizo`); operators; `maxxing` | Modifier lesson must teach the forms that parse: `smol`, `giga rizz`, `thicc rizz`, `nut rizz`, `nonut rizz`. `maxxing` takes a variable, not a type name. Exercise: aura calculator. |
| 2 Control flow | `edgy`; `edgy`/`amogus`; `goon`; the `goon` that never stops; `flex`; `mewing ... goon`; `bruh`; `ohio`/`sigma rule`/`based` | `mewing … goon (cond)` **requires** a trailing `;`. The infinite-loop lesson is the `{ kind: "timeout" }` case. No `grind` lesson (§7). Exercise: FizzBuzz. |
| 3 Functions | definitions; parameters and returns; calls; scope; recursion | A `cap`-returning function's result must be assigned to a `cap` before being tested — teach that, since the obvious C-shaped form is rejected. No globals. Exercise: prime checker, written in the form that actually runs. |
| 4 Arrays, strings, input | arrays; brace initializers; multidimensional arrays; `yap` buffers; `rant`; `slorp()`; buffer `slorp` | Arrays cannot be passed to functions at all, so exercises keep them in `main`. Every stdin lesson **must** prefill stdin: `slorp()` on empty input is a hard error, not a zero. Exercise: rizz census. |
| 5 Pointers | `&`; declarations; dereference; writing through a pointer; `**`; call by reference; pointer arithmetic | Exercise: swap two values (verified working). Struct-typed pointer parameters do not work — keep pointers scalar here. |
| 6 User-defined types | `gang`; initializers; member access; nested aggregates; structs and functions; `chungus`; `gyatt` | Nested `gang`/`chungus` and chained `l.start.x` **do** work (the upstream *user guide* says otherwise; it is stale). Struct params and struct returns each work alone but not together — teach the working shapes and state the restriction. No `lit` lesson (§7). Exercise: cursed user profile. |
| 7 Runtime and standard Brainrot | `bet` (pass and fail); `baka` in real error handling; `ragequit` and exit codes; `chill` | `bet` failure → exit 1 with the message on stderr; the output pane already shows both. `chill(1)` costs a fifth of the 5 s run budget — one second, once. |
| 8 Advanced | `#cooked` (reference); native calls / ABI (reference); advanced qualifiers; current limitations | The limitations lesson is generated from the verified list in §7, not from upstream prose. No `whopper` lesson (§7). |
| 9 Final challenge | Ultimate Rizz Analyzer™ | Starter code provided. Uses functions, input, loops, conditionals, arrays, a `gang`, a `gyatt`, `bet` and formatted output — a combination in that shape was verified to run. |

---

## 7. What the pinned interpreter actually does

Measured by running candidate lesson programs through `public/wasm/brainrot.mjs`
at `v0.1.5` in Node, the same way `scripts/verify-wasm-runtime.mjs` does. **The
issue and the upstream docs both assume features that do not exist.** This
section is the reason §4 is not optional.

### 7.1 Issue items that cannot ship as written

| Issue item | Reality at v0.1.5 |
| --- | --- |
| §2.7 `grind` (continue) | Parse error in every form tried (inside `flex`, inside `goon`, bare, braced): `syntax error, unexpected CONTINUE`. Lexed but not implemented. |
| §6.8 `lit` (typedef) | Parse error. Not in `lang.l` at all — and `brainrotLanguage.ts` already documents that `lit` was never a real keyword. The upstream keyword table lists it anyway. |
| §8.3 `whopper` (extern) | Lexed, no grammar: `syntax error, unexpected EXTERN`. |
| §8.1 `#cooked` runnable | Correctly diagnosed as a missing file in the browser sandbox. Keep as a reference lesson, as the issue instructs. |
| `cringe` (goto) | Label syntax (`top:`) is a parse error. Not part of the issue's curriculum; do not add it. |

Recommendation: drop these lessons rather than teach syntax that errors, and
say so in the "current limitations" lesson. File upstream issues on
`Brainrotlang/brainrot` for the doc/implementation mismatches (`lit` in the
keyword table, `grind` unimplemented, the user guide's stale nested-struct
limitation, the missing `;` in its `mewing` example, and its `is_prime`
example, which does not run as written).

### 7.2 Constraints every lesson and exercise must respect

- `mewing { … } goon (cond)` requires a trailing `;`.
- A `cap`-returning function's call cannot be used directly in a condition or
  compared with `W` (`Native call result (bool) cannot be used in an integer
  context`); assign it to a `cap` first. A `rizz`-returning function cannot
  return a comparison (`expected int, got bool`).
- Arrays cannot be passed to functions — neither `rizz *a` nor `rizz a[]`.
  `yap` buffers cannot be parameters either.
- `rant` cannot be a parameter (`String parameters are not supported`), and
  `rant == "literal"` silently yields the wrong answer **while exiting 0** with
  interpreter errors on stderr.
- Globals are a parse error; a function taking a `gang` *and* returning one
  fails; struct-typed pointer parameters (`gang P *p`, both `p.x` and `(*p).x`)
  fail.
- `maxxing` takes a variable, not a type name. `yap b[6] = "hello";` is a parse
  error — fill buffers via `slorp`.
- `slorp()` with empty stdin fails hard (`Invalid integer format`, exit 1). It
  also only resolves at a typed site: `slorp() + 1` is an error by design.
- Deep recursion (~1000 frames) traps out of WASM as an uncaught throw, which
  the runtime surfaces as a post-load program crash — correct behavior, worth
  one sentence in the recursion lesson.
- `main` without `bussin` exits 0.

### 7.3 Verified working (safe to build lessons on)

Comments; `yapping`/`yappin`/`baka` and their newline behavior; `rizz`, `cap`,
`chad`, `gigachad`, `yap`, `rant` locals; `smol`, `giga rizz`, `thicc rizz`,
`nut rizz`, `nonut rizz`; `deadass` (including the enforced const error),
`salty`, `schizo`; full operator set and precedence, `!`, `++`/`--`;
`maxxing(var)` and the `maxxing(a)/maxxing(a[0])` length idiom; `edgy`/`amogus`
chains; `goon`; `flex`; `mewing … goon (…);`; `bruh`;
`ohio`/`sigma rule`/`based`, including `gyatt` constants as cases; scalar
functions and recursion; 1D/2D/3D arrays with brace initializers; `yap` buffers
via `slorp`; both `slorp` forms plus the deprecated write-back form (which warns
on stderr); pointers, `**`, call by reference, pointer arithmetic; `gang` with
nested aggregates and chained member access; `chungus` including a nested
`gang`; `gyatt` with implicit and explicit values and as a struct field; `bet`
with and without a message; `ragequit` exit codes; `chill`.

Also verified, and relevant to a follow-up: `#cooked` **does** resolve
correctly once sibling files exist in the module's filesystem. Making
multi-file lessons runnable is a small, well-understood extension of
`wasmWorker.ts`/`runInModule.ts` (a `files` map alongside `source`) — but the
issue explicitly scopes it out, so it belongs in its own issue rather than
inside this feature.

---

## 8. Testing plan

Layers stay separate, as `AGENTS.md` requires. For each area, the question
answered is "what wrong implementation would still pass this?"

**Jest / React Testing Library** — routing (`/tour` renders; a lesson deep-link
renders *that* lesson's content, not just any lesson; an invalid slug renders
the fallback; Previous/Next change the URL *and* the rendered lesson; history
back returns to the previous lesson); sidebar built from the manifest with the
active lesson marked and no broken Next on the last lesson; editor starter code,
edits, and Reset restoring the manifest value after edits; run states rendered
from a mocked `runBrainrot` (stdout, stderr, timeout, `RuntimeLoadError`
degradation, post-load crash); stdin prefilled for stdin lessons and not
surfaced elsewhere; exercise Check failing on a wrong program, passing on the
canonical solution, and — deliberately — failing a program that exits 0 while
writing errors to stderr; progress persisting, Continue resuming, Reset
clearing, and a throwing `localStorage` not breaking the tour; output remaining
a live region; focus landing on the lesson heading after navigation.

A mocked-Worker test proves nothing about WASM, so the correctness of lesson
*content* is `verify:lessons`' job (§4), never Jest's.

**`scripts/verify-lessons.mjs`** — every runnable lesson against the real
pinned artifact, with the child-process deadline.

**Manual, once per phase** — `make docker-run` and load `/tour/basics/...`
directly to prove the nginx fallback (requires P0b), plus one pass on a narrow
viewport and one keyboard-only pass.

---

## 9. Delivery phases

Each phase is one reviewable PR (P5 is several). Nothing is promoted in the
navbar until P6.

| # | Scope | Done when |
| --- | --- | --- |
| P0a | Restore typechecking: pin `@types/node@^20`, drop `allowImportingTsExtensions`, drop the seven `.tsx` import extensions (§2). | `npx tsc --noEmit -p tsconfig.json` exits 0 and a planted type error fails `yarn build`. Consider a CI step so it stays true. |
| P0b | Fix `Dockerfile` (Corepack + Yarn 4 + `--immutable`, copy `.yarnrc.yml`, Node version matching CI, correct the stale comment). Prerequisite for testing the SPA fallback at all. | `make docker-run` serves the current site. |
| P1 | Shared runner extraction (`src/runner/*`), `Playground.tsx` becomes composition. No behavior change. | 44 existing tests pass with `Playground.test.tsx` untouched. |
| P2 | Router, `/tour` landing, 404 route, lazy tour chunk, anchor-link fixes, `nginx.conf` fallback, deploy documentation + the CloudFront ask. | Deep link works in dev and in the Docker image; landing page unchanged. |
| P3 | Lesson framework: manifest types, program modules, sidebar, prev/next, layout, progress, keyboard and focus handling, plus three real lessons (one per kind). | Framework tests green; adding a lesson touches only content files. |
| P4 | `verify:lessons` + `scripts/lib/` extraction + CI step + Makefile target + `AGENTS.md` update. | CI fails when a lesson's expected output is wrong (prove it by breaking one locally). |
| P5 | Curriculum, two to three chapters per PR, in dependency order: Ch 0–1, Ch 2–3, Ch 4–5, Ch 6–7, Ch 8. | Every added lesson passes `verify:lessons`. |
| P6 | Exercises across chapters, the Ch 9 capstone and completion screen, navbar **Tour** entry, homepage "Take the Tour 🧠" CTA. | Full path walkable end to end; acceptance list in §11 satisfied or explicitly waived. |

Sequencing risk worth naming: P1 and P2 both touch `Playground.tsx`. Land P1
first and keep P2 off that file except for the anchor fix.

---

## 10. Decisions needed from the maintainer

1. **CloudFront/S3 SPA fallback** (§5) — infrastructure, outside this repo, and
   a hard blocker for the feature in production. Who makes the change, and can
   it be staged before P2 merges?
2. **`react-router-dom@^6.30.6`** rather than v7 (§2). Accepted as a boring,
   +5.8 kB dependency, or is a jest `moduleNameMapper` workaround for v7
   preferred?
3. **Dropping the `grind`, `lit` and `whopper` lessons** the issue asks for
   (§7.1), and saying plainly in the tour that those features are not in this
   release.
4. **Where the truth lives when docs and interpreter disagree.** This plan
   treats the pinned artifact as authoritative and proposes filing upstream
   issues. Confirm that is the preferred direction rather than waiting on a
   compiler release.
5. **Optional `AbortSignal` for `runBrainrot()`** (§3.2) — in, or explicitly
   deferred?
6. **Restoring typechecking as P0a** (§2). It is a prerequisite for the content
   model's guarantees, but it touches `tsconfig.json`, `@types/node` and seven
   imports outside the tour — confirm it should land as its own PR ahead of the
   feature rather than being folded in or deferred.

## 11. Acceptance criteria mapping

Issue criteria map to phases as follows: navbar/CTA/landing → P6/P2; stable
deep links and refresh-safety → P2 (+ the §5 infrastructure change); chapters,
sidebar, prev/next, mobile → P3; editable editor, single WASM runtime, shared
components, `Cmd/Ctrl+Enter`, Reset, stdout/stderr split, runtime-vs-program
failures, timeout, `slorp` stdin → P1/P3; language coverage → P5; exercises,
deterministic validation, skipping, capstone → P6; local progress, Continue,
Reset → P3; canonical examples verified against the pinned release → P4; no
playground regression, automated tests, accessibility, mobile → every phase;
`yarn build` and existing tests → CI gate on all of them.

Criteria that **cannot** be met as literally written, per §7.1: `grind`, `lit`
and `whopper` coverage, and a runnable `#cooked` lesson (the issue already
allows the reference-lesson fallback for the last one). Everything else in the
issue's list is reachable.

## 12. Follow-ups to file separately

- Multi-file `#cooked` support in the browser runner (verified feasible, §7.3).
- Upstream `Brainrotlang/brainrot` documentation and implementation mismatches
  (§7.1).
- A CI step that runs the typecheck, so P0a cannot silently regress — the
  current state is exactly what happens when nothing guards it.
- Whether to take Dependabot's TypeScript 7 bump
  ([#33](https://github.com/Brainrotlang/brainrot-webpage/pull/33)) instead of
  pinning `@types/node` back; that is a larger toolchain question than this
  feature should decide.
