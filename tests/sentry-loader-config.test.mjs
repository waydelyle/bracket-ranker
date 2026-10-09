import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { sentryLoaderConfig } from '../src/lib/sentry-loader-config.ts';

const require = createRequire(import.meta.url);
const acorn = require('next/dist/compiled/acorn');
const captureOptions = (release = 'test-release', api = {}) => {
  let options;
  const window = { Sentry: { ...api, init: value => { options = value; } } };
  new Function('window', sentryLoaderConfig(release))(window);
  assert.equal(options, undefined, 'configuration must not initialize before the loader callback');
  window.sentryOnLoad();
  return options;
};
const options = captureOptions();
const frame = (filename, absPath, name, lineNo, colNo) => ({ filename, absPath, function: name, lineNo, colNo, context: [] });
const results = '/results/NINzNHGl7e';
const resultsUrl = `https://www.bracketranker.com${results}`;
const home = 'https://www.bracketranker.com/';
// Complete represented mapped metadata from the four saved reports; no historical SDK/raw fields were available.
const originalFixtures = [
  { id: '7766673367', type: 'RangeError', value: 'Maximum call stack size exceeded.', mechanism: { type: 'auto.browser.global_handlers.onerror', handled: false }, frames: [
    ...Array.from({ length: 45 }, (_, i) => frame(results, resultsUrl, i % 2 ? 'Ok' : 'Qk', 226, i === 44 ? 382 : i % 2 ? 63 : 408)),
    ...[[198, 237], [190, 41], [197, 363], [190, 70], [187, 122]].map(([line, col]) => frame('/movies', 'https://www.bracketranker.com/movies', null, line, col)),
  ] },
  { id: '7766673381', type: 'RangeError', value: 'Maximum call stack size exceeded.', mechanism: { type: 'auto.browser.global_handlers.onerror', handled: false }, frames: [
    ...Array.from({ length: 47 }, (_, i) => frame(home, home, i % 2 ? 'Ok' : 'Qk', 226, i === 46 ? 382 : i % 2 ? 63 : 408)),
    ...[[198, 237], [190, 41], [197, 363]].map(([line, col]) => frame('/movies', 'https://www.bracketranker.com/movies', null, line, col)),
  ] },
  ...[['7766673287', results, resultsUrl], ['7766671959', home, home]].map(([id, filename, absPath]) => ({
    id, type: 'Error', value: 'La', mechanism: { type: 'auto.browser.global_handlers.onunhandledrejection', handled: false },
    frames: [[null, 195, 338], ['Vi', 194, 41], [null, 476, 363]].map(([name, line, col]) => frame(filename, absPath, name, line, col)),
  })),
];

test('retains all four represented reports and all 106 mapped frames', () => {
  assert.equal(originalFixtures.reduce((count, fixture) => count + fixture.frames.length, 0), 106);
  for (const fixture of originalFixtures) {
    const event = { release: null, exception: { values: [{ type: fixture.type, value: fixture.value, mechanism: fixture.mechanism, stacktrace: { frames: fixture.frames } }] } };
    const before = structuredClone(event);
    assert.equal(options.beforeSend(event), event, fixture.id);
    assert.deepEqual(event, before, fixture.id);
  }
});

test('retains ordinary, opaque, located, native and chained failures without diagnostic exclusions', () => {
  for (const value of ['Script error.', 'Event `ErrorEvent` captured as exception with message `Script error.`', 'Failed to fetch', 'SyntaxError: Unexpected token <', 'ResizeObserver loop completed with undelivered notifications.', 'Maximum call stack size exceeded', 'La', 'UnknownError']) {
    const event = { exception: { values: [{ type: 'Error', value, mechanism: { type: 'auto.browser.global_handlers.onerror', synthetic: true, handled: false }, stacktrace: { frames: [{ filename: '/movies', lineno: null, colno: null, context_line: 'meaningful context' }] } }, { type: 'TypeError', value: 'application cause', mechanism: { type: 'generic', exception_id: 1, parent_id: 0 } }] } };
    const before = structuredClone(event);
    assert.equal(options.beforeSend(event), event);
    assert.deepEqual(event, before);
  }
  const empty = {};
  assert.equal(options.beforeSend(empty), empty);
});

test('scrubs private aliases across all causes and legacy stacks while retaining diagnostics and null coordinates', () => {
  const privateFrame = {
    filename: 'https://user:password@www.bracketranker.com/a.js?secret=1#private',
    abs_path: '//user:password@www.bracketranker.com/b.js?secret=2#private',
    absPath: '/c.js?secret=3#private', fileName: 'BLOB:https://user:password@www.bracketranker.com/source-id?secret=4#private',
    vars: { private: 'local' }, function: 'caller', lineno: null, colno: null, lineNo: 17, colNo: 8,
    pre_context: ['before'], context_line: 'source()', post_context: ['after'], context: ['mapped source'],
  };
  const expectedFrame = { ...privateFrame, filename: 'https://www.bracketranker.com/a.js', abs_path: '//www.bracketranker.com/b.js', absPath: '/c.js', fileName: 'BLOB:https://www.bracketranker.com/source-id' };
  delete expectedFrame.vars;
  const stack = () => ({ frames: [structuredClone(privateFrame)], source: 'stack provenance' });
  const values = Array.from({ length: 6 }, (_, i) => ({ type: 'Error', value: `cause ${i}`, mechanism: { type: 'generic', handled: false, exception_id: i, ...(i ? { parent_id: i - 1 } : {}) }, stacktrace: stack(), rawStacktrace: stack(), raw_stacktrace: stack() }));
  const event = { event_id: 'test-id', user: { email: 'private' }, extra: { private: true }, breadcrumbs: [{ message: 'private' }], request: { url: 'https://user:password@www.bracketranker.com/movies?secret=4#private', method: 'GET', data: 'private', body: 'private', cookies: 'private', headers: { authorization: 'private' }, query_string: 'private' }, contexts: { trace: { trace_id: 'trace-id', span_id: 'span-id', data: { private: true } }, nextjs: { request_path: '/movies?secret=4#private', route: '/movies' } }, exception: { values }, stacktrace: stack(), rawStacktrace: stack(), raw_stacktrace: stack() };
  assert.equal(options.beforeSend(event), event);
  assert.equal(event.event_id, 'test-id');
  for (const key of ['user', 'extra', 'breadcrumbs']) assert.ok(!(key in event));
  assert.deepEqual(event.request, { url: 'https://www.bracketranker.com/movies', method: 'GET' });
  assert.deepEqual(event.contexts, { trace: { trace_id: 'trace-id', span_id: 'span-id' }, nextjs: { request_path: '/movies', route: '/movies' } });
  for (const value of [event, ...values]) for (const key of ['stacktrace', 'rawStacktrace', 'raw_stacktrace']) assert.deepEqual(value[key], { frames: [expectedFrame], source: 'stack provenance' });
  assert.deepEqual(values.map(value => [value.type, value.value, value.mechanism]), Array.from({ length: 6 }, (_, i) => ['Error', `cause ${i}`, { type: 'generic', handled: false, exception_id: i, ...(i ? { parent_id: i - 1 } : {}) }]));
});

test('scrubs mixed-case blobs and URL authority credentials while preserving non-string source values', () => {
  const frames = ['blob:private', 'BLOB:private', 'bLoB:private', 'bLoB:HTTPS://user:pass@host/raw.js?private#fragment', 'HTTPS://user:pass@host/a?private#fragment', '/a?private#fragment', 'file:///a?private#fragment', null].map(filename => ({ filename }));
  const event = { exception: { values: [{ stacktrace: { frames } }] } };
  options.beforeSend(event);
  assert.deepEqual(frames.map(item => item.filename), ['blob:private', 'BLOB:private', 'bLoB:private', 'bLoB:HTTPS://host/raw.js', 'HTTPS://host/a', '/a', 'file:///a', null]);
});

test('scrubs supplied URL tags and transactions while retaining plain tag values and blob prefix/source identity', () => {
  const event = { tags: { url: 'relative?private#fragment', source: 'BLOB:https://user:secret@www.bracketranker.com/source?private#fragment', path: '/movies?private#fragment', plain: 'keep?meaningful#text', number: 3 }, transaction: '/movies?private#fragment' };
  assert.equal(options.beforeSend(event), event);
  assert.deepEqual(event.tags, { url: 'relative', source: 'BLOB:https://www.bracketranker.com/source', path: '/movies', plain: 'keep?meaningful#text', number: 3 });
  assert.equal(event.transaction, '/movies');
});

test('keeps metadata optional, private and explicitly unsampled for every parent flag', () => {
  assert.equal(options.release, 'test-release');
  assert.equal(options.environment, 'production');
  for (const key of ['sendDefaultPii', 'enableLogs']) assert.equal(options[key], false);
  for (const key of ['maxBreadcrumbs', 'tracesSampleRate', 'replaysSessionSampleRate', 'replaysOnErrorSampleRate']) assert.equal(options[key], 0);
  assert.deepEqual(options.ignoreErrors, []);
  assert.deepEqual(options.denyUrls, []);
  for (const parentSampled of [undefined, false, true]) assert.equal(options.tracesSampler({ parentSampled }), 0);
  for (const release of ['', undefined]) assert.ok(!('release' in captureOptions(release === undefined ? '' : release)));
  assert.ok(!sentryLoaderConfig().includes('"release"'));
  assert.ok(!('autoSessionTracking' in options), 'the SDK does not support disabling BrowserSession with this legacy option');
});

test('replaces only supported error filters and optional performance integrations while keeping current/future object identities', () => {
  const replacement = { name: 'InboundFilters' };
  const calls = [];
  const withFactory = captureOptions('test-release', { inboundFiltersIntegration: argument => { calls.push(argument); return replacement; } });
  const core = [{ name: 'InboundFilters' }, { name: 'GlobalHandlers' }, { name: 'BrowserSession' }, { name: 'NextjsClientStackFrameNormalization' }, { name: 'FutureCore' }, { name: 'Replay' }, { name: 'BrowserTracing' }];
  const filtered = withFactory.integrations(core);
  assert.deepEqual(calls, [{ disableErrorDefaults: true }]);
  assert.equal(filtered[0], replacement);
  assert.deepEqual(filtered.slice(1), core.slice(1, 5));
  filtered.slice(1).forEach((item, i) => assert.equal(item, core[i + 1]));
  assert.deepEqual(core.map(item => item.name), ['InboundFilters', 'GlobalHandlers', 'BrowserSession', 'NextjsClientStackFrameNormalization', 'FutureCore', 'Replay', 'BrowserTracing']);
  assert.equal(options.integrations(core)[0], core[0], 'missing supported factory preserves the original integration');
  let eventFilterOptions;
  const eventReplacement = { name: 'EventFilters' };
  const eventOptions = captureOptions('test-release', { eventFiltersIntegration: argument => { eventFilterOptions = argument; return eventReplacement; } });
  assert.equal(eventOptions.integrations([{ name: 'EventFilters' }])[0], eventReplacement);
  assert.deepEqual(eventFilterOptions, { disableErrorDefaults: true });
});

const transportHarness = () => {
  const sends = [];
  const flushes = [];
  const transportOptions = { url: 'local-only', headers: { test: 'header' } };
  let receivedOptions;
  const response = Promise.resolve({ statusCode: 204 });
  const flushResult = Promise.resolve(true);
  const configured = captureOptions('test-release', { makeFetchTransport: argument => { receivedOptions = argument; return { send: envelope => { sends.push(envelope); return response; }, flush: timeout => { flushes.push(timeout); return flushResult; } }; } });
  return { transport: configured.transport(transportOptions), sends, flushes, response, flushResult, transportOptions, receivedOptions };
};

test('blocks only session and sessions envelopes with neutral results and preserves flush delegation', async () => {
  const harness = transportHarness();
  assert.equal(harness.receivedOptions, harness.transportOptions);
  const result = await harness.transport.send([{ event_id: 'private-session' }, [[{ type: 'session' }, { sid: 'one' }], [{ type: 'sessions' }, { aggregates: [] }]]]);
  assert.deepEqual(result, {});
  assert.ok(!('statusCode' in result));
  assert.equal(harness.sends.length, 0);
  assert.equal(harness.transport.flush(321), harness.flushResult);
  assert.deepEqual(harness.flushes, [321]);
});

test('mixed envelopes preserve the original header and each non-session item identity, content and order', async () => {
  const harness = transportHarness();
  const header = { event_id: 'error-id', trace: { public_key: 'own' } };
  const items = ['session', 'event', 'transaction', 'sessions', 'replay_event', 'log', 'future', 'Session'].map(type => [{ type }, { value: type }]);
  const envelope = [header, items];
  const before = structuredClone(envelope);
  assert.equal(harness.transport.send(envelope), harness.response);
  assert.equal(harness.sends[0][0], header);
  assert.deepEqual(harness.sends[0][1], [items[1], items[2], items[4], items[5], items[6], items[7]]);
  harness.sends[0][1].forEach((item, i) => assert.equal(item, [items[1], items[2], items[4], items[5], items[6], items[7]][i]));
  assert.deepEqual(envelope, before);
});

test('unchanged and empty envelopes delegate the exact original envelope', () => {
  const harness = transportHarness();
  for (const items of [[], [[{ type: 'event' }, { message: 'diagnostic' }]], [[{ type: 'unknown' }, {}]]]) {
    const envelope = [{ event_id: 'same' }, items];
    assert.equal(harness.transport.send(envelope), harness.response);
    assert.equal(harness.sends.at(-1), envelope);
  }
});

test('literal callback is standalone ES5 and safely encodes all script boundaries', () => {
  const release = '</script>"quoted"\\release\u2028line\u2029paragraph';
  const config = sentryLoaderConfig(release);
  assert.ok(!config.includes('</script>'));
  assert.ok(!config.includes('\u2028'));
  assert.ok(!config.includes('\u2029'));
  assert.doesNotThrow(() => acorn.parse(config, { ecmaVersion: 5 }));
  assert.equal(captureOptions(release).release, release);
  assert.ok(!config.includes('isMonitoringDiagnostic'));
  assert.ok(!config.includes('autoSessionTracking'));
});

test('preserves the literal head callback before the existing anonymous deferred body loader', () => {
  const source = readFileSync(new URL('../src/app/layout.tsx', import.meta.url), 'utf8');
  const callback = source.indexOf('id="sentry-loader-config"');
  const loader = source.indexOf('src="https://js.sentry-cdn.com/4a35e6aafb5d1e911610f80498a1dbe1.min.js"');
  assert.ok(source.indexOf('<head>') < callback && callback < source.indexOf('</head>'));
  assert.ok(source.indexOf('<body') < loader && callback < loader);
  assert.match(source, /<script\s+src="https:\/\/js\.sentry-cdn\.com\/4a35e6aafb5d1e911610f80498a1dbe1\.min\.js"\s+crossOrigin="anonymous"\s+defer/);
  assert.match(source, /sentryLoaderConfig\(process\.env\.VERCEL_GIT_COMMIT_SHA \|\| process\.env\.SENTRY_RELEASE\)/);
  assert.ok(!source.includes('next/script'));
});
