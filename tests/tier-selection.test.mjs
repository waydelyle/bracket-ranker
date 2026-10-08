import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import * as serialization from "../src/lib/serialization.mjs";
import { componentHarness, nodes, renderedText } from "./helpers/component-harness.mjs";

const COMPONENT = fileURLToPath(new URL("../src/components/tierlist/TierListMaker.tsx", import.meta.url));

function board() {
  const storage = new Map();
  const harness = componentHarness(COMPONENT, "TierListMaker", {
    "next/image": { __esModule: true, default: "Image" },
    "next/link": { __esModule: true, default: "Link" },
    "lucide-react": { Check: "Check", Copy: "Copy", Link2: "Link2", Loader2: "Loader2", Plus: "Plus", RotateCcw: "RotateCcw", Shuffle: "Shuffle", X: "X" },
    "sonner": { toast: { error() {}, success() {} } },
    "@/app/actions/bracket-items": { getBracketItemsAction: async () => null },
    "@/lib/serialization.mjs": serialization,
    "@/lib/utils": { cn: (...classes) => classes.filter(Boolean).join(" ") },
    "@/lib/image-source": { canOptimizeImage: () => true },
  }, {
    window: {
      location: { hash: "", search: "" },
      localStorage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      },
    },
    URLSearchParams,
  });
  const props = {
    datasets: [],
    initialDataset: { category: "food", slug: "fast-food", name: "Fast food" },
    initialItems: [{ id: "base", name: "Base" }],
  };
  const render = () => harness.render(props);
  const find = (predicate) => {
    const node = nodes(render()).find(predicate);
    assert.ok(node, "expected tier-list control is rendered");
    return node;
  };
  const findLabel = (label) => find((node) => node.props?.["aria-label"] === label);

  return {
    render,
    add(name) {
      find((node) => node.type === "input").props.onChange({ target: { value: name } });
      find((node) => node.type === "button" && renderedText(node).trim() === "Add").props.onClick();
      render();
    },
    select(name) { find((node) => node.props?.item?.name === name).props.onClick(); render(); },
    remove(name) { findLabel(`Remove ${name}`).props.onClick(); render(); },
    place() { findLabel("Put the selected entry in tier S").props.onClick(); render(); },
    namesInS() {
      const row = nodes(render()).find((node) =>
        node.type === "div" && typeof node.props?.onDrop === "function" &&
        nodes(node).some((child) => child.props?.["aria-label"] === "Put the selected entry in tier S"),
      );
      assert.ok(row, "tier S row is rendered");
      return nodes(row).filter((node) => node.props?.item).map((node) => node.props.item.name);
    },
  };
}

test("removing an earlier custom entry cannot rank the selected entry's neighbor", () => {
  const list = board();
  list.add("Alpha");
  list.add("Beta");
  list.add("Gamma");
  list.select("Beta");
  list.remove("Alpha");
  list.place();
  assert.deepEqual(list.namesInS(), []);
  list.select("Beta");
  list.place();
  assert.deepEqual(list.namesInS(), ["Beta"]);
});

test("removing the selected custom entry cannot rank a later replacement", () => {
  const list = board();
  list.add("Alpha");
  list.select("Alpha");
  list.remove("Alpha");
  list.place();
  list.add("Replacement");
  assert.deepEqual(list.namesInS(), []);
});
