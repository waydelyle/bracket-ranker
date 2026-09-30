import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SENTRY_LOADER_CONFIG } from '../src/lib/sentry-loader-config.ts';

const options = (() => {
  let options;
  const window = { Sentry: { init: value => { options = value; } } };
  new Function('window', SENTRY_LOADER_CONFIG)(window);
  assert.equal(options, undefined);
  window.sentryOnLoad();
  return options;
})();
const event = (value, filename) => ({ exception: { values: [{ value, ...(filename ? { stacktrace: { frames: [{ filename }] } } : {}) }] } });

test('drops the observed opaque cross-origin script diagnostic', () => {
  assert.equal(options.beforeSend(event('Event `ErrorEvent` captured as exception with message `Script error.`')), null);
  assert.equal(options.beforeSend(event('Script error.')), null);
});

test('preserves application errors, worker failures and missing stacks', () => {
  for (const value of ['Failed to fetch', 'SyntaxError: Unexpected token <', 'Script error. while parsing the document', 'ResizeObserver callback failed', 'Maximum call stack size exceeded']) {
    const original = event(value);
    assert.equal(options.beforeSend(original), original);
  }
  const original = event('Script error.', '/_next/static/chunks/app.js');
  assert.equal(options.beforeSend(original), original);
  const worker = event('Script error.', '/worker.mjs');
  assert.equal(options.beforeSend(worker), worker);
  const empty = {};
  assert.equal(options.beforeSend(empty), empty);
});

test('registers the callback before the SDK loader in the layout', () => {
  const source = readFileSync(new URL('../src/app/layout.tsx', import.meta.url), 'utf8');
  assert.ok(source.indexOf('id="sentry-loader-config"') < source.indexOf('src="https://js.sentry-cdn.com/'));
});
