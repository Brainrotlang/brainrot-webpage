// scripts/fetch-wasm.mjs
//
// Downloads the pinned brainrot.wasm/brainrot.mjs release assets from
// Brainrotlang/brainrot into public/wasm/. Run automatically before
// `yarn start`/`yarn build` (see package.json's pre-hooks) so the
// playground always has a real artifact to load — the artifact itself is
// gitignored, not committed.
//
// The version is read from src/wasmVersion.json rather than hardcoded here
// — that's the one place it's pinned; src/playground/runtime.ts reads the
// same file (via a normal import, since it's inside src/) so the two can
// never drift apart.
//
// Usage: node scripts/fetch-wasm.mjs [--force]
//   --force  re-download even if public/wasm/ already matches the pin

import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile, rename, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(repoRoot, "public", "wasm");
const files = ["brainrot.wasm", "brainrot.mjs"];
// Stamped with the fetched version after a successful download, so a
// bumped src/wasmVersion.json is actually noticed instead of silently
// reusing whatever was already sitting in public/wasm/ from a prior pin.
const stampFile = path.join(outDir, ".version");

const { version } = JSON.parse(readFileSync(path.join(repoRoot, "src", "wasmVersion.json"), "utf8"));
const baseUrl = `https://github.com/Brainrotlang/brainrot/releases/download/${version}/`;

const force = process.argv.includes("--force");
const filesPresent = files.every((f) => existsSync(path.join(outDir, f)));
const stampedVersion = existsSync(stampFile) ? readFileSync(stampFile, "utf8").trim() : null;

if (filesPresent && stampedVersion === version && !force) {
  console.log(`public/wasm/ already has ${version} — skipping fetch. Use --force to re-download.`);
  process.exit(0);
}

if (filesPresent && stampedVersion !== version) {
  console.log(`public/wasm/ has ${stampedVersion ?? "an unstamped build"}, pin is now ${version} — re-fetching.`);
}

await mkdir(outDir, { recursive: true });

// Delete the stamp before touching any artifact. Otherwise a --force
// re-fetch of the *same already-stamped* version — e.g. to repair local
// corruption — that gets interrupted after replacing one file but before
// the other would leave a mismatched wasm/mjs pair with a stamp that
// still (truthfully, as far as it knows) says "this version is ready".
// The next run would then see files present + stamp matching and skip,
// keeping the broken pair indefinitely. With the stamp gone up front, an
// interruption at any point leaves this run's next attempt seeing
// "unstamped" and re-fetching both files fully rather than trusting a
// partially-updated directory.
await rm(stampFile, { force: true });

for (const file of files) {
  const url = baseUrl + file;
  console.log(`Fetching ${url} ...`);
  const res = await fetch(url);
  if (!res.ok) {
    console.error(
      `Failed to fetch ${url}: ${res.status} ${res.statusText}\n` +
        `Does the "${version}" release on Brainrotlang/brainrot exist and have ${file} attached?`,
    );
    process.exit(1);
  }
  const bytes = Buffer.from(await res.arrayBuffer());
  // Write to a temp path and rename into place (atomic on the same
  // filesystem/directory) rather than writing the real filename directly
  // — a process kill or write error mid-download must never leave a
  // truncated/partial file visible under the real name.
  const finalPath = path.join(outDir, file);
  const tmpPath = `${finalPath}.tmp`;
  await writeFile(tmpPath, bytes);
  await rename(tmpPath, finalPath);
  console.log(`  wrote public/wasm/${file} (${bytes.length} bytes)`);
}

// Written last, only once every file above succeeded — a failed fetch
// must not leave a stamp claiming this version is ready.
await writeFile(stampFile, version);

console.log(`Done — brainrot ${version} ready in public/wasm/`);
