import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { ROUTER_FUTURE } from "./routerFuture";

// App pulls in Playground, which statically imports runtime.ts and through
// it createWasmWorker.ts, whose `new Worker(new URL(..., import.meta.url))`
// CRA's Jest transform cannot parse. These tests are about routing, not
// running code, so the runtime is stubbed out wholesale — same approach as
// Playground.test.tsx.
jest.mock("./playground/runtime", () => ({
  runBrainrot: jest.fn(),
  RuntimeLoadError: class RuntimeLoadError extends Error {},
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]} future={ROUTER_FUTURE}>
      <App />
    </MemoryRouter>,
  );
}

test("the root path renders the landing page, playground included", () => {
  renderAt("/");

  expect(screen.getByRole("heading", { name: /run it yourself/i })).toBeInTheDocument();
  expect(screen.getByLabelText("Brainrot code editor")).toBeInTheDocument();
  expect(screen.queryByText(/^404$/)).not.toBeInTheDocument();
});

test("an unclaimed URL renders the 404 page instead of the landing page", () => {
  renderAt("/definitely-not-a-page");

  expect(screen.getByText("404")).toBeInTheDocument();
  // The pre-routing behaviour: every path rendered the homepage, so a
  // visitor with a stale link was told their link was fine.
  expect(screen.queryByRole("heading", { name: /run it yourself/i })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /back to the homepage/i })).toHaveAttribute("href", "/");
});

test("the navbar frames every route, so a 404 still offers a way out", () => {
  renderAt("/nope");

  expect(screen.getByRole("link", { name: /playground/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /brainrot/i })).toHaveAttribute("href", "/");
});

test("the navbar's Playground link is absolute, so it works from a non-root route", () => {
  renderAt("/nope");

  // A bare "#playground" would resolve against /nope. This is the whole
  // reason the link is a router link rather than an anchor.
  expect(screen.getByRole("link", { name: /playground/i })).toHaveAttribute("href", "/#playground");
});

test("the navbar offers the tour alongside the reference docs", () => {
  renderAt("/");

  // Tour teaches the language, Docs is for looking it up — both, not either.
  expect(screen.getByRole("link", { name: /^tour$/i })).toHaveAttribute("href", "/tour");
  expect(screen.getByRole("link", { name: /^docs$/i })).toHaveAttribute(
    "href",
    "https://github.com/Brainrotlang/brainrot/tree/main/docs",
  );
});

test("the homepage leads with the tour", () => {
  renderAt("/");

  const cta = screen.getByRole("link", { name: /take the tour/i });
  expect(cta).toHaveAttribute("href", "/tour");
  // Still reachable for someone who came to install the compiler.
  expect(screen.getByRole("button", { name: /get started/i })).toBeInTheDocument();
});

test("navigating to a hash target scrolls it into view", async () => {
  const user = userEvent.setup();
  const scrollIntoView = jest.fn();
  // jsdom implements no layout and therefore no scrolling.
  Element.prototype.scrollIntoView = scrollIntoView;

  renderAt("/nope");
  await user.click(screen.getByRole("link", { name: /playground/i }));

  // Landed on the homepage, and the section the hash names — not the top of
  // the page. React Router does not scroll for hash changes; without
  // useScrollToHash this link would silently do half its job.
  expect(screen.getByRole("heading", { name: /run it yourself/i })).toBeInTheDocument();
  expect(scrollIntoView).toHaveBeenCalled();
});
