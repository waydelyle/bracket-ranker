import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sentryLoaderConfig } from '../src/lib/sentry-loader-config.ts';

const SENTRY_LOADER_CONFIG = sentryLoaderConfig('test-release');

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

test('registers the head callback before the actual deferred CDN loader', () => {
  const source = readFileSync(new URL('../src/app/layout.tsx', import.meta.url), 'utf8');
  assert.ok(source.indexOf('id="sentry-loader-config"') < source.indexOf('src="https://js.sentry-cdn.com/'));
  assert.ok(source.indexOf('<head>') < source.indexOf('id="sentry-loader-config"'));
  assert.ok(source.indexOf('id="sentry-loader-config"') < source.indexOf('</head>'));
  assert.match(source, /<script\s+src="https:\/\/js\.sentry-cdn\.com\/[^\"]+"\s+crossOrigin="anonymous"\s+defer/);
  assert.ok(!source.includes('import Script from "next/script"'));
});

test('identifies the release and keeps monitoring limited to errors', () => {
  assert.equal(options.release, 'test-release');
  assert.equal(options.environment, 'production');
  assert.equal(options.sendDefaultPii, false);
  assert.equal(options.tracesSampleRate, 0);
  assert.equal(options.replaysSessionSampleRate, 0);
  assert.equal(options.replaysOnErrorSampleRate, 0);
});

test('serializes release metadata without closing the script', () => {
  const release = '</script>"quoted"\\release';
  const config = sentryLoaderConfig(release);
  assert.ok(!config.includes('</script>'));
  let captured;
  const window = { Sentry: { init: value => { captured = value; } } };
  new Function('window', config)(window);
  window.sentryOnLoad();
  assert.equal(captured.release, release);
});
