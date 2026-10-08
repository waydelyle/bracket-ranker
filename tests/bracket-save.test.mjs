import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { bracketReducer, createInitialState, getProgress } from "../src/lib/bracket-engine.ts";
import { componentHarness, deferred, flushPromises, nodes, renderedText } from "./helpers/component-harness.mjs";

const COMPONENT = fileURLToPath(new URL("../src/components/bracket/BracketGame.tsx", import.meta.url));
const ITEMS = Array.from({ length: 8 }, (_, index) => ({ id: `item-${index}`, name: `Item ${index}` }));
const PROPS = {
  bracketName: "Test bracket",
  bracketDescription: "Test entrants",
  items: ITEMS,
  defaultSize: 8,
  categoryColor: "#ff0000",
  categorySlug: "movies",
  bracketSlug: "disney",
};

function game() {
  let state = createInitialState();
  const navigations = [];
  const saves = [];
  const timers = [];
  const router = { push: (url) => navigations.push(url) };
  const callbacks = {
    startBracket(items, size) {
      state = bracketReducer(state, { type: "SEED", items, size, shuffleItems: false });
    },
    pickWinner(winnerId) { state = bracketReducer(state, { type: "PICK_WINNER", winnerId }); },
    reset() { state = bracketReducer(state, { type: "RESET" }); },
  };
  const harness = componentHarness(COMPONENT, "BracketGame", {
    "next/navigation": { useRouter: () => router },
    "framer-motion": { motion: { div: "motion.div" }, AnimatePresence: "AnimatePresence" },
    "lucide-react": { Loader2: "Loader2", RotateCcw: "RotateCcw", Trophy: "Trophy" },
    "@/lib/bracket-engine": { getRoundName: () => "Quarterfinals" },
    "@/lib/category-color": { categorySurfaceColor: (color) => color, categoryTextColor: (color) => color },
    "@/hooks/useBracket": { useBracket: () => {
      const matchup = state.rounds[state.currentRound]?.matchups[state.currentMatchup];
      return { ...callbacks, state, progress: getProgress(state), currentMatchup: matchup };
    } },
    "@/app/actions/results": { saveResult(payload) {
      const result = deferred();
      saves.push({ ...result, payload });
      return result.promise;
    } },
    "@/app/actions/votes": { submitVotes: async () => {} },
    "@/components/ui/button": { Button: "Button" },
    "@/components/results/ResultsDisplay": { ResultsDisplay: "ResultsDisplay" },
    "./BracketIntro": { BracketIntro: "BracketIntro" },
    "./MatchupCard": { MatchupCard: "MatchupCard" },
    "./MatchupPreloader": { MatchupPreloader: "MatchupPreloader" },
    "./ProgressBar": { ProgressBar: "ProgressBar" },
    "./RoundIndicator": { RoundIndicator: "RoundIndicator" },
    "./UndoButton": { UndoButton: "UndoButton" },
  }, {
    window: { scrollTo() {} },
    setTimeout(callback, delay) { timers.push({ callback, delay }); },
  });

  const render = () => harness.render(PROPS);
  const find = (type) => {
    const node = nodes(render()).find((entry) => entry.type === type);
    assert.ok(node, `${type} is rendered`);
    return node;
  };

  return {
    navigations, saves, harness, render,
    complete() {
      find("BracketIntro").props.onStart(8);
      for (let pick = 0; pick < 7; pick++) {
        const card = find("MatchupCard");
        card.props.onPick(card.props.itemA.id);
      }
      render();
      assert.equal(state.phase, "complete");
    },
    restart() { find("Button").props.onClick(); render(); },
    finishReveal() {
      for (const timer of timers.splice(0)) {
        assert.equal(timer.delay, 1400);
        timer.callback();
      }
    },
  };
}

test("normal completion saves the played run and opens its result after the reveal", async () => {
  const run = game();
  run.complete();
  assert.equal(run.saves.length, 1);
  assert.equal(run.saves[0].payload.ranking.length, 8);
  assert.equal(run.saves[0].payload.matchups.length, 7);
  run.saves[0].resolve("normal-result");
  await flushPromises();
  assert.deepEqual(run.navigations, [], "the champion reveal finishes before navigation");
  run.finishReveal();
  await flushPromises();
  assert.deepEqual(run.navigations, ["/results/normal-result"]);
});

test("Play Again prevents an earlier successful save from leaving the new intro", async () => {
  const run = game();
  run.complete();
  run.restart();
  assert.ok(nodes(run.render()).some((node) => node.type === "BracketIntro"));
  run.saves[0].resolve("old-result");
  run.finishReveal();
  await flushPromises();
  assert.deepEqual(run.navigations, []);
  assert.ok(nodes(run.render()).some((node) => node.type === "BracketIntro"));
});

test("an earlier failed save cannot replace a later run's saving indicator", async () => {
  const run = game();
  run.complete();
  run.restart();
  run.complete();
  assert.equal(run.saves.length, 2);
  run.saves[0].reject(new Error("old request failed"));
  await flushPromises();
  const current = renderedText(run.render());
  assert.ok(current.includes("Saving your results..."));
  assert.equal(current.includes("We could not save a share link"), false);
  run.saves[1].resolve("new-result");
  run.finishReveal();
  await flushPromises();
  assert.deepEqual(run.navigations, ["/results/new-result"]);
});

test("leaving a bracket invalidates its pending successful save", async () => {
  const run = game();
  run.complete();
  run.harness.unmount();
  run.saves[0].resolve("departed-result");
  run.finishReveal();
  await flushPromises();
  assert.deepEqual(run.navigations, []);
  assert.equal(run.harness.updatesAfterUnmount, 0);
});

test("leaving a bracket prevents a pending failure from updating the departed screen", async () => {
  const run = game();
  run.complete();
  run.harness.unmount();
  run.saves[0].reject(new Error("departed request failed"));
  await flushPromises();
  assert.equal(run.harness.updatesAfterUnmount, 0);
  assert.deepEqual(run.navigations, []);
});
