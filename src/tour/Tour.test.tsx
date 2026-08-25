import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { ROUTER_FUTURE } from "../routerFuture";
import { runBrainrot } from "../playground/runtime";
import type { RunResult } from "../playground/runtime";
import { allLessons } from "./content";
import programs from "./programs";

// Routing and lesson behaviour, with the wasm runtime stubbed out — the
// same split Playground.test.tsx uses. Whether the *programs* themselves
// still work is a question about the real interpreter, which no mock can
// answer; that is scripts/verify-lessons.mjs's job.
jest.mock("../playground/runtime", () => ({
  runBrainrot: jest.fn(),
  RuntimeLoadError: class RuntimeLoadError extends Error {},
}));

const mockRunBrainrot = runBrainrot as jest.MockedFunction<typeof runBrainrot>;

const WELCOME = "using-the-tour/welcome";
const REFERENCE = "using-the-tour/brainrot-vs-c";
const STDIN_LESSON = "using-the-tour/running-brainrot";
const EXERCISE = "basics/variables";

function ok(overrides: Partial<RunResult> = {}): RunResult {
  return { stdout: "", stderr: "", exitCode: 0, timedOut: false, ...overrides };
}

async function renderTourAt(path: string) {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[path]} future={ROUTER_FUTURE}>
      <App />
    </MemoryRouter>,
  );
  // The tour is a lazily loaded chunk.
  await waitFor(() => expect(screen.queryByText(/loading the tour/i)).not.toBeInTheDocument());
  return user;
}

beforeEach(() => {
  mockRunBrainrot.mockReset();
  localStorage.clear();
  sessionStorage.clear();
});

describe("routing", () => {
  test("/tour renders the landing page with a way in", async () => {
    await renderTourAt("/tour");

    expect(screen.getByRole("heading", { level: 1, name: /a tour of brainrot/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start the tour/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^continue/i })).not.toBeInTheDocument();
  });

  test("a lesson deep link renders that lesson, not just any lesson", async () => {
    await renderTourAt(`/tour/${EXERCISE}`);

    expect(screen.getByRole("heading", { level: 1, name: "Variables" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1, name: /welcome to brainrot/i })).not.toBeInTheDocument();
  });

  test("a lesson-shaped URL naming no lesson is a 404, not an empty lesson frame", async () => {
    await renderTourAt("/tour/basics/does-not-exist");

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.queryByTestId("brainrot-editor")).not.toBeInTheDocument();
  });

  test("Next and Previous move through the curriculum in manifest order", async () => {
    const user = await renderTourAt(`/tour/${WELCOME}`);

    await user.click(screen.getByRole("link", { name: /next/i }));
    expect(await screen.findByRole("heading", { level: 1, name: /running brainrot/i })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /previous/i }));
    expect(await screen.findByRole("heading", { level: 1, name: /welcome to brainrot/i })).toBeInTheDocument();
  });

  test("the last lesson offers no broken Next", async () => {
    const lessons = allLessons();
    const last = lessons[lessons.length - 1];
    await renderTourAt(`/tour/${last.id}`);

    expect(screen.queryByRole("link", { name: /next/i })).not.toBeInTheDocument();
    expect(screen.getByText(/last lesson so far/i)).toBeInTheDocument();
  });
});

describe("keyboard navigation", () => {
  test("PageDown and PageUp move between lessons", async () => {
    const user = await renderTourAt(`/tour/${WELCOME}`);

    await user.keyboard("{PageDown}");
    expect(await screen.findByRole("heading", { level: 1, name: /running brainrot/i })).toBeInTheDocument();

    await user.keyboard("{PageUp}");
    expect(await screen.findByRole("heading", { level: 1, name: /welcome to brainrot/i })).toBeInTheDocument();
  });

  test("PageDown inside the editor belongs to the editor, not the tour", async () => {
    const user = await renderTourAt(`/tour/${WELCOME}`);

    await user.click(screen.getByLabelText(/brainrot code editor for welcome/i));
    await user.keyboard("{PageDown}");

    // Paging through a program is not a request to leave the lesson.
    expect(screen.getByRole("heading", { level: 1, name: /welcome to brainrot/i })).toBeInTheDocument();
  });

  test("focus lands on the new lesson's heading after navigating", async () => {
    const user = await renderTourAt(`/tour/${WELCOME}`);

    await user.click(screen.getByRole("link", { name: /next/i }));
    const heading = await screen.findByRole("heading", { level: 1, name: /running brainrot/i });

    expect(heading).toHaveFocus();
  });
});

describe("sidebar", () => {
  test("is built from the manifest and marks the current lesson", async () => {
    await renderTourAt(`/tour/${WELCOME}`);

    const nav = screen.getAllByRole("navigation", { name: /tour contents/i })[0];

    // By href rather than by title: lesson titles legitimately overlap
    // ("edgy" and "edgy / amogus"), while ids are unique by construction.
    const hrefs = within(nav)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    for (const { id } of allLessons()) {
      expect(hrefs).toContain(`/tour/${id}`);
    }

    const current = within(nav).getByRole("link", { name: /welcome to brainrot/i });
    expect(current).toHaveAttribute("aria-current", "page");
  });
});

describe("lesson program", () => {
  test("the starter program loads, and Reset restores it after edits", async () => {
    const user = await renderTourAt(`/tour/${WELCOME}`);

    const editor = screen.getByLabelText(/brainrot code editor for welcome/i);
    expect(editor.textContent).toContain("Hello, World!");

    await user.click(editor);
    await user.paste("🚽 scribble");
    expect(editor.textContent).toContain("scribble");

    await user.click(screen.getByRole("button", { name: /reset/i }));
    expect(editor.textContent).not.toContain("scribble");
    expect(editor.textContent).toContain("Hello, World!");
  });

  test("running a lesson goes through the shared runtime and shows stdout", async () => {
    mockRunBrainrot.mockResolvedValue(ok({ stdout: "Hello, World!\n" }));
    const user = await renderTourAt(`/tour/${WELCOME}`);

    await user.click(screen.getByRole("button", { name: /^run$/i }));

    const output = screen.getByTestId("tour-output");
    await waitFor(() => expect(within(output).getByText(/^Hello, World!$/)).toBeInTheDocument());
    expect(mockRunBrainrot).toHaveBeenCalledWith(programs["using-the-tour"].welcome.starter, "");
  });

  test("stderr and a timeout are reported as the program's problem", async () => {
    mockRunBrainrot.mockResolvedValue(ok({ stderr: "boom\n", exitCode: 1 }));
    const user = await renderTourAt(`/tour/${WELCOME}`);
    await user.click(screen.getByRole("button", { name: /^run$/i }));
    expect(await screen.findByText("stderr")).toBeInTheDocument();

    mockRunBrainrot.mockResolvedValue(ok({ exitCode: -1, timedOut: true }));
    await user.click(screen.getByRole("button", { name: /^run$/i }));
    expect(await screen.findByText(/infinite loop/i)).toBeInTheDocument();
  });

  test("a runtime that never loads disables the lesson's code, not the lesson", async () => {
    const { RuntimeLoadError } = jest.requireMock("../playground/runtime") as {
      RuntimeLoadError: new (message: string) => Error;
    };
    mockRunBrainrot.mockRejectedValue(new RuntimeLoadError("nope"));
    const user = await renderTourAt(`/tour/${WELCOME}`);

    await user.click(screen.getByRole("button", { name: /^run$/i }));

    await waitFor(() => expect(screen.getByText(/runtime wouldn't load/i)).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /^run$/i })).not.toBeInTheDocument();
    // The teaching still works: prose and navigation are untouched.
    expect(screen.getByRole("heading", { level: 1, name: /welcome to brainrot/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /next/i })).toBeInTheDocument();
  });

  test("a reference lesson shows code with no Run button and says why", async () => {
    await renderTourAt(`/tour/${REFERENCE}`);

    expect(screen.queryByRole("button", { name: /^run$/i })).not.toBeInTheDocument();
    expect(screen.getByText(/nothing to run here/i)).toBeInTheDocument();
  });

  test("a lesson that reads input arrives with its stdin filled in and visible", async () => {
    await renderTourAt(`/tour/${STDIN_LESSON}`);

    const stdin = screen.getByLabelText("Program stdin");
    expect(stdin).toHaveValue("Chad\n");
    expect(stdin).toBeVisible();
  });

  test("a lesson that reads no input keeps the stdin box out of the way", async () => {
    await renderTourAt(`/tour/${WELCOME}`);

    expect(screen.getByLabelText("Program stdin")).not.toBeVisible();
  });

  test("edits survive leaving a lesson and coming back", async () => {
    const user = await renderTourAt(`/tour/${WELCOME}`);

    await user.click(screen.getByLabelText(/brainrot code editor for welcome/i));
    await user.paste("🚽 my notes");

    await user.click(screen.getByRole("link", { name: /next/i }));
    await screen.findByRole("heading", { level: 1, name: /running brainrot/i });
    await user.click(screen.getByRole("link", { name: /previous/i }));

    const editor = await screen.findByLabelText(/brainrot code editor for welcome/i);
    expect(editor.textContent).toContain("my notes");
  });
});

describe("exercises", () => {
  test("Check on a wrong program explains the gap and leaves it unsolved", async () => {
    mockRunBrainrot.mockResolvedValue(ok({ stdout: "aura: 0\n" }));
    const user = await renderTourAt(`/tour/${EXERCISE}`);

    await user.click(screen.getByRole("button", { name: /check/i }));

    const verdict = await screen.findByRole("status");
    expect(within(verdict).getByText(/not there yet/i)).toBeInTheDocument();
    // The verdict has to say what was wanted, not merely that something was.
    expect(within(verdict).getByText(/aura: 9001/)).toBeInTheDocument();

    const nav = screen.getAllByRole("navigation", { name: /tour contents/i })[0];
    expect(within(nav).queryByText("done")).not.toBeInTheDocument();
  });

  test("Check on the canonical solution marks the exercise complete", async () => {
    mockRunBrainrot.mockResolvedValue(ok({ stdout: "aura: 9001\n" }));
    const user = await renderTourAt(`/tour/${EXERCISE}`);

    await user.click(screen.getByRole("button", { name: /check/i }));

    expect(await screen.findByText(/certified w/i)).toBeInTheDocument();
    const nav = screen.getAllByRole("navigation", { name: /tour contents/i })[0];
    await waitFor(() => expect(within(nav).getByText("done")).toBeInTheDocument());
  });

  test("Run does not judge the program, and clears a stale verdict", async () => {
    mockRunBrainrot.mockResolvedValue(ok({ stdout: "aura: 0\n" }));
    const user = await renderTourAt(`/tour/${EXERCISE}`);

    await user.click(screen.getByRole("button", { name: /check/i }));
    await screen.findByText(/not there yet/i);

    await user.click(screen.getByRole("button", { name: /^run$/i }));
    await waitFor(() => expect(screen.queryByText(/not there yet/i)).not.toBeInTheDocument());
    // Output is still shown — Run ran the program, it just did not grade it.
    expect(within(screen.getByTestId("tour-output")).getByText(/aura: 0/)).toBeInTheDocument();
  });

  test("an unsolved exercise can be skipped, and is marked skipped rather than done", async () => {
    const user = await renderTourAt(`/tour/${EXERCISE}`);

    // Next must never be a dead end just because an exercise is unsolved.
    await user.click(screen.getByRole("link", { name: /next/i }));
    await screen.findByRole("heading", { level: 1, name: /primitive types/i });

    const nav = screen.getAllByRole("navigation", { name: /tour contents/i })[0];
    const variables = within(nav).getByRole("link", { name: /variables/i });
    expect(variables).toHaveTextContent("skipped");
    expect(variables).not.toHaveTextContent("done");
  });

  test("solving an exercise after skipping it clears the skip", async () => {
    mockRunBrainrot.mockResolvedValue(ok({ stdout: "aura: 9001\n" }));
    const user = await renderTourAt(`/tour/${EXERCISE}`);

    await user.click(screen.getByRole("link", { name: /next/i }));
    await screen.findByRole("heading", { level: 1, name: /primitive types/i });
    await user.click(screen.getByRole("link", { name: /previous/i }));
    await screen.findByRole("heading", { level: 1, name: "Variables" });

    await user.click(screen.getByRole("button", { name: /check/i }));
    await screen.findByText(/certified w/i);

    const nav = screen.getAllByRole("navigation", { name: /tour contents/i })[0];
    const variables = within(nav).getByRole("link", { name: /variables/i });
    await waitFor(() => expect(variables).toHaveTextContent("done"));
    expect(variables).not.toHaveTextContent("skipped");
  });
});

describe("finishing the tour", () => {
  const FINAL = allLessons()[allLessons().length - 1];

  test("solving the last exercise shows the completion panel and where to go next", async () => {
    expect(FINAL.lesson.kind).toBe("exercise");
    if (FINAL.lesson.kind !== "exercise") return;

    mockRunBrainrot.mockResolvedValue(ok({ stdout: FINAL.lesson.program.expect.stdout }));
    const user = await renderTourAt(`/tour/${FINAL.id}`);

    await user.click(screen.getByRole("button", { name: /check/i }));

    expect(await screen.findByRole("heading", { name: /brain is now fully rotten/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open the playground/i })).toHaveAttribute("href", "/#playground");
  });

  test("solving an earlier exercise does not claim the tour is finished", async () => {
    mockRunBrainrot.mockResolvedValue(ok({ stdout: "aura: 9001\n" }));
    const user = await renderTourAt(`/tour/${EXERCISE}`);

    await user.click(screen.getByRole("button", { name: /check/i }));

    await screen.findByText(/certified w/i);
    expect(screen.queryByRole("heading", { name: /brain is now fully rotten/i })).not.toBeInTheDocument();
  });
});

describe("progress", () => {
  test("reading a lesson counts as progress, and Continue comes back to it", async () => {
    const user = await renderTourAt(`/tour/${STDIN_LESSON}`);
    await screen.findByRole("heading", { level: 1, name: /running brainrot/i });

    await user.click(screen.getAllByRole("link", { name: /tour overview/i })[0]);

    const continueLink = await screen.findByRole("link", { name: /continue: running brainrot/i });
    expect(continueLink).toHaveAttribute("href", `/tour/${STDIN_LESSON}`);
  });

  test("Reset progress clears completion and the Continue link", async () => {
    const user = await renderTourAt(`/tour/${WELCOME}`);
    await user.click(screen.getAllByRole("link", { name: /tour overview/i })[0]);
    await screen.findByRole("link", { name: /continue: welcome/i });

    await user.click(screen.getByRole("button", { name: /reset progress/i }));

    expect(screen.queryByRole("link", { name: /continue:/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start the tour/i })).toBeInTheDocument();
  });

  test("the tour works when localStorage throws on every access", async () => {
    const denied = () => {
      throw new Error("storage denied");
    };
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(denied);
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(denied);

    mockRunBrainrot.mockResolvedValue(ok({ stdout: "Hello, World!\n" }));
    const user = await renderTourAt(`/tour/${WELCOME}`);

    expect(screen.getByRole("heading", { level: 1, name: /welcome to brainrot/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^run$/i }));
    await waitFor(() =>
      expect(within(screen.getByTestId("tour-output")).getByText(/^Hello, World!$/)).toBeInTheDocument(),
    );

    jest.restoreAllMocks();
  });
});
