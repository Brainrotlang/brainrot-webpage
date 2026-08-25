// src/tour/content/usingTheTour.tsx
//
// The "Using the Tour" chapter. Prose lives in TSX (no MDX, no new
// dependency); the programs live in ../programs, so CI can run them without
// loading React.

import type { TourChapter } from "../types";
import programs from "../programs";

const chapterPrograms = programs["using-the-tour"];

export const usingTheTourChapter: TourChapter = {
  id: "using-the-tour",
  title: "Using the Tour",
  lessons: [
    {
      slug: "welcome",
      kind: "demo",
      title: "Welcome to Brainrot",
      summary: "What this language is, and your first program.",
      program: chapterPrograms.welcome,
      Body: () => (
        <>
          <p>
            Brainrot is a C-like language where somebody committed crimes against keyword naming. Under the
            memes it is genuinely C-shaped: statements end in <code>;</code>, blocks use braces, conditions go
            in parentheses, and types come before names.
          </p>
          <p>
            Every program starts at <code>skibidi main</code>. <code>yapping</code> prints a line, and{" "}
            <code>bussin</code> returns.
          </p>
          <p>
            The editor below runs the real Brainrot interpreter, compiled to WebAssembly, inside this tab.
            Nothing is installed and nothing is sent anywhere. Hit <strong>Run</strong> (or{" "}
            <kbd>Cmd/Ctrl</kbd>+<kbd>Enter</kbd>), then change the greeting and run it again.
          </p>
        </>
      ),
    },
    {
      slug: "running-brainrot",
      kind: "demo",
      title: "Running Brainrot",
      summary: "Run, Reset, stdout, stderr, and feeding a program input.",
      program: chapterPrograms["running-brainrot"],
      Body: () => (
        <>
          <p>
            Four things to know about the runner, all of them visible in the program below.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Run</strong> executes whatever is in the editor. <strong>Reset</strong> puts the
              lesson's original program back, so experimenting costs nothing.
            </li>
            <li>
              <code>yapping</code> always adds a newline; <code>yappin</code> does not. That is the whole
              difference, and it is why the output below is one line rather than two.
            </li>
            <li>
              <code>baka</code> writes to <em>stderr</em>, which the output pane shows separately. A program
              that fails is not the website failing.
            </li>
            <li>
              <code>slorp</code> reads input. The <strong>stdin</strong> box below the editor is what gets fed
              to it — this lesson arrives with <code>Chad</code> already in it, because{" "}
              <code>slorp</code> on empty input is an error rather than a polite zero.
            </li>
          </ul>
          <p>
            A program that never finishes gets cut off after a few seconds instead of hanging your browser, so
            an accidental infinite loop is survivable.
          </p>
        </>
      ),
    },
    {
      slug: "brainrot-vs-c",
      kind: "reference",
      title: "Brainrot ↔ C",
      summary: "A small Rosetta Stone for anyone who already knows C.",
      notRunnableReason:
        "Half of the code on this page is C, for comparison — there is nothing here for the Brainrot interpreter to run.",
      snippets: [
        `🚽 Brainrot
skibidi main {
    rizz aura = 9001;

    edgy (aura > 9000) {
        yapping("certified W");
    }
    amogus {
        yapping("skill issue");
    }

    bussin 0;
}`,
        `/* The same thing in C */
int main(void) {
    int aura = 9001;

    if (aura > 9000) {
        printf("certified W\\n");
    }
    else {
        printf("skill issue\\n");
    }

    return 0;
}`,
      ],
      Body: () => (
        <>
          <p>
            If you know C, you already know most of Brainrot. The vocabulary is the joke; the grammar is
            mostly not.
          </p>
          <div className="overflow-x-auto my-4">
            <table className="text-sm">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left pr-8 pb-2">Brainrot</th>
                  <th className="text-left pb-2">C</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {[
                  ["skibidi", "void"],
                  ["rizz", "int"],
                  ["cap", "bool"],
                  ["yap", "char"],
                  ["edgy", "if"],
                  ["amogus", "else"],
                  ["goon", "while"],
                  ["flex", "for"],
                  ["mewing", "do"],
                  ["ohio", "switch"],
                  ["bussin", "return"],
                  ["gang", "struct"],
                  ["chungus", "union"],
                  ["gyatt", "enum"],
                  ["🚽", "// comment"],
                ].map(([brainrot, c]) => (
                  <tr key={brainrot}>
                    <td className="pr-8 text-purple-400">{brainrot}</td>
                    <td className="text-gray-300">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            That is orientation, not the full keyword list — and not every C feature has a Brainrot
            counterpart yet. Where one is missing, the tour says so instead of teaching you syntax the
            interpreter will reject.
          </p>
        </>
      ),
    },
  ],
};
