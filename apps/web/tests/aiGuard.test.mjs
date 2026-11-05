import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { authorizeAiRequest } from '../src/lib/aiGuard.ts';

const ENV_KEYS = [
  'MERMAIDMAN_AI_ACCESS_TOKEN',
  'MERMAIDMAN_AI_ALLOW_PUBLIC',
  'MERMAIDMAN_AI_RATE_LIMIT_PER_MINUTE',
];
const saved = {};
let counter = 0;

beforeEach(() => {
  for (const key of ENV_KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
  globalThis.__mermaidmanAiRateBuckets?.clear();
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

function request(headers = {}) {
  counter += 1;
  return new Request('https://app.example.test/api/ai', {
    method: 'POST',
    headers: { 'x-forwarded-for': `10.0.0.${counter}`, ...headers },
  });
}

test('fails closed when neither a token nor public access is configured', () => {
  const result = authorizeAiRequest(request({ origin: 'https://app.example.test' }));
  assert.equal(result.ok, false);
  assert.equal(result.status, 503);
  assert.equal(result.code, 'ai_disabled');
});

test('public mode rejects requests with no Origin header', () => {
  process.env.MERMAIDMAN_AI_ALLOW_PUBLIC = 'true';
  const result = authorizeAiRequest(request());
  assert.equal(result.status, 403);
  assert.equal(result.code, 'ai_origin_rejected');
});

test('public mode rejects a cross-origin request and a malformed Origin', () => {
  process.env.MERMAIDMAN_AI_ALLOW_PUBLIC = 'true';
  const cross = authorizeAiRequest(
    request({ origin: 'https://evil.example', host: 'app.example.test' }),
  );
  assert.equal(cross.code, 'ai_origin_rejected');
  const malformed = authorizeAiRequest(request({ origin: 'not a url' }));
  assert.equal(malformed.code, 'ai_origin_rejected');
});

test('public mode accepts a same-origin request, including behind x-forwarded-host', () => {
  process.env.MERMAIDMAN_AI_ALLOW_PUBLIC = 'true';
  assert.deepEqual(
    authorizeAiRequest(request({ origin: 'https://proxy.example', 'x-forwarded-host': 'proxy.example' })),
    { ok: true },
  );
});

test('ALLOW_PUBLIC must be exactly "true"', () => {
  process.env.MERMAIDMAN_AI_ALLOW_PUBLIC = '1';
  const result = authorizeAiRequest(request({ origin: 'https://app.example.test' }));
  assert.equal(result.code, 'ai_disabled');
});

test('a configured token is required and must match exactly', () => {
  process.env.MERMAIDMAN_AI_ACCESS_TOKEN = 'unit-test-token';
  assert.equal(authorizeAiRequest(request()).status, 401);
  assert.equal(authorizeAiRequest(request({ 'x-mermaidman-ai-token': 'wrong-token-xx' })).status, 401);
  assert.equal(authorizeAiRequest(request({ 'x-mermaidman-ai-token': 'unit-test' })).status, 401);
  assert.deepEqual(
    authorizeAiRequest(request({ 'x-mermaidman-ai-token': 'unit-test-token' })),
    { ok: true },
  );
});

test('a configured token takes precedence over public mode and skips the origin check', () => {
  process.env.MERMAIDMAN_AI_ACCESS_TOKEN = 'unit-test-token';
  process.env.MERMAIDMAN_AI_ALLOW_PUBLIC = 'true';
  assert.equal(authorizeAiRequest(request({ origin: 'https://app.example.test' })).status, 401);
  assert.equal(
    authorizeAiRequest(request({ origin: 'https://evil.example', 'x-mermaidman-ai-token': 'unit-test-token' })).ok,
    true,
  );
});

test('rate limit blocks after the configured count and reports Retry-After', () => {
  process.env.MERMAIDMAN_AI_ALLOW_PUBLIC = 'true';
  process.env.MERMAIDMAN_AI_RATE_LIMIT_PER_MINUTE = '2';
  const headers = { origin: 'https://app.example.test', 'x-forwarded-for': '203.0.113.7' };
  assert.equal(authorizeAiRequest(request(headers)).ok, true);
  assert.equal(authorizeAiRequest(request(headers)).ok, true);
  const blocked = authorizeAiRequest(request(headers));
  assert.equal(blocked.ok, false);
  assert.equal(blocked.status, 429);
  assert.equal(blocked.code, 'ai_rate_limited');
  assert.ok(blocked.retryAfter >= 1 && blocked.retryAfter <= 60);

  // A different client has its own bucket.
  assert.equal(
    authorizeAiRequest(request({ ...headers, 'x-forwarded-for': '203.0.113.8' })).ok,
    true,
  );
});

test('an invalid rate limit value falls back to the default of 8', () => {
  process.env.MERMAIDMAN_AI_ALLOW_PUBLIC = 'true';
  process.env.MERMAIDMAN_AI_RATE_LIMIT_PER_MINUTE = 'abc';
  const headers = { origin: 'https://app.example.test', 'x-forwarded-for': '198.51.100.9' };
  for (let i = 0; i < 8; i += 1) assert.equal(authorizeAiRequest(request(headers)).ok, true);
  assert.equal(authorizeAiRequest(request(headers)).status, 429);
});

test('client identity uses the first x-forwarded-for entry', () => {
  process.env.MERMAIDMAN_AI_ALLOW_PUBLIC = 'true';
  process.env.MERMAIDMAN_AI_RATE_LIMIT_PER_MINUTE = '1';
  const base = { origin: 'https://app.example.test' };
  assert.equal(authorizeAiRequest(request({ ...base, 'x-forwarded-for': '192.0.2.1, 10.1.1.1' })).ok, true);
  assert.equal(authorizeAiRequest(request({ ...base, 'x-forwarded-for': '192.0.2.1, 10.9.9.9' })).status, 429);
});
