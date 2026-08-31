// src/tour/content/fileIo.tsx
//
// The "File I/O" chapter: crackopen, peaceout, skim, yapto and the rest of
// the v0.4.0 standard-library file operations (Brainrotlang/brainrot#329) —
// stdio.h with the serial numbers filed off, twelve calls behind a
// `SAUCE *` handle.
//
// Every program in this chapter round-trips through the interpreter's
// in-memory filesystem in one run: it writes a file, closes it, and reopens
// it to read. There is no host file to point crackopen at in the browser, so
// each lesson creates the file it then reads. That is a property of the
// runner, not of the language — see programs/fileIo.js.

import type { TourChapter } from "../types";
import { Snippet } from "../Snippet";
import programs from "../programs";

const chapterPrograms = programs["file-io"];

export const fileIoChapter: TourChapter = {
  id: "file-io",
  title: "File I/O",
  lessons: [
    {
      slug: "opening",
      kind: "demo",
      title: "Opening and closing",
      summary: "crackopen, peaceout, and the SAUCE handle they pass around.",
      program: chapterPrograms.opening,
      Body: () => (
        <>
          <p>
            File I/O is <code>stdio.h</code>, rebranded: twelve library calls behind a single handle type,{" "}
            <code>SAUCE</code>. They are ordinary builtins — like <code>slorp</code> and <code>yapping</code>,
            not keywords — so there is no directive to switch on and nothing new in the grammar except the type
            name itself.
          </p>
          <p>
            <code>crackopen</code> is <code>fopen</code>: give it a path and a mode (<code>"r"</code>,{" "}
            <code>"w"</code>, <code>"a"</code>, …) and it hands back a <code>SAUCE *</code>. When you are done,{" "}
            <code>peaceout</code> — that is <code>fclose</code> — hands it back.
          </p>
          <Snippet>{`SAUCE *f = crackopen("lore.txt", "w");
yapto(f, "the aura is immaculate\\n");
peaceout(f);`}</Snippet>
          <p>
            The program on the right writes a line, closes the file, then reopens it read-only and prints what
            landed. Both halves happen in one run because the file lives in the playground's in-memory
            filesystem — there is no file on your disk to point at, so the program makes its own.
          </p>
          <p className="mt-4 p-3 bg-amber-950/30 border border-amber-900 rounded-lg text-amber-200">
            <strong>
              <code>SAUCE</code> is only ever written with a star.
            </strong>{" "}
            <code>SAUCE *f</code> is the handle; a bare <code>SAUCE</code> is not a value the type system can
            represent.
          </p>
        </>
      ),
    },
    {
      slug: "reading",
      kind: "demo",
      title: "Reading line by line",
      summary: "The itsjoever + skim loop, and why it beats C's feof.",
      program: chapterPrograms.reading,
      Body: () => (
        <>
          <p>
            <code>skim</code> is <code>fgets</code>: it reads one line and strips the newline.{" "}
            <code>itsjoever</code> is <code>feof</code> — "is it over?" — and the two together are the
            canonical read loop:
          </p>
          <Snippet>{`goon (!itsjoever(r)) {
    rant line = skim(r);
    yapping("> %s", line);
}`}</Snippet>
          <p>
            Run it: three lines in, three lines out, no trailing blank. That last part is the point.{" "}
            <code>itsjoever</code> <em>peeks</em> — it looks at the next byte and puts it back, answering the
            question its name asks (<em>is there anything left</em>) rather than C's <code>feof</code>, which
            reports that a read has <em>already</em> failed. The famous <code>while (!feof(f))</code> bug runs
            one iteration too many and processes a phantom empty record; this loop does not, because the
            question it asks is the right one.
          </p>
        </>
      ),
    },
    {
      slug: "writing",
      kind: "demo",
      title: "Two ways to write",
      summary: "yapto for formatted text, shitpost for raw bytes.",
      program: chapterPrograms.writing,
      Body: () => (
        <>
          <p>
            There are two write calls and they are <em>not</em> interchangeable. <code>yapto</code> is{" "}
            <code>fprintf</code>: a format string and its arguments, sharing <code>yapping</code>'s exact
            formatter. <code>shitpost</code> is <code>fwrite</code>: it writes a <code>rant</code>'s bytes
            verbatim and returns how many it wrote.
          </p>
          <Snippet>{`yapto(f, "count = %d\\n", 3);         🚽 formatted, like fprintf
rizz n = shitpost(f, "raw bytes\\n");  🚽 exact bytes; returns the count`}</Snippet>
          <p>
            The run prints the byte count first (that <code>yapping</code> happens before the file is reopened
            and dumped), then the file's two lines. <code>shitpost</code> and its reading counterpart{" "}
            <code>doomscroll</code> are <strong>binary-safe</strong>: they work in byte counts, not
            terminators, so a <code>rant</code> holding an embedded NUL round-trips unchanged.
          </p>
          <p>
            Two more, for completeness: <code>bustcache</code> is <code>fflush</code>, and <code>bricked</code>{" "}
            is <code>ferror</code> — "did something go wrong?" Unlike <code>itsjoever</code>, that one is a
            plain <code>ferror</code>, because "already failed" is the question C answers correctly.
          </p>
        </>
      ),
    },
    {
      slug: "seeking",
      kind: "demo",
      title: "Moving the cursor",
      summary: "zoink, whereami, throwback and reading a fixed number of bytes.",
      program: chapterPrograms.seeking,
      Body: () => (
        <>
          <p>
            A file has a cursor, and three calls move or report it. <code>zoink</code> is <code>fseek</code>{" "}
            (offset plus a whence: <code>0</code> start, <code>1</code> current, <code>2</code> end),{" "}
            <code>whereami</code> is <code>ftell</code>, and <code>throwback</code> is <code>rewind</code>.
          </p>
          <Snippet>{`zoink(r, 3, 0);                🚽 jump to byte 3 from the start
rant chunk = doomscroll(r, 4); 🚽 read up to 4 bytes from here
throwback(r);                  🚽 back to the beginning`}</Snippet>
          <p>
            <code>doomscroll</code> is <code>fread</code>: it reads up to <em>n</em> bytes from wherever the
            cursor is, so seeking to byte 3 of <code>abcdefgh</code> and reading four gives <code>defg</code>.
            Then <code>throwback</code> puts the cursor back at <code>0</code>.
          </p>
          <p className="mt-4 p-3 bg-amber-950/30 border border-amber-900 rounded-lg text-amber-200">
            <strong>
              Offsets are <code>rizz</code>.
            </strong>{" "}
            <code>whereami</code> and <code>zoink</code> work in{" "}
            <code>rizz</code>-sized offsets, so files past 2&nbsp;GB are out of reach in this version — as are{" "}
            <code>remove</code>, <code>rename</code>, directory listing and <code>stat</code>, none of which
            exist yet.
          </p>
        </>
      ),
    },
    {
      slug: "stale-handles",
      kind: "demo",
      title: "A handle is a token, not a pointer",
      summary: "Why using a SAUCE after peaceout is caught, not undefined.",
      program: chapterPrograms["stale-handles"],
      Body: () => (
        <>
          <p>
            A <code>SAUCE *</code> looks like a pointer but is not one — there is nothing to dereference. It is
            an opaque <em>token</em> the library issued to name one open file, and the only thing you can do
            with it is hand it back. Ownership stays in C: Brainrot never holds anything it could free.
          </p>
          <p>
            That token is what makes misuse safe. Run this one — it closes a file and then tries to read from
            the handle anyway:
          </p>
          <Snippet>{`peaceout(f);
rant oops = skim(f);   🚽 f is dead now`}</Snippet>
          <p>
            The result is a clean diagnostic on stderr and exit code 1, not undefined behaviour:
          </p>
          <Snippet>{`Error: skim: not an open SAUCE -- it was already closed with
peaceout, or was never a handle at all, at line 7`}</Snippet>
          <p>
            The library keeps a registry of live handles and checks every one against it, so use-after-release,
            double-release and operating on a failed <code>crackopen</code>'s null handle are all diagnosed
            rather than silently acting on whatever memory got recycled. A missing file, by contrast, is not an
            error at all: <code>crackopen</code> returns a null handle, which is falsy, so{" "}
            <code>edgy (!f)</code> is the idiomatic check. And anything still open when the program exits is
            closed by the library — a program that forgets to <code>peaceout</code> does not leak.
          </p>
        </>
      ),
    },
  ],
};
