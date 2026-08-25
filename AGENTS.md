# AGENTS.md

Instructions for AI coding agents working in this repository. Humans are
welcome to read it too — it is a condensed version of what you would
otherwise have to reconstruct by reading the whole tree.

## What this repository is

`brainrot-webpage` is the documentation site and browser playground for the
[Brainrot](https://github.com/Brainrotlang/brainrot) programming language.
It is a Create React App (react-scripts 5) single-page app: React 19 +
TypeScript + Tailwind, deployed as static files to S3/CloudFront.

The interesting part is not the marketing page — it is the playground, which
runs the real Brainrot interpreter, compiled to WebAssembly, inside the
visitor's browser.

## Commands

Yarn (Berry, via Corepack) is the package manager; `packageManager` in
`package.json` pins the version. Do not use `npm` — it will not honour
`yarn.lock` and CI installs with `--immutable`.

| Task | Command |
| --- | --- |
| Install | `yarn install` |
| Dev server | `yarn start` (http://localhost:3000) |
| Production build | `yarn build` (output in `build/`) |
| Typecheck | `yarn typecheck` |
| Unit tests | `CI=true yarn test --watchAll=false` |
| Download the pinned wasm | `yarn fetch-wasm` (add `--force` to re-download) |
| Verify wasm interop for real | `yarn verify:wasm` |
| Verify tour lessons for real | `yarn verify:lessons` |

`Makefile` is a thin wrapper over these plus the Docker targets
(`make docker-build`, `make docker-run`, `make deploy-s3`). The yarn scripts
remain the source of truth; if you add a script, decide deliberately whether
the Makefile needs a matching one-word target.

`yarn fetch-wasm` runs automatically before `start` and `build` via the
`prestart`/`prebuild` hooks. `yarn verify:wasm` does **not** fetch for you —
it fails fast if `public/wasm/brainrot.mjs` is missing.

## CI

`.github/workflows/build.yml` runs on every PR to `main`, on Node 24:
install (immutable) → `typecheck` → unit tests → fetch wasm → `verify:wasm` →
`verify:lessons` → production build. Both workflows use `paths-ignore` for
`**/*.md`, `CODEOWNERS` and
`Makefile`, so a docs-only change will show no build at all. That is
expected, not a broken pipeline.

`.github/workflows/deploy.yml` deploys `main` to S3 with OIDC-assumed AWS
credentials. Its cache-control split is load-bearing: content-hashed assets
get `immutable`, `index.html` gets `no-cache`, and `*.mjs` needs an explicit
`application/javascript` content type or the browser's `import()` of
`brainrot.mjs` fails silently. `nginx.conf` carries the same `.mjs` fix for
the Docker image. Change one, check the other.

The app also has client-side routes, so a host that serves a deep URL as a
missing file breaks refreshes and shared links. `nginx.conf` handles it with
`try_files`; CloudFront needs custom error responses mapping 403 and 404 to
`/index.html`, applied once per distribution with
`make cloudfront-spa DISTRIBUTION_ID=...` (`scripts/configure-cloudfront-spa.sh`).
No test in this repo can catch a regression there — verify by requesting a
deep route directly, since clicking through to one never leaves the SPA and
so never exercises the fallback.

## Layout

```
src/
  index.tsx, App.tsx            entry point and page composition
  Navbar/Hero/Features/         static marketing sections
  GetStarted/Footer.tsx
  Playground.tsx                homepage playground section: examples dropdown,
                                load-failure panel, composed over runner/
  wasmVersion.json              the pinned Brainrot release — single source of truth
  runner/
    runState.ts                 the states a run can be in (discriminated union)
    useBrainrotRun.ts           run state machine; owns the whole error taxonomy
    OutputPane.tsx              stdout/stderr/exit code/timeout rendering
    RunControls.tsx             Run + Reset, with a slot for surface-specific controls
    StdinPanel.tsx              the stdin disclosure and its per-surface preference
  tour/                         the guided tour (/tour), lazily loaded
    types.ts                    lesson/chapter shapes; the unions that keep
                                unverifiable exercises from compiling
    content/                    the manifest: chapters, order, prose (TSX)
    programs/                   lesson programs (CommonJS — read by both the
                                app and plain Node; see below)
    programs/claims.js          evidence for every "does not work" warning;
                                verified in CI, never shipped to the browser
    progress.ts                 localStorage progress, best-effort throughout
    check.ts                    exercise verdicts (behavioural comparison)
    Tour.tsx                    routes + progress/draft state for the subtree
    TourLanding/TourLesson/TourSidebar.tsx
  playground/
    runtime.ts                  public API: runBrainrot(); owns the timeout watchdog
    createWasmWorker.ts         Worker construction, isolated so Jest can mock it
    wasmWorker.ts               Worker entry point; loads brainrot.mjs, one run per message
    runInModule.ts              platform-agnostic "run one program in one module instance"
    brainrotLanguage.ts         CodeMirror StreamLanguage + highlight style
    BrainrotEditor.tsx          CodeMirror 6 editor component
    theme.ts, examples.ts       editor theme, starter programs
scripts/
  fetch-wasm.mjs                downloads the pinned release into public/wasm/
  verify-wasm-runtime.mjs       does the wasm interop work at all?
  verify-lessons.mjs            do the tour's programs still do what they claim?
  lib/brainrot-node.mjs         run-a-program-under-Node, shared by both
  lib/run-one-program.mjs       one program, one process (so it can be killed)
  deploy-s3.sh                  manual/CI-shared S3 sync
public/wasm/                    gitignored; populated by fetch-wasm, never committed
```

## Playground architecture — read this before touching it

The execution path is:

`Playground.tsx` → `useBrainrotRun()` (`runner/`) → `runBrainrot()`
(`runtime.ts`) → `createWasmWorker()` → `wasmWorker.ts` (in a Worker) →
`runInModule()` → Emscripten module → `brainrot.wasm`.

Anything else that runs Brainrot in the browser joins that path at
`useBrainrotRun()` — there is one execution implementation, not one per
surface. A second copy of the run/output/error handling is the thing this
split exists to prevent.

Four constraints hold this design together. Each of them was a bug once.

1. **One fresh module instance per run.** The Brainrot interpreter keeps
   global state (`current_scope`, arena allocations, stdrot's symbol cache).
   Reusing a module across runs is a correctness bug, not an optimisation
   you are leaving on the table. `runInModule()` does not cache anything and
   `runBrainrot()` spawns a brand new Worker per call.

2. **The timeout lives on the main thread.** A synchronous wasm call — say
   an infinite `goon (W) {}` loop — cannot interrupt itself. Only the main
   thread can `terminate()` the Worker from outside. Never move timeout
   logic into `wasmWorker.ts`.

3. **Load time and run time are separate budgets.** `LOAD_TIMEOUT_MS`
   covers fetching and instantiating the module; the caller's `timeoutMs`
   only starts once the worker posts `ready`. Charging a slow network
   against the program's budget would report a perfectly finite program as
   `timedOut: true`. The `loaded` flag exists specifically to distinguish
   "the module never came up" from "the run is not finished yet" — do not
   collapse it into `settled`.

4. **Load failure and program failure are different kinds of error.**
   `runBrainrot()` rejects with `RuntimeLoadError` when the runtime itself
   never came up (infrastructure problem: nothing can run here) and with a
   plain `Error` when the program crashed after loading (the program's
   problem, presentable like any other result). `useBrainrotRun()` is the
   one place that branches on it, mapping the first to `loadFailed` and the
   second to an ordinary `result`; UI code consumes `RunState` and should
   not re-derive the distinction.

## Tour content — two rules that are not obvious

**Lesson programs live in CommonJS `.js`, not TypeScript.** They have two
readers: the app (via `src/tour/content`, where TypeScript checks their shape
against `src/tour/types.ts`) and plain Node, which cannot run TypeScript and
has no `"type": "module"` here to make ESM `.js` work. CommonJS is the one
form both can read, so there is exactly one copy of every program and no
build step. Do not add JSDoc `@type` annotations to them: the *inferred*
literal shape is what the TypeScript side checks against `DemoProgram` /
`ExerciseProgram`, and declaring the type in the JS file makes that check
vacuous.

**Every `expect` must come from running the program, never from predicting
it.** The pinned interpreter rejects plenty of syntax the upstream docs
describe, and accepts things with surprising results — `based` is the
`default` keyword, so `cap based = W;` is a syntax error rather than a
variable named `based`. Write the program, run `yarn verify:lessons`, and
record what actually came out. That check also fails an exercise whose
starter already passes, which is otherwise invisible on review.

**A lesson that warns about a missing or broken feature needs a claim in
`programs/claims.js`.** Prose asserting what the interpreter *cannot* do
rots exactly as fast as prose asserting what it can, and only the claim file
makes the first kind checkable.

Also: `wasmVersion.json` is the only place the Brainrot version is pinned.
`runtime.ts` imports it, `scripts/fetch-wasm.mjs` reads it off disk (a plain
Node script cannot import from `src/`). The version is appended as a `?v=`
cache-buster to every wasm asset URL because `public/wasm/brainrot.{wasm,mjs}`
keep identical filenames across releases and CRA serves `public/` unhashed —
without it, a returning visitor can keep a stale interpreter indefinitely. If
you bump the pin, run `yarn fetch-wasm` and `yarn verify:wasm`.

## Testing

Three layers, deliberately separate:

- **Jest / React Testing Library** (`*.test.ts[x]`, run by `react-scripts
  test`) covers UI and orchestration logic. `runtime.test.ts` mocks
  `createWasmWorker` — it tests promise and timer plumbing, not wasm.
- **`scripts/verify-wasm-runtime.mjs`** runs actual Brainrot programs
  through the actual downloaded artifact under Node, answering "does the
  interop work at all". It is a standalone plain-JS reimplementation of
  `runInModule.ts` on purpose: Node in CI does not execute TypeScript, and a
  bug in one implementation should not hide inside the other. (It shares
  `scripts/lib/brainrot-node.mjs` with the lessons check — that is one copy
  of the *Node* implementation, still independent of the TypeScript one.)
- **`scripts/verify-lessons.mjs`** runs every tour lesson's canonical
  program against the pinned artifact and compares it to what the lesson
  claims. This is the only thing standing between a `wasmVersion.json` bump
  and a tour that teaches syntax the shipped interpreter rejects; a Jest
  test with a mocked runtime cannot say anything about it. Each program runs
  in a killable child process, because a lesson that never terminates must
  fail the check rather than hang CI.

  It also runs `src/tour/programs/claims.js` — the programs behind every
  "this does not work in this release" warning the lessons make. Those
  warnings are claims about the interpreter, and a claim that has quietly
  become false is worse than no warning at all: a reader who believes it
  writes worse code than one who tries it. The v0.1.5 → v0.1.6 bump is why
  this exists — `lit` went from "does not parse" to fully working and
  nothing noticed. When a claim fails, update the lesson that makes it; if
  the interpreter simply improved, delete the claim.

When you add behaviour to the playground, work out which layer honestly
covers it. A Jest test against a mocked Worker proves nothing about wasm
interop. A `verify:wasm` check cannot exercise termination, because plain
Node cannot interrupt a synchronous wasm call.

Write tests that could fail. Before you call a test done, ask what wrong
implementation would still pass it.

## Conventions

- **TypeScript is `strict`.** No `any` to get past a type error; model the
  shape properly or narrow explicitly. The existing `as unknown as
  WorkerGlobal` cast in `wasmWorker.ts` is a documented workaround for
  conflicting `dom`/`webworker` lib typings under a single-tsconfig CRA
  setup, not a licence to cast freely.
- **Two things keep the typecheck able to run at all, on TypeScript 4.9.5.**
  Import paths carry no `.tsx`/`.ts` extension (writing one requires
  `allowImportingTsExtensions`, a TypeScript 5.0 option that 4.9 rejects as
  unknown, which invalidates the whole config), and `@types/node` stays at
  `^24` or below (`26.x` fails to *parse* under 4.9 — syntax errors, which
  `skipLibCheck` does not suppress). Either mistake previously left
  `yarn build` silently transpiling without checking types at all. Expect a
  Dependabot `@types/node` bump to fail CI; the fix is a TypeScript upgrade,
  not raising the pin on its own.
- **Comments explain why, not what.** This codebase's file headers and
  inline comments carry real information — why a Worker is recreated per
  run, why the stamp file is deleted before the download, why an extra
  `setTimeout` defers the load-timeout check. Match that. Do not add
  comments that restate the line below them, and never leave a comment
  describing your change ("now also handles X") rather than the code.
- **A wrong comment is a bug.** If you change behaviour, update every
  comment and doc that described the old behaviour, including ones you did
  not otherwise touch.
- **Exports:** page-level components in `src/` use default exports;
  everything under `src/playground/` uses named exports. Follow the
  convention of the directory you are in.
- **Styling** is Tailwind utility classes in JSX. There is no CSS module
  layer; `src/index.css` holds only the Tailwind directives and globals.
- **Accessibility is linted.** `.eslintrc` enables
  `plugin:jsx-a11y/recommended`. CRA's dev server and build surface lint
  problems; do not silence a rule to make a build pass.
- **Keep dependencies boring.** This is a static docs site. A new runtime
  dependency needs a reason that survives being asked "why not do this with
  what is already here?"

## Working agreements

- Do not commit `public/wasm/` artifacts or `build/`. Both are gitignored.
- Do not run `yarn eject`.
- Keep changes scoped. Unrelated refactors belong in their own PR — say so
  rather than folding them in.
- Before opening a PR, run the same sequence CI does: `yarn typecheck`,
  `CI=true yarn test --watchAll=false`, `yarn fetch-wasm`, `yarn verify:wasm`,
  `yarn verify:lessons`, `yarn build`.
- `CODEOWNERS` assigns review of everything to `@araujo88`.

## Workflows

Task-specific prompts live in `.cursor/commands/` and are invoked with `/`
in Cursor's agent chat:

- `/feature` — implement a new feature end to end
- `/bugfix` — diagnose and fix a defect, root cause first
- `/code-review` — adversarial review of a pull request

Read the relevant one before starting that kind of work.
