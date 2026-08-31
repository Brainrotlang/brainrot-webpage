// src/tour/programs/fileIo.js
//
// Programs for the "File I/O" chapter — the v0.4.0 stdio.h rebrand
// (Brainrotlang/brainrot#329). See usingTheTour.js for why these live in
// CommonJS rather than TypeScript, and why nothing here is annotated.
//
// Every one of these round-trips through the interpreter's in-memory
// filesystem in a single run: a program opens a file for writing, closes
// it, then reopens it for reading. That is what makes them runnable in the
// browser at all — there is no host file to point crackopen at, so each
// lesson creates the file it then reads. The expected values below are what
// the pinned wasm actually produced, not predictions.

const opening = {
  starter: `skibidi main {
    🚽 crackopen is fopen. "w" creates an empty file to write into.
    SAUCE *f = crackopen("lore.txt", "w");
    edgy (!f) {
        baka("could not open lore.txt\\n");
        ragequit(1);
    }

    yapto(f, "the aura is immaculate\\n");
    peaceout(f);   🚽 hand the handle back when you are done

    🚽 Reopen it read-only and see what landed.
    SAUCE *r = crackopen("lore.txt", "r");
    rant first = skim(r);
    yapping("file says: %s", first);
    peaceout(r);

    bussin 0;
}
`,
  expect: { stdout: "file says: the aura is immaculate\n", exitCode: 0 },
};

const reading = {
  starter: `skibidi main {
    SAUCE *f = crackopen("diary.txt", "w");
    yapto(f, "monday: gymmaxxing\\n");
    yapto(f, "tuesday: more of the same\\n");
    yapto(f, "wednesday: rest day\\n");
    peaceout(f);

    🚽 itsjoever peeks at the next byte, so this loop runs exactly once
    🚽 per line — no phantom blank line at the end.
    SAUCE *r = crackopen("diary.txt", "r");
    goon (!itsjoever(r)) {
        rant line = skim(r);
        yapping("> %s", line);
    }
    peaceout(r);

    bussin 0;
}
`,
  expect: {
    stdout: "> monday: gymmaxxing\n> tuesday: more of the same\n> wednesday: rest day\n",
    exitCode: 0,
  },
};

const writing = {
  starter: `skibidi main {
    SAUCE *f = crackopen("mixed.txt", "w");

    🚽 yapto is fprintf: a format string and its arguments.
    yapto(f, "count = %d\\n", 3);

    🚽 shitpost is fwrite: raw bytes, and it returns how many it wrote.
    rizz n = shitpost(f, "raw bytes, no formatting\\n");
    yapping("wrote %d bytes", n);

    peaceout(f);

    SAUCE *r = crackopen("mixed.txt", "r");
    goon (!itsjoever(r)) {
        rant line = skim(r);
        yapping("%s", line);
    }
    peaceout(r);

    bussin 0;
}
`,
  expect: {
    stdout: "wrote 25 bytes\ncount = 3\nraw bytes, no formatting\n",
    exitCode: 0,
  },
};

const seeking = {
  starter: `skibidi main {
    SAUCE *f = crackopen("alpha.txt", "w");
    shitpost(f, "abcdefgh");
    peaceout(f);

    SAUCE *r = crackopen("alpha.txt", "r");
    zoink(r, 3, 0);                🚽 jump to byte 3, counting from the start
    yapping("cursor at %d", whereami(r));

    rant chunk = doomscroll(r, 4); 🚽 read up to 4 bytes from here
    yapping("read: %s", chunk);

    throwback(r);                  🚽 rewind to the very beginning
    yapping("cursor at %d", whereami(r));
    peaceout(r);

    bussin 0;
}
`,
  expect: { stdout: "cursor at 3\nread: defg\ncursor at 0\n", exitCode: 0 },
};

const staleHandles = {
  starter: `skibidi main {
    SAUCE *f = crackopen("gone.txt", "w");
    yapto(f, "hi\\n");
    peaceout(f);

    🚽 f was handed back already. Using it again is caught, not undefined.
    rant oops = skim(f);
    yapping("unreachable: %s", oops);

    bussin 0;
}
`,
  expect: {
    stderr:
      "Error: skim: not an open SAUCE -- it was already closed with peaceout, or was never a handle at all, at line 7\n",
    exitCode: 1,
  },
};

module.exports = {
  opening,
  reading,
  writing,
  seeking,
  "stale-handles": staleHandles,
};
