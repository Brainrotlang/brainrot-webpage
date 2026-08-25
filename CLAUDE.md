# CLAUDE.md

The instructions for this repository live in a single file, `AGENTS.md`, so
that Claude Code, Cursor, and every other agent read the same thing and it
cannot drift out of sync. Read it before making changes.

@AGENTS.md

If the import above is not resolved by the tool you are running under, open
`AGENTS.md` at the repository root and follow it directly.

## Quick reference

- Package manager is Yarn Berry via Corepack. Never `npm install`.
- Full local check, matching CI: `CI=true yarn test --watchAll=false`,
  `yarn fetch-wasm`, `yarn verify:wasm`, `yarn build`.
- `src/wasmVersion.json` is the single source of truth for the pinned
  Brainrot release.
- `public/wasm/` and `build/` are generated and gitignored. Never commit them.
- Task-specific workflows are in `.cursor/commands/`: `feature.md`,
  `bugfix.md`, `code-review.md`. They are plain markdown and worth reading
  even outside Cursor.
