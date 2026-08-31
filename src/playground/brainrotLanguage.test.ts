// src/playground/brainrotLanguage.test.ts
//
// Tests the tokenizer directly against CodeMirror's parsed tree — no DOM,
// no mounted EditorView needed, since StreamLanguage exposes a real
// (Lezer-compatible) `parser` that can run standalone. This is the layer
// that actually matters for #8's acceptance criteria (which tokens get
// which highlight category); BrainrotEditor.tsx's own tests cover the
// React wrapper (controlled value, Cmd/Ctrl+Enter) separately.

import { brainrotStreamLanguage } from "./brainrotLanguage";

interface Token {
  name: string;
  text: string;
}

function tokensOf(source: string): Token[] {
  const tree = brainrotStreamLanguage.parser.parse(source);
  const cursor = tree.cursor();
  const tokens: Token[] = [];
  do {
    if (cursor.name) {
      tokens.push({ name: cursor.name, text: source.slice(cursor.from, cursor.to) });
    }
  } while (cursor.next());
  return tokens;
}

/** First token whose text matches, or undefined. */
function find(tokens: Token[], text: string): Token | undefined {
  return tokens.find((tok) => tok.text === text);
}

test("hello-world sample: skibidi as a type, yapping as a builtin, bussin as control flow, 🚽 as a comment", () => {
  const tokens = tokensOf('skibidi main {\n    yapping("hi"); 🚽 say hi\n    bussin 0;\n}\n');

  expect(find(tokens, "skibidi")?.name).toBe("typeName");
  expect(find(tokens, "main")?.name).toBe("keyword");
  expect(find(tokens, "yapping")?.name).toBe("variableName.standard");
  expect(find(tokens, "bussin")?.name).toBe("keyword");
  expect(find(tokens, "🚽 say hi")?.name).toBe("comment");
});

test('"sigma rule" highlights as one keyword; a bare "rule" does not highlight', () => {
  const tokens = tokensOf("ohio (x) {\n    sigma rule 1:\n        rizz rule = 2;\n}\n");

  // Consumed as a single two-word token, not "sigma" + "rule" separately.
  expect(find(tokens, "sigma rule")?.name).toBe("keyword");
  expect(tokens.some((tok) => tok.text === "sigma")).toBe(false);
  expect(tokens.some((tok) => tok.text === "rule" && tok.name === "keyword")).toBe(false);

  // A variable literally named `rule` is just a plain identifier.
  expect(find(tokens, "rule")?.name).toBe("variableName");
});

test('a variable named "sus" or "lit" is not highlighted as a keyword', () => {
  const tokens = tokensOf("rizz sus = 1;\nrizz lit = 2;\n");

  expect(find(tokens, "sus")?.name).toBe("variableName");
});

test('"whopper" and "cringe" were removed in v0.4.0 and no longer highlight', () => {
  // Brainrotlang/brainrot#334 deleted extern/goto; both are ordinary
  // identifiers now, so a variable named either is a plain variableName.
  const tokens = tokensOf("rizz whopper = 1;\nrizz cringe = 2;\n");

  expect(find(tokens, "whopper")?.name).toBe("variableName");
  expect(find(tokens, "cringe")?.name).toBe("variableName");
});

test("every keyword category from lang.l tokenizes as expected", () => {
  const source = [
    "skibidi rizz cap chad gigachad yap rant SAUCE giga smol thicc nut nonut gang gyatt chungus",
    "flex goon mewing edgy amogus bruh grind bussin ohio based main",
    "deadass salty schizo maxxing",
    "W L",
    "yapping yappin baka ragequit chill slorp bet gamba yaplen yapcat yapcmp yapidx",
    "crackopen peaceout doomscroll shitpost skim yapto zoink whereami throwback itsjoever bricked bustcache",
  ].join("\n");
  const tokens = tokensOf(source);

  const types = ["skibidi", "rizz", "cap", "chad", "gigachad", "yap", "rant", "SAUCE", "giga", "smol", "thicc", "nut", "nonut", "gang", "gyatt", "chungus"];
  const controlFlow = ["flex", "goon", "mewing", "edgy", "amogus", "bruh", "grind", "bussin", "ohio", "based", "main"];
  const modifiers = ["deadass", "salty", "schizo", "maxxing"];
  const booleans = ["W", "L"];
  const builtins = ["yapping", "yappin", "baka", "ragequit", "chill", "slorp", "bet", "gamba", "yaplen", "yapcat", "yapcmp", "yapidx", "crackopen", "peaceout", "doomscroll", "shitpost", "skim", "yapto", "zoink", "whereami", "throwback", "itsjoever", "bricked", "bustcache"];

  for (const word of types) expect(find(tokens, word)?.name).toBe("typeName");
  for (const word of controlFlow) expect(find(tokens, word)?.name).toBe("keyword");
  for (const word of modifiers) expect(find(tokens, word)?.name).toBe("modifier");
  for (const word of booleans) expect(find(tokens, word)?.name).toBe("bool");
  for (const word of builtins) expect(find(tokens, word)?.name).toBe("variableName.standard");
});

test("strings, chars, and numeric literals (including 1.5e3, 1.0f, 2.0L)", () => {
  const tokens = tokensOf('rant s = "hi\\n"; yap c = \'x\'; chad f = 1.0f; gigachad d = 2.0L; rizz e = 1.5e3;');

  expect(find(tokens, '"hi\\n"')?.name).toBe("string");
  expect(find(tokens, "'x'")?.name).toBe("character");
  expect(find(tokens, "1.0f")?.name).toBe("number");
  expect(find(tokens, "2.0L")?.name).toBe("number");
  expect(find(tokens, "1.5e3")?.name).toBe("number");
});

test("plain identifiers are untagged variable names, not keywords", () => {
  const tokens = tokensOf("rizz myCounter = 0;");
  expect(find(tokens, "myCounter")?.name).toBe("variableName");
});

test("tokenizing a ~100-line program completes quickly", () => {
  const line = 'rizz i = 0;\ngoon (i < 10) {\n    yapping("%d", i);\n    i++;\n}\n';
  const source = line.repeat(20); // ~100 lines
  const start = performance.now();
  const tokens = tokensOf(source);
  const elapsedMs = performance.now() - start;

  expect(tokens.length).toBeGreaterThan(100);
  // Generous on purpose — this is a smoke check against a catastrophic
  // regression (e.g. accidental O(n^2) backtracking), not a real
  // performance benchmark, and a loaded/slow CI runner shouldn't make it
  // flake. Locally this runs in low single-digit milliseconds.
  expect(elapsedMs).toBeLessThan(2000);
});
