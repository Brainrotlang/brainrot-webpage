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
//   --force  re-download even if public/wasm/ already has both files

import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(repoRoot, "public", "wasm");
const files = ["brainrot.wasm", "brainrot.mjs"];

const { version } = JSON.parse(readFileSync(path.join(repoRoot, "src", "wasmVersion.json"), "utf8"));
const baseUrl = `https://github.com/Brainrotlang/brainrot/releases/download/${version}/`;

const force = process.argv.includes("--force");
const alreadyPresent = files.every((f) => existsSync(path.join(outDir, f)));

if (alreadyPresent && !force) {
  console.log(`public/wasm/ already has ${files.join(", ")} — skipping fetch. Use --force to re-download.`);
  process.exit(0);
}

await mkdir(outDir, { recursive: true });

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
  await writeFile(path.join(outDir, file), bytes);
  console.log(`  wrote public/wasm/${file} (${bytes.length} bytes)`);
}

console.log(`Done — brainrot ${version} ready in public/wasm/`);
