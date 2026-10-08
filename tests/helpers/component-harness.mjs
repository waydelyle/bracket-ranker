import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

/**
 * Exercises a component's real callbacks and effect lifecycle without a DOM.
 * Child components and external services are supplied by each test. Timers are
 * controlled explicitly so asynchronous races do not depend on elapsed time.
 */
export function componentHarness(file, exportName, mocks, globals = {}) {
  const slots = [];
  let cursor = 0;
  let dirty = false;
  let unmounted = false;
  let updatesAfterUnmount = 0;
  let pendingEffects = [];

  const changed = (previous, next) =>
    !previous || !next || previous.length !== next.length ||
    previous.some((value, index) => !Object.is(value, next[index]));

  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) {
        slots[index] = { value: typeof initial === "function" ? initial() : initial };
      }
      return [slots[index].value, (next) => {
        if (unmounted) updatesAfterUnmount += 1;
        const value = typeof next === "function" ? next(slots[index].value) : next;
        if (!Object.is(value, slots[index].value)) {
          slots[index].value = value;
          dirty = true;
        }
      }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useMemo(create, dependencies) {
      const index = cursor++;
      if (!slots[index] || changed(slots[index].dependencies, dependencies)) {
        slots[index] = { value: create(), dependencies };
      }
      return slots[index].value;
    },
    useCallback(callback, dependencies) {
      return hooks.useMemo(() => callback, dependencies);
    },
    useEffect(effect, dependencies) {
      const index = cursor++;
      if (!slots[index] || changed(slots[index].dependencies, dependencies)) {
        const cleanup = slots[index]?.cleanup;
        slots[index] = { dependencies };
        pendingEffects.push(() => {
          cleanup?.();
          slots[index].cleanup = effect();
        });
      }
    },
  };

  const require = createRequire(file);
  const compiledModule = { exports: {} };
  const compiled = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;

  vm.runInNewContext(compiled, {
    ...globals,
    require(id) {
      if (id === "react") return hooks;
      return Object.hasOwn(mocks, id) ? mocks[id] : require(id);
    },
    module: compiledModule,
    exports: compiledModule.exports,
  });

  return {
    render(props) {
      let tree;
      let iterations = 0;
      do {
        if (++iterations > 20) throw new Error("Component did not settle");
        cursor = 0;
        dirty = false;
        tree = compiledModule.exports[exportName](props);
        const effects = pendingEffects;
        pendingEffects = [];
        for (const effect of effects) effect();
      } while (dirty);
      return tree;
    },
    unmount() {
      unmounted = true;
      for (const slot of slots) slot.cleanup?.();
    },
    get updatesAfterUnmount() { return updatesAfterUnmount; },
  };
}

export function nodes(tree) {
  if (!tree || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}

export function renderedText(tree) {
  if (typeof tree === "string") return tree;
  if (Array.isArray(tree)) return tree.map(renderedText).join("");
  return tree && typeof tree === "object" ? renderedText(tree.props?.children) : "";
}

export function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

export async function flushPromises() {
  for (let count = 0; count < 8; count++) await Promise.resolve();
}
