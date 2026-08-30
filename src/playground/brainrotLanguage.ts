// src/playground/brainrotLanguage.ts
//
// CodeMirror 6 syntax highlighting for Brainrot, via StreamLanguage — a
// small, hand-written tokenizer function rather than a full Lezer grammar.
// See Brainrotlang/brainrot-webpage#8 for why (CodeMirror + StreamLanguage
// over Monaco: ~100-200KB vs multi-MB on a landing page).
//
// Keyword source of truth: Brainrotlang/brainrot's lang.l, not any
// downstream editor tool. Two traps already bit this org once each and
// must not recur here:
//   1. "sigma rule" is a single two-word keyword. Naive tokenizers split
//      it and highlight a bare "rule" anywhere it appears — this exact
//      bug shipped in the vim plugin (Brainrotlang/brainrot-vim-plugin#2).
//   2. `sus` and `lit` have never been real Brainrot keywords despite
//      being highlighted in this org's other editor tooling at various
//      points (brainrot-vscode-extension's grammar, the vim plugin) — do
//      not carry either over here.

import { StreamLanguage, LanguageSupport, HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import type { StringStream } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const TYPE_KEYWORDS = new Set([
  "skibidi",
  "rizz",
  "cap",
  "chad",
  "gigachad",
  "yap",
  "rant",
  "giga",
  "smol",
  "thicc",
  "nut",
  "nonut",
  "gang",
  "gyatt",
  "chungus",
]);

const CONTROL_KEYWORDS = new Set([
  "flex",
  "goon",
  "mewing",
  "edgy",
  "amogus",
  "bruh",
  "grind",
  "bussin",
  "ohio",
  "based",
  "cringe",
  // Not in #8's own keyword breakdown, but lang.l has `"main" { return
  // MAIN; }` — a genuine reserved word (unlike C, where `main` is just a
  // regular identifier by convention), and the hello-world sample itself
  // is `skibidi main {`. Source of truth is the lexer, not the issue text.
  "main",
]);

const MODIFIER_KEYWORDS = new Set(["deadass", "salty", "schizo", "whopper", "maxxing", "lit"]);

const BOOLEAN_LITERALS = new Set(["W", "L"]);

const BUILTIN_FUNCTIONS = new Set([
  "yapping",
  "yappin",
  "baka",
  "ragequit",
  "chill",
  "slorp",
  "bet",
  // Cryptographically safe random integers (OpenSSL RAND_bytes).
  "gamba",
  // v1 string library (Brainrotlang/brainrot#327): measure, join, compare,
  // search — all standard-library builtins, no #cooked, no keyword.
  "yaplen",
  "yapcat",
  "yapcmp",
  "yapidx",
]);

const IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*/;
// Integer or float, optional exponent, optional f/l/L suffix — covers
// 1.5e3, 1.0f, 2.0L per #8's acceptance criteria.
const NUMBER_RE = /^\d+(\.\d+)?([eE][+-]?\d+)?[fFlL]?/;
const STRING_RE = /^"([^"\\]|\\.)*"?/;
const CHAR_RE = /^'([^'\\]|\\.)'?/;

interface BrainrotState {
  /** Brace nesting depth, tracked so `indent()` below can auto-indent the
   * line after an opening `{` and dedent a closing `}`. */
  indent: number;
}

function tokenBrainrot(stream: StringStream, state: BrainrotState): string | null {
  if (stream.eatSpace()) return null;

  // 🚽 is Brainrot's line-comment marker (see lang.l).
  if (stream.match("🚽")) {
    stream.skipToEnd();
    return "comment";
  }

  if (stream.match(STRING_RE)) return "string";
  if (stream.match(CHAR_RE)) return "character";
  if (stream.match(NUMBER_RE)) return "number";

  // Matched as one atomic token, before generic identifier matching, so a
  // bare "sigma" not followed by "rule" (not a keyword on its own) and a
  // variable literally named "rule" both correctly fall through to
  // ordinary identifier handling instead of highlighting.
  if (stream.match(/^sigma\s+rule\b/)) return "keyword";

  if (stream.match(IDENTIFIER_RE)) {
    const word = stream.current();
    if (TYPE_KEYWORDS.has(word)) return "typeName";
    if (CONTROL_KEYWORDS.has(word)) return "keyword";
    if (MODIFIER_KEYWORDS.has(word)) return "modifier";
    if (BOOLEAN_LITERALS.has(word)) return "bool";
    // "builtin" is the CodeMirror-5-legacy token name for "a name that's
    // meaningful to the runtime" — internally variableName + the
    // `standard` tag modifier. Returning the bare string "function" here
    // instead would silently produce an unstyled token: `t.function` in
    // @lezer/highlight is a tag *modifier* (like `t.standard`), not a
    // plain tag, and CodeMirror's stream-parser only accepts a modifier
    // when it's composed with a base tag (e.g. "variableName.function"),
    // not on its own — confirmed by inspecting the actual parsed tree in
    // a throwaway test before settling on this.
    if (BUILTIN_FUNCTIONS.has(word)) return "builtin";
    return "variableName";
  }

  if (stream.match(/^[{}]/)) {
    if (stream.current() === "{") state.indent++;
    else state.indent = Math.max(0, state.indent - 1);
    return null;
  }

  // Anything else (operators, other punctuation): consume one character
  // so the stream always advances.
  stream.next();
  return null;
}

export const brainrotStreamLanguage = StreamLanguage.define<BrainrotState>({
  name: "brainrot",
  startState: () => ({ indent: 0 }),
  token: tokenBrainrot,
  indent(state, textAfter, context) {
    const dedent = /^\s*\}/.test(textAfter) ? 1 : 0;
    return (state.indent - dedent) * context.unit;
  },
  languageData: {
    commentTokens: { line: "🚽" },
    indentOnInput: /^\s*\}$/,
  },
});

// Colors chosen to sit alongside the site's existing dark palette
// (bg-gray-900/800, purple-600/700 accents — see Hero.tsx/GetStarted.tsx)
// rather than importing a stock theme wholesale.
export const brainrotHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#c084fc", fontWeight: "600" }, // purple-400
  { tag: t.typeName, color: "#60a5fa" }, // blue-400
  { tag: t.modifier, color: "#f472b6" }, // pink-400
  { tag: t.bool, color: "#fb923c" }, // orange-400
  // Matches the "builtin" token returned above: variableName + the
  // `standard` modifier, same composition the CodeMirror-5-legacy
  // "builtin" name resolves to internally.
  { tag: t.standard(t.variableName), color: "#4ade80" }, // green-400, matches the plain code blocks in GetStarted.tsx
  { tag: t.string, color: "#fde047" }, // yellow-300
  { tag: t.character, color: "#fde047" },
  { tag: t.number, color: "#f87171" }, // red-400
  { tag: t.comment, color: "#9ca3af", fontStyle: "italic" }, // gray-400
  { tag: t.variableName, color: "#e5e7eb" }, // gray-200
]);

export function brainrotLanguageSupport(): LanguageSupport {
  return new LanguageSupport(brainrotStreamLanguage, [syntaxHighlighting(brainrotHighlightStyle)]);
}
