import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { componentHarness, nodes, renderedText } from "./helpers/component-harness.mjs";

const COMPONENT = fileURLToPath(new URL("../src/app/error.tsx", import.meta.url));

function boundary(window, document = { readyState: "complete" }) {
  return componentHarness(COMPONENT, "default", {
    "next/link": { default: "Link", __esModule: true },
    "lucide-react": { AlertTriangle: "AlertTriangle", Home: "Home", RotateCcw: "RotateCcw" },
    "@/components/ui/button": { Button: "Button" },
  }, { window, document });
}

function loadingWindow() {
  const listeners = new Map();
  return {
    window: {
      addEventListener(type, listener, options) {
        assert.equal(type, "load");
        assert.equal(options.once, true, "there is only one bounded retry");
        listeners.set(listener, options);
      },
      removeEventListener(type, listener) {
        assert.equal(type, "load");
        listeners.delete(listener);
      },
    },
    load() {
      for (const [listener, options] of [...listeners]) {
        if (options.once) listeners.delete(listener);
        listener();
      }
    },
    get pending() { return listeners.size; },
  };
}

function retryButton(tree) {
  const button = nodes(tree).find((node) =>
    node.type === "Button" && renderedText(node).includes("Try Again"));
  assert.ok(button, "the fallback offers retry");
  return button;
}

test("reports the original boundary error without adding page or player data", () => {
  const captures = [];
  const sentry = { captureException(...args) {
    assert.equal(this, sentry, "preserves the SDK receiver");
    captures.push(args);
  } };
  const harness = boundary({ Sentry: sentry });
  const error = Object.assign(new Error("result rendering failed"), { digest: "example-digest" });
  const props = { error, retry() {} };

  const tree = harness.render(props);
  assert.equal(captures.length, 1);
  assert.deepEqual(captures[0], [error]);
  assert.ok(renderedText(tree).includes("Error ID: example-digest"));
  assert.equal(renderedText(tree).includes(error.message), false);

  harness.render(props);
  assert.equal(captures.length, 1, "a re-render does not report the same error again");

  const nextError = new Error("another rendering error");
  harness.render({ ...props, error: nextError });
  assert.equal(captures.length, 2);
  assert.equal(captures[1][0], nextError);
});

test("retry remains usable when the optional SDK or capture function is absent", () => {
  for (const window of [{}, { Sentry: {} }]) {
    let retries = 0;
    const harness = boundary(window);
    const tree = harness.render({ error: new Error("render failed"), retry() { retries += 1; } });
    assert.ok(renderedText(tree).includes("Something went wrong"));
    retryButton(tree).props.onClick();
    assert.equal(retries, 1);
  }
});

test("reporter failures cannot break the fallback or retry", () => {
  for (const window of [
    { Sentry: { captureException() { throw new Error("reporter failed"); } } },
    { get Sentry() { throw new Error("SDK unavailable"); } },
  ]) {
    let retries = 0;
    const harness = boundary(window);
    const tree = harness.render({ error: new Error("render failed"), retry() { retries += 1; } });
    retryButton(tree).props.onClick();
    assert.equal(retries, 1);
    assert.ok(nodes(tree).some((node) => node.type === "Button" &&
      node.props.render?.type === "Link" && node.props.render.props.href === "/"));
  }
});

test("reports once when the deferred loader becomes available at document load", () => {
  const browser = loadingWindow();
  const captures = [];
  const error = new Error("render failed before loader arrived");
  const harness = boundary(browser.window, { readyState: "interactive" });
  harness.render({ error, retry() {} });
  assert.equal(browser.pending, 1);

  browser.window.Sentry = { captureException: (value) => captures.push(value) };
  browser.load();
  browser.load();
  assert.deepEqual(captures, [error]);
  assert.equal(browser.pending, 0);
});

test("changed errors and unmount clean up the pending loader retry", () => {
  const browser = loadingWindow();
  const captures = [];
  const harness = boundary(browser.window, { readyState: "interactive" });
  harness.render({ error: new Error("stale error"), retry() {} });
  const current = new Error("current error");
  harness.render({ error: current, retry() {} });
  assert.equal(browser.pending, 1, "the old error's listener was removed");
  browser.window.Sentry = { captureException: (value) => captures.push(value) };
  browser.load();
  assert.deepEqual(captures, [current]);

  const departing = loadingWindow();
  const departedHarness = boundary(departing.window, { readyState: "interactive" });
  departedHarness.render({ error: new Error("departed error"), retry() {} });
  departedHarness.unmount();
  assert.equal(departing.pending, 0);
  departing.window.Sentry = { captureException: (value) => captures.push(value) };
  departing.load();
  assert.deepEqual(captures, [current]);
});

test("a blocked SDK after document load does not wait or prevent recovery", () => {
  const browser = loadingWindow();
  const harness = boundary(browser.window);
  let retries = 0;
  const tree = harness.render({ error: new Error("render failed"), retry() { retries += 1; } });
  assert.equal(browser.pending, 0, "an already completed page does not add a listener");
  retryButton(tree).props.onClick();
  assert.equal(retries, 1);

  const pending = loadingWindow();
  const pendingHarness = boundary(pending.window, { readyState: "interactive" });
  pendingHarness.render({ error: new Error("loader remains blocked"), retry() {} });
  pending.load();
  assert.equal(pending.pending, 0, "a missing SDK at load is not retried again");
});
