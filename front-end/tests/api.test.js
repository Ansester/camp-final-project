import test from 'node:test';
import assert from 'node:assert/strict';
import { api } from '../src/services/api.js';
const values = new Map();
globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
globalThis.window = { dispatchEvent: () => {} };
test('API sends stored bearer token and JSON payload to the actual route', async () => {
  values.set('camp_token', 'fixture-token');
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/auth/register');
    assert.equal(options.headers.Authorization, 'Bearer fixture-token');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.equal(JSON.parse(options.body).firstName, 'Fixture');
    return { ok: true, json: async () => ({ user: { role: 'student' } }) };
  };
  assert.equal((await api.register({ firstName: 'Fixture' })).user.role, 'student');
});
test('401 clears local auth and dispatches logout; 403 preserves the session', async () => {
  let events = 0;
  window.dispatchEvent = () => { events += 1; };
  globalThis.fetch = async () => ({ ok: false, status: 403, statusText: 'Forbidden', text: async () => '' });
  await assert.rejects(api.staffInventory(), /403/);
  assert.equal(values.get('camp_token'), 'fixture-token');
  globalThis.fetch = async () => ({ ok: false, status: 401, statusText: 'Unauthorized', text: async () => '' });
  await assert.rejects(api.dashboard('fixture'), /401/);
  assert.equal(values.has('camp_token'), false);
  assert.equal(events, 1);
});
