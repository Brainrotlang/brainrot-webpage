// src/playground/examples.ts
//
// Seed programs for the playground's examples dropdown (#9). Kept aligned
// with Brainrotlang/brainrot's own examples/ where a direct equivalent
// exists (hello world, FizzBuzz) rather than inventing divergent versions
// — this playground and that repo should agree on what "hello world in
// Brainrot" looks like. The rizz-rating example is playground-original:
// upstream has no short, single-function slorp demo, and #9 explicitly
// wants one so the stdin box has an obvious purpose.

export interface PlaygroundExample {
  id: string;
  label: string;
  source: string;
  /** Pre-filled stdin box content for this example. Empty for examples
   * that don't read input — an empty stdin box just means "no input". */
  stdin: string;
}

export const PLAYGROUND_EXAMPLES: PlaygroundExample[] = [
  {
    id: "hello-world",
    label: "Hello World",
    source: `skibidi main {
    yapping("Hello, World!");
    bussin 0;
}
`,
    stdin: "",
  },
  {
    id: "fizzbuzz",
    label: "FizzBuzz",
    source: `skibidi main {
    nut rizz i;
    flex (i = 1; i <= 15; i = i + 1) {
        edgy ((i % 15) == 0) {
            yapping("FizzBuzz");
        } amogus edgy ((i % 3) == 0) {
            yapping("Fizz");
        } amogus edgy ((i % 5) == 0) {
            yapping("Buzz");
        } amogus {
            yapping("%d", i);
        }
    }
    bussin 0;
}
`,
    stdin: "",
  },
  {
    id: "rizz-rating",
    label: "Rate My Rizz (slorp)",
    source: `skibidi main {
    yap name[32];
    yapping("Yo, what's the name, chief?");
    rant string = slorp(name);
    yapping("%s? Certified W rizz fr fr.", string);
    bussin 0;
}
`,
    stdin: "Chad\n",
  },
];

export const DEFAULT_PLAYGROUND_EXAMPLE = PLAYGROUND_EXAMPLES[0];
