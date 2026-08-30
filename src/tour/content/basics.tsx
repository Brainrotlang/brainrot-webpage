// src/tour/content/basics.tsx
//
// The "Basics" chapter: the parts of Brainrot you cannot avoid.
//
// Lesson order is dependency order, not the reference manual's order: you
// need output before variables are worth declaring, and variables before
// operators do anything visible.
//
// Where the language does not do what a C programmer would expect, the
// lesson says so. Every claim about behaviour here was checked with
// `yarn verify:lessons` against the pinned release.

import type { TourChapter } from "../types";
import { Snippet } from "../Snippet";
import programs from "../programs";

const chapterPrograms = programs.basics;

export const basicsChapter: TourChapter = {
  id: "basics",
  title: "Basics",
  lessons: [
    {
      slug: "program-structure",
      kind: "demo",
      title: "skibidi main",
      summary: "Where a program starts and what a statement looks like.",
      program: chapterPrograms["program-structure"],
      Body: () => (
        <>
          <p>
            Every Brainrot program has exactly one entry point, spelled{" "}
            <code>skibidi main</code>. <code>skibidi</code> is <code>void</code> and{" "}
            <code>main</code> is a reserved word — unlike C, where <code>main</code> is an ordinary identifier
            that everyone happens to agree on.
          </p>
          <Snippet>{`skibidi main {
    🚽 statements, in order, top to bottom
}`}</Snippet>
          <p>
            Statements run in order and end with <code>;</code>. Braces group them. <code>bussin 0</code> is
            how a program signs off, and every Brainrot program you will read ends that way.
          </p>
          <p>
            Being honest about it: in this release <code>bussin</code> inside <code>main</code> is{" "}
            <em>ignored</em> — it sets no exit code and does not even stop execution. Inside an ordinary
            function it works exactly as you would expect, and the Runtime chapter covers how to end a program
            deliberately. Keep writing it here anyway; it is what the language means, and one day it will mean
            it.
          </p>
        </>
      ),
    },
    {
      slug: "comments",
      kind: "demo",
      title: "Comments",
      summary: "The toilet. Yes, really.",
      program: chapterPrograms.comments,
      Body: () => (
        <>
          <p>
            Brainrot's comment marker is <code>🚽</code>. Everything from the toilet to the end of the line is
            ignored.
          </p>
          <Snippet>{`🚽 a whole-line comment
yapping("shipped");  🚽 or a trailing one`}</Snippet>
          <p>
            There is no block-comment form — no <code>{"/* ... */"}</code> equivalent — so commenting out a
            region means a toilet on every line.
          </p>
          <p>
            It is a real Unicode character, not an ASCII digraph. Copying Brainrot through something that
            mangles emoji will produce syntax errors that look inexplicable.
          </p>
        </>
      ),
    },
    {
      slug: "output",
      kind: "demo",
      title: "Output",
      summary: "yapping, yappin, baka — and where each one's text ends up.",
      program: chapterPrograms.output,
      Body: () => (
        <>
          <p>Three ways to print, differing in exactly two respects: the newline, and the destination.</p>
          <div className="overflow-x-auto my-4">
            <table className="text-sm">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left pr-6 pb-2">Call</th>
                  <th className="text-left pr-6 pb-2">Goes to</th>
                  <th className="text-left pb-2">Adds a newline</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr>
                  <td className="pr-6 text-purple-400">yapping</td>
                  <td className="pr-6 text-gray-300">stdout</td>
                  <td className="text-gray-300">always</td>
                </tr>
                <tr>
                  <td className="pr-6 text-purple-400">yappin</td>
                  <td className="pr-6 text-gray-300">stdout</td>
                  <td className="text-gray-300">never</td>
                </tr>
                <tr>
                  <td className="pr-6 text-purple-400">baka</td>
                  <td className="pr-6 text-gray-300">stderr</td>
                  <td className="text-gray-300">never</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <code>yapping</code> and <code>yappin</code> take a <code>printf</code>-style format string plus
            values. Since <code>yapping</code> <em>always</em> appends a newline, a format string that ends in{" "}
            <code>\n</code> gets you two — which the program below demonstrates rather than merely claiming.
          </p>
          <p>
            <code>baka</code> is the odd one out: it is for things that went wrong, and it takes{" "}
            <strong>exactly one string</strong> — no format arguments. <code>baka("value %d\n", 42)</code>{" "}
            does not parse. The Runtime chapter comes back to what that means for error messages.
          </p>
          <p>
            The output pane keeps stderr visually separate, so a program complaining about its input does not
            look like the page breaking.
          </p>
        </>
      ),
    },
    {
      slug: "variables",
      kind: "exercise",
      title: "Variables",
      summary: "Declare something, give it a value, print it. Then do it yourself.",
      program: chapterPrograms.variables,
      Body: () => (
        <>
          <p>
            A declaration is the type, then the name, then optionally a value — exactly like C, with the
            vocabulary swapped. <code>rizz</code> is an integer.
          </p>
          <Snippet>{`rizz aura = 100;      🚽 declare and initialise
aura = aura + 1;      🚽 assign later`}</Snippet>
          <p>
            <code>yapping</code> takes a format string like C's <code>printf</code>: <code>%d</code> for an
            integer, <code>%s</code> for text, <code>%f</code> for a float.
          </p>
          <p className="mt-4 p-3 bg-purple-950/40 border border-purple-800 rounded-lg">
            <strong>Your turn.</strong> Make the program print <code>aura: 9001</code>, then press{" "}
            <strong>Check</strong>. <strong>Run</strong> still just runs whatever you have written — Check is
            what compares it against what the exercise asked for.
          </p>
        </>
      ),
    },
    {
      slug: "types",
      kind: "demo",
      title: "Primitive types",
      summary: "The six types you will use constantly, and their format specifiers.",
      program: chapterPrograms.types,
      Body: () => (
        <>
          <p>Brainrot's everyday types map one-to-one onto C's:</p>
          <div className="overflow-x-auto my-4">
            <table className="text-sm">
              <tbody className="font-mono">
                {[
                  ["rizz", "int", "%d"],
                  ["cap", "bool", "%d"],
                  ["chad", "float", "%f"],
                  ["gigachad", "double", "%f"],
                  ["yap", "char", "%c"],
                  ["rant", "string", "%s"],
                ].map(([brainrot, c, spec]) => (
                  <tr key={brainrot}>
                    <td className="pr-8 text-purple-400">{brainrot}</td>
                    <td className="pr-8 text-gray-300">{c}</td>
                    <td className="text-gray-400">{spec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Booleans are written <code>W</code> and <code>L</code> — true and false. They print as{" "}
            <code>1</code> and <code>0</code>.
          </p>
          <p>
            Watch out for keywords: <code>based</code> looks like an ordinary word but it is Brainrot's{" "}
            <code>default</code>, so naming a variable <code>based</code> is a syntax error rather than a
            statement about the variable. <code>main</code>, <code>salty</code>, <code>grind</code> and{" "}
            <code>cringe</code> are all reserved too.
          </p>
        </>
      ),
    },
    {
      slug: "number-sizes",
      kind: "demo",
      title: "Wider and narrower numbers",
      summary: "smol, giga, thicc, nut, nonut — and which combinations actually parse.",
      program: chapterPrograms["number-sizes"],
      Body: () => (
        <>
          <p>
            The size and signedness modifiers are C's, renamed. What is <em>not</em> like C is that they are
            fussy about which combinations the grammar accepts in this release:
          </p>
          <div className="overflow-x-auto my-4">
            <table className="text-sm">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left pr-6 pb-2">Write this</th>
                  <th className="text-left pb-2">Meaning</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {[
                  ["smol x", "short"],
                  ["giga rizz x", "long int"],
                  ["thicc rizz x", "long long int"],
                  ["nut rizz x", "signed int"],
                  ["nonut rizz x", "unsigned int"],
                ].map(([form, meaning]) => (
                  <tr key={form}>
                    <td className="pr-6 text-purple-400">{form}</td>
                    <td className="text-gray-300">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            <code>smol</code> stands alone — <code>smol rizz</code> is a syntax error. The other four{" "}
            <em>require</em> the <code>rizz</code>: bare <code>giga</code>, <code>thicc</code> or{" "}
            <code>nut</code> will not parse. Both directions are easy to get wrong, and neither is what C
            would let you write.
          </p>
          <p>
            Plain <code>rizz</code> is what you want almost always. Reach for these when a value genuinely
            will not fit, or when you are matching an external interface.
          </p>
        </>
      ),
    },
    {
      slug: "qualifiers",
      kind: "demo",
      title: "Constants and qualifiers",
      summary: "deadass, salty, schizo — const, static, volatile.",
      program: chapterPrograms.qualifiers,
      Body: () => (
        <>
          <p>Three qualifiers, all with C's meaning:</p>
          <div className="overflow-x-auto my-4">
            <table className="text-sm">
              <tbody className="font-mono">
                {[
                  ["deadass", "const", "cannot be reassigned"],
                  ["salty", "static", "keeps its storage"],
                  ["schizo", "volatile", "do not optimise reads away"],
                ].map(([brainrot, c, meaning]) => (
                  <tr key={brainrot}>
                    <td className="pr-6 text-purple-400">{brainrot}</td>
                    <td className="pr-6 text-gray-300">{c}</td>
                    <td className="text-gray-400">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            <code>deadass</code> is the one you will actually reach for, and it is enforced rather than
            decorative — uncomment the last line in the program and you get{" "}
            <code>Cannot modify const variable</code> instead of a shrug.
          </p>
          <p>
            Note that a rejected program still tells you something: the message lands on stderr and the exit
            code is non-zero, which is how you can tell a refused program from one that ran and printed
            nothing.
          </p>
        </>
      ),
    },
    {
      slug: "operators",
      kind: "demo",
      title: "Operators",
      summary: "Arithmetic, comparison, logic, ++ and --.",
      program: chapterPrograms.operators,
      Body: () => (
        <>
          <p>
            Arithmetic is <code>+ - * / %</code>, comparison is <code>{"< > <= >= == !="}</code>, and
            precedence is C's: <code>*</code> and <code>/</code> bind tighter than <code>+</code> and{" "}
            <code>-</code>, and parentheses win. Division between integers truncates, so <code>7 / 2</code> is{" "}
            <code>3</code>.
          </p>
          <p>
            <code>&&</code>, <code>||</code> and <code>!</code> work as expected, and <code>++</code> /{" "}
            <code>--</code> come in both prefix and postfix forms. <code>!L</code> is <code>1</code>,{" "}
            <code>!W</code> is <code>0</code>, and <code>edgy (!(a &lt; b))</code> takes the branch it should.
          </p>
          <p className="text-sm text-gray-400">
            Earlier releases shipped a <code>!</code> that returned its operand unchanged instead of negating
            it. That is fixed as of v0.3.0, and this tour runs its examples against the interpreter the site
            ships, so the fix is verified rather than assumed.
          </p>
        </>
      ),
    },
    {
      slug: "maxxing",
      kind: "demo",
      title: "maxxing",
      summary: "sizeof, and the array-length idiom built on it.",
      program: chapterPrograms.maxxing,
      Body: () => (
        <>
          <p>
            <code>maxxing</code> is <code>sizeof</code>: it reports how many bytes a value occupies.
          </p>
          <Snippet>{`rizz scores[4] = {10, 20, 30, 40};

🚽 the classic C idiom, and it works here
rizz count = maxxing(scores) / maxxing(scores[0]);`}</Snippet>
          <p>
            That idiom is worth remembering, because arrays in Brainrot do not carry their length around and
            cannot be passed to functions — so the length has to be computed where the array is declared.
          </p>
          <p>
            One restriction: <code>maxxing</code> takes a <em>value</em>, not a type name.{" "}
            <code>maxxing(rizz)</code> is a syntax error; declare a variable and measure that instead.
          </p>
        </>
      ),
    },
    {
      slug: "aura-calculator",
      kind: "exercise",
      title: "Exercise: aura calculator",
      summary: "Put arithmetic, variables and formatted output together.",
      program: chapterPrograms["aura-calculator"],
      Body: () => (
        <>
          <p>
            Three days of aura readings are already declared. Two lines need finishing: one to total them, one
            to average them.
          </p>
          <p className="mt-4 p-3 bg-purple-950/40 border border-purple-800 rounded-lg">
            <strong>Your turn.</strong> Make the program print the real total and the real average, then press{" "}
            <strong>Check</strong>. Integer division is fine — the expected average is a whole number.
          </p>
          <p className="text-sm text-gray-400">
            Stuck, or bored? <strong>Next</strong> always works. An unsolved exercise is marked as skipped
            rather than blocking the rest of the tour.
          </p>
        </>
      ),
    },
  ],
};
