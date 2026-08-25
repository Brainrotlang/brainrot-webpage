---
name: bugfix
description: Diagnose and fix a defect — reproduce it, prove the root cause, fix the cause rather than the symptom
---

You are fixing a bug in this repository.

The standard is not "the reported symptom stopped happening." The standard
is "the reason the symptom was possible no longer exists, and a test would
have caught it."

Read `AGENTS.md` before you start. Several behaviors that look like bugs in
this codebase are deliberate — the fresh Worker per run, the two separate
timeout budgets, the plain-JS duplicate of `runInModule` in
`scripts/verify-wasm-runtime.mjs`. Each has a comment explaining why. Read
the comment before you "fix" it.

---

# 1. Reproduce it first

Do not begin editing on a theory.

* Reproduce the failure, or write a failing test that reproduces it.
* If you cannot reproduce it, say so explicitly and state what you would
  need — logs, a browser version, the exact input, a repro branch. Do not
  guess at a fix for a bug you have never seen fail.
* Record the exact observed behavior and the exact expected behavior. "It's
  broken" is not a defect report; "with a 40ms load and a 30ms timeout, the
  promise resolves `timedOut: true` instead of returning the program's real
  output" is.

The failing test you write here is the deliverable, not scaffolding. It goes
in the PR.

---

# 2. Establish what the contract actually was

Before deciding what is wrong, decide what was supposed to be true.

* What does the function's signature, JSDoc, type, or file header promise?
* What does the issue or the calling code assume?
* Which of the two is wrong — the implementation, or the promise?

This matters, because the fix differs. If the code is wrong, fix the code.
If the documented contract was never achievable, fix the contract and every
caller that relied on it — quietly narrowing behavior to match a bug is how
you get a second bug later.

---

# 3. Find the root cause, not the last line that touched the data

Walk backwards from the symptom until you reach the point where a promise
was first broken, then keep going one more step and ask why that was
possible.

Useful framings, roughly in order of how often they turn out to be the real
answer here:

* **A declaration disagrees with runtime behavior.** The type, comment, or
  descriptor says X; execution does Y. Whoever wrote the caller believed X.
* **Two representations of the same fact drifted.** A version pinned in two
  files, a cache rule in `deploy.yml` and `nginx.conf`, an implementation
  and its reimplementation. One got updated.
* **An invariant was never enforced.** The bad state was always
  constructible; today is just the first time someone constructed it.
* **Ownership or lifetime is unclear.** Something was terminated, cleared,
  freed, or reused while another path still assumed it was live. Stale
  messages from a terminated Worker, timers that outlive their promise,
  state that survives across runs that should not.
* **Two macrotasks race.** Especially in `runtime.ts`, where a timer firing
  and a `postMessage` landing are both ordinary queued tasks and either can
  win.
* **An error path continues as though nothing happened.** Validation
  reported the problem and then execution carried on with malformed state.

State the root cause in one sentence before you write the fix. If you cannot,
you have not found it yet.

---

# 4. Fix the cause

Prefer, in order:

1. Make the bad state impossible to represent.
2. Reject it at the boundary, before it can propagate.
3. Handle it explicitly, with a comment saying why that handling is correct.

A guard added at the point of the crash, with the malformed value still
flowing through the system, is not a fix. Neither is a `try/catch` that
swallows the symptom, a null check that masks who produced the null, or a
retry that hides a race.

Ask: **where else could this same root cause bite?** If the answer is "three
other call sites," fix the mechanism rather than the three call sites, or
explain why you did not.

Ask also: **is this fix the smallest correct one?** Bug fixes should not
arrive carrying a refactor. If the correct fix genuinely requires structural
change, say so explicitly in the PR description rather than letting it look
incidental.

---

# 5. Regression-test the cause, not the reproduction

Your failing test from step 1 proves the symptom is gone. That is the
minimum, not the goal.

Also cover:

* the boundary the bug lived on, from both sides
* the opposite direction, if there is one
* the state the bug left behind — was anything registered, cached, or
  rendered before the failure?
* cleanup on the failing path: timers cleared, Workers terminated,
  listeners removed
* nearby cases the same root cause could have reached

Then ask the review question: **what other broken implementation would still
pass these tests?** If a plausible one exists, the tests are too narrow.

Pick the honest layer. `runtime.test.ts` mocks the Worker, so a test there
cannot prove anything about wasm interop; `scripts/verify-wasm-runtime.mjs`
runs the real artifact but cannot exercise termination. If the bug lives
somewhere neither layer can reach, say so plainly instead of writing a test
that only looks like coverage.

---

# 6. Fix the comments too

If the bug existed because a comment, JSDoc, type name, or `README.md`
section described behavior that was never true, that text is part of the
defect. Correct it in the same PR.

If your fix changes behavior that an accurate comment described, update the
comment. Do not annotate the fix itself ("fixed the race here") — write what
the code now guarantees and why, for a reader who does not know a bug ever
existed.

---

# 7. Verify

Run what CI runs:

```
CI=true yarn test --watchAll=false
yarn fetch-wasm
yarn verify:wasm
yarn build
```

Confirm the new test fails without your fix and passes with it. Actually
check this — revert the fix, watch it fail, restore it. A regression test
that passes against the broken code is worse than no test, because it
records a false guarantee.

---

# 8. Write the PR description like an incident note

State:

* the observed symptom and how to reproduce it
* the root cause, in one or two sentences
* why the fix addresses the cause rather than the symptom
* what the new test would have caught
* anything you found and deliberately did not fix, and why

If you fixed the symptom because the root cause is out of scope, say that
outright and open the follow-up. An honest partial fix is reviewable. A
partial fix presented as complete is not.
