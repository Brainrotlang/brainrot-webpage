---
name: feature
description: Implement a new feature end to end — contract first, traced through every layer, adversarially tested
---

You are implementing a new feature in this repository.

You are not here to produce a diff that looks plausible. You are here to
produce a change that the reviewer described in `/code-review` would
approve — and that reviewer assumes every abstraction you introduce is a
promise the system must keep for the next ten years.

Read `AGENTS.md` before you start. It describes the architecture, the
commands, and the invariants that already exist. Do not rediscover them by
breaking them.

---

# 1. Establish the contract before writing code

Do not start editing until you can state, in plain sentences:

* what the feature must do, observably, from a user's point of view
* what the acceptance criteria are (from the issue, if there is one)
* what the public surface is — every exported function, type, prop, and
  file the rest of the codebase will now depend on
* what each of those promises: inputs, outputs, error behavior, ownership
  of anything it allocates or returns, and what remains true afterwards
* what is explicitly out of scope

If the request is ambiguous, resolve the ambiguity from the codebase and the
linked issue, and state the interpretation you chose. Do not silently pick
the easiest reading.

Ask yourself: **what must be true for this implementation to deserve its own
description?** Write that down. It becomes your test list.

---

# 2. Find the shape that already exists

Before adding a new abstraction, find out whether the codebase already has
one for this job.

* Is there an existing module that owns this concern? Extend it rather than
  building a parallel mechanism beside it.
* Is there an existing pattern for this kind of thing? Follow it.
* Is there a single source of truth this feature must read from rather than
  copy? (`src/wasmVersion.json` is the obvious one.)

Duplicated machinery is worse than a slightly awkward extension. Two things
that must be kept in sync will eventually not be in sync.

If you genuinely need a new abstraction, justify it: what does it make
impossible to express wrong? An abstraction that only saves typing is not
paying for itself.

---

# 3. Trace the feature end to end

A feature that exists at one layer and is ignored at the next is not
implemented.

For anything touching the playground, walk the whole path:

`Playground.tsx` → `runBrainrot()` → `createWasmWorker()` → `wasmWorker.ts`
→ `runInModule()` → the Emscripten module → `brainrot.wasm`, and then the
result all the way back.

For anything touching build or deploy, walk: `package.json` script →
`Makefile` target → `.github/workflows/build.yml` → `deploy.yml` →
`nginx.conf` / S3 cache headers. A rule that lives in two places must be
changed in both.

At each layer ask: is the new information still present here, or did it
quietly become `undefined`? A field you accept in a props type and then drop
before it reaches the runtime is not support for that field.

---

# 4. Make invalid states unrepresentable

Prefer, in this order:

1. a type that cannot express the bad state
2. a check that rejects it at the boundary, before anything else runs
3. a documented, tested, deliberate fallback

Never: a silent default that lets malformed input flow onward looking valid.

Concretely, watch for the pairs that must move together — a flag and the
data it describes, a timeout and the phase it belongs to, a version string
and the asset it busts the cache for. If two fields can disagree, either
collapse them into one or make the disagreement impossible to construct.

TypeScript here is `strict`. Use it. Discriminated unions over optional
fields; narrow explicitly rather than casting. `any` is not an option, and a
cast needs a comment explaining what makes it sound.

---

# 5. Get the error paths right first

The happy path is the easy part. Before you call the feature done:

* What happens on every failure — network, timeout, malformed input, a
  rejected promise, a component unmounting mid-flight?
* Does a failure leave partial state visible to anything else?
* Is anything registered, cached, or persisted before validation succeeds?
* Are the distinct kinds of failure still distinguishable to the caller?
  This repository deliberately separates `RuntimeLoadError` ("the runtime
  never came up") from a plain `Error` ("the program crashed after
  loading"). Do not collapse that.
* Is every resource released on every path — including early returns and
  the error path? Workers must be terminated, timers cleared, listeners
  removed.

"It reports an error" is not the same as "it handles the error."

---

# 6. Write tests that could fail

For each test you write, answer: **what incorrect implementation would still
pass this?** If the answer is "a fairly plausible wrong one," the test is
not earning its place.

Choose the right layer honestly:

* **Jest / React Testing Library** for UI behavior and orchestration logic.
  `runtime.test.ts` mocks `createWasmWorker` — tests there prove things
  about promise and timer plumbing and nothing whatsoever about wasm.
* **`scripts/verify-wasm-runtime.mjs`** for anything that must be true of
  the real interpreter. It runs real Brainrot programs through the real
  downloaded artifact under Node.

If your feature touches wasm behavior and you only added mocked tests, say
so out loud in the PR description rather than letting green CI imply
coverage you did not write.

Cover, where they apply: empty and zero values, boundaries, the opposite
direction of any conversion, concurrent or repeated invocation, failure
after partial success, and cleanup. Test the contract you wrote in step 1,
not the code you happened to produce.

---

# 7. Documentation and comments

* Comments explain **why**, never what. This codebase's file headers carry
  real rationale — why a fresh Worker per run, why the stamp file is deleted
  first. Match that standard or write nothing.
* Never write a comment that describes your change ("now also supports X").
  Comments are for the next reader, who has no idea a change happened.
* If you altered behavior that an existing comment, JSDoc, or `README.md`
  described, update it. A stale comment is a bug you shipped.
* Update `AGENTS.md` if you introduced or changed an invariant, a command,
  or a piece of architecture that a future agent would otherwise have to
  reverse-engineer.

---

# 8. Verify before you claim it works

Run the same sequence CI runs:

```
CI=true yarn test --watchAll=false
yarn fetch-wasm
yarn verify:wasm
yarn build
```

Fix lint and type errors properly. Do not disable a rule to get a green
build; if a disable is genuinely correct, comment why (see the
`no-restricted-globals` disable in `wasmWorker.ts` for the standard).

Do not report success on work you did not run.

---

# 9. Keep the change scoped

One feature, one PR. If you find an unrelated defect while working — and you
will — note it in the PR description instead of folding the fix in. A
reviewer who cannot tell which hunks implement the feature cannot review the
feature.

---

# Before you finish, answer honestly

* Does the implementation satisfy the contract from step 1, at every layer,
  or does it stop one layer short?
* Can this API be used wrong without the type system or a runtime check
  catching it?
* Is there now a second place that has to be kept in sync with a first?
* Would the next feature built on top of this need to work around it?
* Does every comment, type name, and doc line I introduced tell the truth?

If any answer is unsatisfying, fix it now. It is much cheaper than fixing it
after someone else depends on it.
