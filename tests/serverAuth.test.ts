import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { after, before, test } from 'node:test';

const temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'arelpro-auth-'));
process.env.CRM_DB_PATH = path.join(temporaryDirectory, 'crm.sqlite');
process.env.CRM_SERVER_AUTOSTART = 'false';
process.env.ADMIN_USERNAME = 'test-admin';
process.env.ADMIN_PASSWORD = 'test-password-with-more-than-16-chars';
process.env.SESSION_SECRET = 'test-session-secret-with-more-than-32-bytes';
process.env.NODE_ENV = 'production';

const { app } = await import('../server');
const { crmDatabase } = await import('../src/services/sqliteDatabase');
const server = app.listen(0);
const address = server.address() as AddressInfo;
const baseUrl = `http://127.0.0.1:${address.port}`;
const origin = baseUrl;
let sessionCookie = '';

before(async () => {
  await new Promise<void>((resolve, reject) => {
    server.listening ? resolve() : server.once('listening', resolve).once('error', reject);
  });
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
  crmDatabase.close();
  rmSync(temporaryDirectory, { recursive: true, force: true });
});

test('CRM APIs reject anonymous requests and cross-origin login attempts', async () => {
  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);

  const anonymousResponse = await fetch(`${baseUrl}/api/data`);
  assert.equal(anonymousResponse.status, 401);

  const anonymousAiRequest = await fetch(`${baseUrl}/api/ai/assistant`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'test' }),
  });
  assert.equal(anonymousAiRequest.status, 401);

  const crossOriginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      Origin: 'http://attacker.example',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: 'test-admin', password: 'wrong-password' }),
  });
  assert.equal(crossOriginResponse.status, 403);
});

test('login uses generic errors, sets a protected session, and allows authenticated CRM access', async () => {
  const rejectedLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'test-admin', password: 'incorrect-password' }),
  });
  assert.equal(rejectedLogin.status, 401);
  assert.match((await rejectedLogin.json()).error, /Kullanıcı adı veya parola hatalı/);

  const acceptedLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'test-admin',
      password: process.env.ADMIN_PASSWORD,
    }),
  });
  assert.equal(acceptedLogin.status, 200);
  const setCookie = acceptedLogin.headers.get('set-cookie');
  assert.ok(setCookie);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Strict/i);
  assert.match(setCookie, /Secure/i);
  sessionCookie = setCookie.split(';', 1)[0];

  const session = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: sessionCookie },
  });
  const sessionData = await session.json();
  assert.equal(sessionData.authenticated, true);
  assert.equal(sessionData.username, 'test-admin');
  assert.equal(sessionData.displayName, 'test-admin');

  const data = await fetch(`${baseUrl}/api/data`, {
    headers: { Cookie: sessionCookie },
  });
  assert.equal(data.status, 200);
  const crmData = await data.json();
  assert.ok(crmData.companies.length > 0);

  const savedRecord = await fetch(`${baseUrl}/api/data/companies`, {
    method: 'POST',
    headers: {
      Cookie: sessionCookie,
      Origin: origin,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: 'auth-integration-record' }),
  });
  assert.equal(savedRecord.status, 204);

  const deletedRecord = await fetch(`${baseUrl}/api/data/companies/auth-integration-record`, {
    method: 'DELETE',
    headers: { Cookie: sessionCookie, Origin: origin },
  });
  assert.equal(deletedRecord.status, 204);

  const profileUpdate = await fetch(`${baseUrl}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      Cookie: sessionCookie,
      Origin: origin,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ displayName: 'CRM Yönetici' }),
  });
  assert.equal(profileUpdate.status, 200);
  assert.equal((await profileUpdate.json()).displayName, 'CRM Yönetici');

  const backupResponse = await fetch(`${baseUrl}/api/admin/backup`, {
    method: 'POST',
    headers: { Cookie: sessionCookie, Origin: origin },
  });
  assert.equal(backupResponse.status, 200);
  assert.match(backupResponse.headers.get('content-type') || '', /application\/octet-stream/);
  assert.ok((await backupResponse.arrayBuffer()).byteLength > 0);

  const passwordUpdate = await fetch(`${baseUrl}/api/auth/password`, {
    method: 'POST',
    headers: {
      Cookie: sessionCookie,
      Origin: origin,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentPassword: process.env.ADMIN_PASSWORD,
      newPassword: 'new-test-password-with-more-than-16-chars',
    }),
  });
  assert.equal(passwordUpdate.status, 204);
});

test('mutations require same-origin requests and logout revokes the browser session', async () => {
  const crossOriginWrite = await fetch(`${baseUrl}/api/data/companies`, {
    method: 'POST',
    headers: {
      Cookie: sessionCookie,
      Origin: 'http://attacker.example',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: 'blocked-record' }),
  });
  assert.equal(crossOriginWrite.status, 403);

  const logout = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: sessionCookie, Origin: origin },
  });
  assert.equal(logout.status, 204);

  const afterLogout = await fetch(`${baseUrl}/api/data`, {
    headers: { Cookie: sessionCookie },
  });
  assert.equal(afterLogout.status, 401);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const failedLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test-admin', password: 'incorrect-password' }),
    });
    assert.equal(failedLogin.status, 401);
  }
  const rateLimitedLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'test-admin', password: 'incorrect-password' }),
  });
  assert.equal(rateLimitedLogin.status, 429);
});
