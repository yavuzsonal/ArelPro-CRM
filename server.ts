import 'dotenv/config';
import { serverConfig } from './src/services/serverConfig';
import {
  createHmac,
  randomBytes,
  scrypt,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import path from 'path';
import { closeSync, openSync, unlinkSync, writeFileSync } from 'node:fs';
import express, { NextFunction, Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { CrmCollection, CrmData, crmDatabase, databasePath, SqliteDatabase } from './src/services/sqliteDatabase';
import { createDatabaseBackup } from './src/services/backupService';

export const app = express();
const { port, host, adminUsername, adminPassword, sessionSecret } = serverConfig;
const aiRequestWindows = new Map<string, { count: number; resetAt: number }>();
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const activeSessions = new Map<string, { username: string; expiresAt: number }>();
const aiRequestLimit = 30;
const aiRequestWindowMs = 60_000;
const sessionDurationMs = 8 * 60 * 60 * 1000;
const sessionCookieName = 'arelpro_session';
const sessionKeyLength = 64;

let passwordSalt: Buffer;
let expectedPasswordHash: Buffer;
let profileDisplayName: string;
const configuredPasswordSalt = randomBytes(16);
const configuredPasswordHash = scryptSync(adminPassword, configuredPasswordSalt, sessionKeyLength);
const bootstrapFingerprint = createHmac('sha256', sessionSecret)
  .update(`${adminUsername}\0${adminPassword}`)
  .digest('hex');
const storedBootstrapFingerprint = SqliteDatabase.getMetadata('admin_bootstrap_fingerprint');

if (storedBootstrapFingerprint !== bootstrapFingerprint) {
  passwordSalt = configuredPasswordSalt;
  expectedPasswordHash = configuredPasswordHash;
  profileDisplayName = adminUsername;
  SqliteDatabase.setMetadata({
    admin_bootstrap_fingerprint: bootstrapFingerprint,
    admin_password_salt: passwordSalt.toString('hex'),
    admin_password_hash: expectedPasswordHash.toString('hex'),
    admin_profile_display_name: profileDisplayName,
  });
} else {
  const storedPasswordSalt = SqliteDatabase.getMetadata('admin_password_salt');
  const storedPasswordHash = SqliteDatabase.getMetadata('admin_password_hash');
  if (!storedPasswordSalt || !storedPasswordHash) {
    throw new Error('Stored administrator credentials are incomplete.');
  }
  passwordSalt = Buffer.from(storedPasswordSalt, 'hex');
  expectedPasswordHash = Buffer.from(storedPasswordHash, 'hex');
  if (passwordSalt.length !== 16 || expectedPasswordHash.length !== sessionKeyLength) {
    throw new Error('Stored administrator credentials are invalid.');
  }
  profileDisplayName = SqliteDatabase.getMetadata('admin_profile_display_name') || adminUsername;
}

function derivePasswordHash(password: string, salt = passwordSalt): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, sessionKeyLength, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

function signSession(payload: string): string {
  return createHmac('sha256', sessionSecret).update(payload).digest('base64url');
}

function createSessionToken(username: string): string {
  const expiresAt = Date.now() + sessionDurationMs;
  const nonce = randomBytes(16).toString('base64url');
  for (const [sessionId, session] of activeSessions) {
    if (session.expiresAt <= Date.now()) activeSessions.delete(sessionId);
  }
  if (activeSessions.size >= 10_000) {
    throw new Error('The active session limit has been reached.');
  }
  activeSessions.set(nonce, { username, expiresAt });
  const payload = Buffer.from(JSON.stringify({
    sub: username,
    exp: expiresAt,
    nonce,
  })).toString('base64url');
  return `${payload}.${signSession(payload)}`;
}

function readSession(token: string | undefined): { username: string; nonce: string; expiresAt: number } | null {
  if (!token) return null;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return null;

  const expectedSignature = Buffer.from(signSession(payload));
  const suppliedSignature = Buffer.from(signature);
  if (expectedSignature.length !== suppliedSignature.length
    || !timingSafeEqual(expectedSignature, suppliedSignature)) return null;

  try {
    const session: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!isRecord(session)
      || session.sub !== adminUsername
      || typeof session.exp !== 'number'
      || session.exp <= Date.now()
      || typeof session.nonce !== 'string') return null;
    return {
      username: session.sub,
      nonce: session.nonce,
      expiresAt: session.exp,
    };
  } catch {
    return null;
  }
}

function getSessionUsername(token: string | undefined): string | null {
  const session = readSession(token);
  if (!session) return null;
  const activeSession = activeSessions.get(session.nonce);
  return activeSession
    && activeSession.username === session.username
    && activeSession.expiresAt === session.expiresAt
    ? session.username
    : null;
}

function readSessionCookie(req: Request): string | undefined {
  const cookieHeader = req.get('cookie');
  if (!cookieHeader) return undefined;
  const sessionCookie = cookieHeader.split(';').map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith(`${sessionCookieName}=`));
  return sessionCookie?.slice(sessionCookieName.length + 1);
}

function isSameOrigin(req: Request): boolean {
  const origin = req.get('origin');
  const hostHeader = req.get('host');
  if (!origin || !hostHeader) return false;
  try {
    return new URL(origin).host.toLowerCase() === hostHeader.toLowerCase();
  } catch {
    return false;
  }
}

function registerLoginAttempt(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  if (!attempts || attempts.resetAt <= now) {
    if (loginAttempts.size >= 10_000) {
      for (const [key, value] of loginAttempts) {
        if (value.resetAt <= now) loginAttempts.delete(key);
      }
      if (loginAttempts.size >= 10_000) return false;
    }
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60_000 });
    return true;
  }
  if (attempts.count >= 5) return false;
  attempts.count += 1;
  return true;
}

function requireAuthentication(req: Request, res: Response, next: NextFunction): void {
  const username = getSessionUsername(readSessionCookie(req));
  if (!username) {
    res.status(401).json({ error: 'Oturum açmanız gerekiyor.' });
    return;
  }
  res.locals.username = username;
  next();
}

function acquireApplicationLock(): () => void {
  const lockPath = `${databasePath}.app.lock`;
  let descriptor: number | undefined;
  let lockCreated = false;
  try {
    descriptor = openSync(lockPath, 'wx');
    lockCreated = true;
    writeFileSync(descriptor, `${process.pid}\n`, 'utf8');
    closeSync(descriptor);
    descriptor = undefined;
  } catch (error) {
    if (descriptor !== undefined) {
      try {
        closeSync(descriptor);
      } catch {
        // Keep the original lock creation error.
      }
    }
    if (lockCreated) {
      try {
        unlinkSync(lockPath);
      } catch {
        // Keep the original lock creation error.
      }
    }
    if (isRecord(error) && error.code === 'EEXIST') {
      throw new Error(`Another CRM server may already be using this database (${lockPath}).`);
    }
    throw error;
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    try {
      unlinkSync(lockPath);
    } catch (error) {
      if (!isRecord(error) || error.code !== 'ENOENT') {
        console.error('Could not remove the CRM server lock file:', error);
      }
    }
  };
}

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === 'string' || typeof value === 'number'
    ? String(value).slice(0, 250)
    : '';
}

const crmCollections = new Set<CrmCollection>([
  'companies',
  'activities',
  'meetings',
  'calendarEvents',
  'syncLogs',
]);

function isCrmCollection(value: string): value is CrmCollection {
  return crmCollections.has(value as CrmCollection);
}

function isDataRecord(value: unknown): value is { id: string } {
  return isRecord(value)
    && typeof value.id === 'string'
    && value.id.trim().length > 0
    && value.id.length <= 200;
}

function areDataRecords(value: unknown): value is Array<{ id: string }> {
  return Array.isArray(value)
    && value.length <= 10_000
    && value.every(isDataRecord)
    && new Set(value.map(record => record.id)).size === value.length;
}

app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !isSameOrigin(req)) {
    res.status(403).json({ error: 'İstek aynı kaynaktan gönderilmelidir.' });
    return;
  }
  next();
});

app.use(express.json({ limit: '12mb' }));

function withinAiRateLimit(req: Request): boolean {
  const now = Date.now();
  const key = req.ip || 'unknown';
  const current = aiRequestWindows.get(key);

  if (!current || current.resetAt <= now) {
    if (aiRequestWindows.size >= 10_000) {
      for (const [ip, window] of aiRequestWindows) {
        if (window.resetAt <= now) aiRequestWindows.delete(ip);
      }
      if (aiRequestWindows.size >= 10_000) return false;
    }
    aiRequestWindows.set(key, { count: 1, resetAt: now + aiRequestWindowMs });
    return true;
  }

  if (current.count >= aiRequestLimit) return false;
  current.count += 1;
  return true;
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    name: 'ArelPro University CRM API',
  });
});

app.post('/api/auth/login', async (req, res) => {
  const ip = req.ip || 'unknown';
  if (!registerLoginAttempt(ip)) {
    res.status(429).json({ error: 'Çok fazla hatalı giriş denemesi. 15 dakika sonra tekrar deneyin.' });
    return;
  }
  if (!isRecord(req.body)
    || typeof req.body.username !== 'string'
    || typeof req.body.password !== 'string'
    || req.body.username.length > 64
    || req.body.password.length === 0
    || req.body.password.length > 1024) {
    res.status(400).json({ error: 'Kullanıcı adı ve parola gereklidir.' });
    return;
  }

  try {
    const usernameBuffer = Buffer.from(req.body.username.trim());
    const expectedUsernameBuffer = Buffer.from(adminUsername);
    const usernameMatches = usernameBuffer.length === expectedUsernameBuffer.length
      && timingSafeEqual(usernameBuffer, expectedUsernameBuffer);
    const passwordHash = await derivePasswordHash(req.body.password);
    const passwordMatches = timingSafeEqual(passwordHash, expectedPasswordHash);
    if (!usernameMatches || !passwordMatches) {
      res.status(401).json({ error: 'Kullanıcı adı veya parola hatalı.' });
      return;
    }

    loginAttempts.delete(ip);
    res.cookie(sessionCookieName, createSessionToken(adminUsername), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: sessionDurationMs,
      path: '/',
    });
    res.json({ authenticated: true, username: adminUsername, displayName: profileDisplayName });
  } catch (error) {
    console.error('Authentication failed:', error);
    res.status(500).json({ error: 'Giriş işlemi tamamlanamadı.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const session = readSession(readSessionCookie(req));
  if (session) activeSessions.delete(session.nonce);
  res.clearCookie(sessionCookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.status(204).end();
});

app.get('/api/auth/me', (req, res) => {
  const token = readSessionCookie(req);
  const sessionUsername = getSessionUsername(token);
  const session = readSession(token);
  res.json(sessionUsername
    ? {
      authenticated: true,
      username: sessionUsername,
      displayName: profileDisplayName,
      role: 'Yönetici',
      sessionExpiresAt: session?.expiresAt,
    }
    : { authenticated: false });
});

app.put('/api/auth/profile', requireAuthentication, (req, res) => {
  if (!isRecord(req.body) || typeof req.body.displayName !== 'string') {
    res.status(400).json({ error: 'Geçerli bir profil adı gereklidir.' });
    return;
  }
  const displayName = req.body.displayName.trim();
  if (displayName.length < 2 || displayName.length > 80) {
    res.status(400).json({ error: 'Profil adı 2 ile 80 karakter arasında olmalıdır.' });
    return;
  }
  try {
    SqliteDatabase.setMetadata({ admin_profile_display_name: displayName });
    profileDisplayName = displayName;
    res.json({ username: adminUsername, displayName, role: 'Yönetici' });
  } catch (error) {
    console.error('Failed to update administrator profile:', error);
    res.status(500).json({ error: 'Profil güncellenemedi.' });
  }
});

app.post('/api/auth/password', requireAuthentication, async (req, res) => {
  if (!isRecord(req.body)
    || typeof req.body.currentPassword !== 'string'
    || typeof req.body.newPassword !== 'string') {
    res.status(400).json({ error: 'Mevcut ve yeni parolayı girin.' });
    return;
  }
  if (Buffer.byteLength(req.body.newPassword) < 16 || req.body.newPassword.length > 1024) {
    res.status(400).json({ error: 'Yeni parola en az 16 bayt olmalı ve 1024 karakteri aşmamalıdır.' });
    return;
  }

  try {
    const suppliedPasswordHash = await derivePasswordHash(req.body.currentPassword);
    if (!timingSafeEqual(suppliedPasswordHash, expectedPasswordHash)) {
      res.status(401).json({ error: 'Mevcut parola hatalı.' });
      return;
    }
    const nextSalt = randomBytes(16);
    const nextHash = await derivePasswordHash(req.body.newPassword, nextSalt);
    SqliteDatabase.setMetadata({
      admin_password_salt: nextSalt.toString('hex'),
      admin_password_hash: nextHash.toString('hex'),
    });
    passwordSalt = nextSalt;
    expectedPasswordHash = nextHash;

    const currentSession = readSession(readSessionCookie(req));
    for (const [nonce, session] of activeSessions) {
      if (!currentSession || nonce !== currentSession.nonce) activeSessions.delete(nonce);
    }
    res.status(204).end();
  } catch (error) {
    console.error('Failed to update administrator password:', error);
    res.status(500).json({ error: 'Parola güncellenemedi.' });
  }
});

app.use('/api', (req, res, next) => {
  if (req.path === '/health'
    || req.path === '/auth/login'
    || req.path === '/auth/logout'
    || req.path === '/auth/me') {
    next();
    return;
  }
  requireAuthentication(req, res, next);
});

app.get('/api/data', (_req, res) => {
  try {
    res.json(SqliteDatabase.getAll());
  } catch (error) {
    console.error('Failed to read CRM data from SQLite:', error);
    res.status(500).json({ error: 'CRM data could not be loaded.' });
  }
});

app.post('/api/data/reset', (_req, res) => {
  try {
    res.json(SqliteDatabase.reset());
  } catch (error) {
    console.error('Failed to reset CRM SQLite data:', error);
    res.status(500).json({ error: 'CRM data could not be reset.' });
  }
});

app.post('/api/admin/backup', async (_req, res) => {
  try {
    const backupDirectory = path.resolve(
      process.env.CRM_BACKUP_DIR || path.join(path.dirname(databasePath), 'backups'),
    );
    const backupPath = await createDatabaseBackup(crmDatabase, backupDirectory);
    res.download(backupPath, path.basename(backupPath), error => {
      if (error) console.error('Failed to send SQLite backup:', error);
    });
  } catch (error) {
    console.error('Failed to create SQLite backup:', error);
    res.status(500).json({ error: 'Veritabanı yedeği oluşturulamadı.' });
  }
});

app.post('/api/data/legacy-migration', (req, res) => {
  if (!isRecord(req.body)) {
    res.status(400).json({ error: 'A legacy data object is required.' });
    return;
  }
  const legacyData: Partial<CrmData> = {};
  for (const collection of crmCollections) {
    const records = req.body[collection];
    if (records === undefined) continue;
    if (!areDataRecords(records)) {
      res.status(400).json({ error: `Invalid legacy records for ${collection}.` });
      return;
    }
    switch (collection) {
      case 'companies':
        legacyData.companies = records as CrmData['companies'];
        break;
      case 'activities':
        legacyData.activities = records as CrmData['activities'];
        break;
      case 'meetings':
        legacyData.meetings = records as CrmData['meetings'];
        break;
      case 'calendarEvents':
        legacyData.calendarEvents = records as CrmData['calendarEvents'];
        break;
      case 'syncLogs':
        legacyData.syncLogs = records as CrmData['syncLogs'];
        break;
    }
  }
  try {
    res.json({ migrated: SqliteDatabase.migrateLegacyData(legacyData) });
  } catch (error) {
    console.error('Failed to migrate legacy CRM browser data:', error);
    res.status(500).json({ error: 'Legacy CRM data could not be migrated.' });
  }
});

app.post('/api/data/:collection', (req, res) => {
  const { collection } = req.params;
  if (!isCrmCollection(collection)) {
    res.status(404).json({ error: 'Unknown CRM collection.' });
    return;
  }
  if (!isDataRecord(req.body)) {
    res.status(400).json({ error: 'A CRM record with a valid id is required.' });
    return;
  }
  try {
    SqliteDatabase.upsert(collection, req.body);
    res.status(204).end();
  } catch (error) {
    console.error(`Failed to write CRM record to ${collection}:`, error);
    res.status(500).json({ error: 'CRM record could not be saved.' });
  }
});

app.put('/api/data/:collection', (req, res) => {
  const { collection } = req.params;
  if (!isCrmCollection(collection)) {
    res.status(404).json({ error: 'Unknown CRM collection.' });
    return;
  }
  if (!areDataRecords(req.body)) {
    res.status(400).json({ error: 'A valid array of CRM records is required.' });
    return;
  }
  try {
    SqliteDatabase.replace(collection, req.body);
    res.status(204).end();
  } catch (error) {
    console.error(`Failed to replace CRM collection ${collection}:`, error);
    res.status(500).json({ error: 'CRM records could not be saved.' });
  }
});

app.delete('/api/data/:collection/:id', (req, res) => {
  const { collection, id } = req.params;
  if (!isCrmCollection(collection)) {
    res.status(404).json({ error: 'Unknown CRM collection.' });
    return;
  }
  try {
    SqliteDatabase.delete(collection, id);
    res.status(204).end();
  } catch (error) {
    console.error(`Failed to delete CRM record from ${collection}:`, error);
    res.status(500).json({ error: 'CRM record could not be deleted.' });
  }
});

app.post('/api/ai/assistant', async (req, res) => {
  if (!withinAiRateLimit(req)) {
    res.status(429).json({ error: 'Too many AI requests. Please try again later.' });
    return;
  }

  if (!isRecord(req.body) || typeof req.body.prompt !== 'string' || !req.body.prompt.trim()) {
    res.status(400).json({ error: 'A non-empty prompt is required.' });
    return;
  }
  const prompt = req.body.prompt.trim();
  if (prompt.length > 8_000) {
    res.status(413).json({ error: 'Prompt exceeds the 8000 character limit.' });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(503).json({ error: 'Gemini is not configured on this server.' });
    return;
  }

  const companyContext = isRecord(req.body.companyContext) ? req.body.companyContext : null;
  const crmContext = isRecord(req.body.crmContext) ? req.body.crmContext : {};
  const companiesSummary = Array.isArray(crmContext.companies)
    ? crmContext.companies.slice(0, 15).filter(isRecord).map(company =>
      `${readField(company, 'name')} (${readField(company, 'sector')}, Protokol: ${readField(company, 'protocolStatus')}, Yetkili: ${isRecord(company.contactPerson) ? readField(company.contactPerson, 'name') : ''})`,
    ).join('\n')
    : '';
  const activitiesSummary = Array.isArray(crmContext.recentActivities)
    ? crmContext.recentActivities.slice(0, 10).filter(isRecord).map(activity =>
      `${readField(activity, 'date')}: ${readField(activity, 'title')} (${readField(activity, 'companyName')}, ${readField(activity, 'type')}, Lokasyon: ${readField(activity, 'location')})`,
    ).join('\n')
    : '';
  const meetingsSummary = Array.isArray(crmContext.recentMeetings)
    ? crmContext.recentMeetings.slice(0, 10).filter(isRecord).map(meeting =>
      `${readField(meeting, 'date')}: ${readField(meeting, 'title')} (${readField(meeting, 'companyName')}, ${readField(meeting, 'format')}, Karar/Durum: ${readField(meeting, 'status')})`,
    ).join('\n')
    : '';

  const systemInstruction = `Sen İstanbul Arel Üniversitesi Kurumsal İlişkiler ve Teknoloji Transfer Ofisi (ArelPro) Akıllı Yapay Zeka Asistanısın.
Toplantı veya faaliyet talebinde kayıt oluşturduğunu iddia etme; taslak hazırla, eksik bilgileri sor ve onay gerektiğini açıkça belirt. Kurumsal kayıt sorgularında yalnızca aşağıdaki CRM bağlamına dayalı bilgi ver; bağlamda bulunmayan veriyi uydurma. Resmi, saygılı ve net Türkçe kullan.

FİRMALAR:
${companiesSummary || 'Firma verisi sağlanmadı.'}

SON FAALİYETLER:
${activitiesSummary || 'Faaliyet verisi sağlanmadı.'}

SON TOPLANTILAR:
${meetingsSummary || 'Toplantı verisi sağlanmadı.'}
${companyContext ? `\nAktif firma: ${readField(companyContext, 'name')} (${readField(companyContext, 'sector')})` : ''}`;

  try {
    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.5,
        },
      });
    } catch {
      response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.5,
        },
      });
    }

    const reply = response.text?.trim();
    if (!reply) {
      res.status(502).json({ error: 'Gemini did not return a response.' });
      return;
    }
    res.json({ reply, source: 'gemini-flash' });
  } catch (error) {
    console.error('Gemini API request failed:', error);
    res.status(502).json({ error: 'The AI service is temporarily unavailable.' });
  }
});

app.use((error: unknown, _req: Request, res: express.Response, _next: express.NextFunction) => {
  const status = isRecord(error) && typeof error.status === 'number' ? error.status : 500;
  if (status === 400) {
    res.status(400).json({ error: 'Invalid JSON request body.' });
    return;
  }
  if (status === 413) {
    res.status(413).json({ error: 'Request body is too large.' });
    return;
  }
  console.error('Unhandled server error:', error);
  res.status(500).json({ error: 'Internal server error.' });
});

async function startServer(): Promise<void> {
  const releaseLock = acquireApplicationLock();
  try {
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    const httpServer = app.listen(port, host, () => {
      console.log(`ArelPro CRM Server running at http://${host}:${port}`);
    });
    httpServer.once('close', releaseLock);
    const closeServer = () => httpServer.close();
    process.once('SIGINT', closeServer);
    process.once('SIGTERM', closeServer);
    process.once('exit', releaseLock);
  } catch (error) {
    releaseLock();
    throw error;
  }
}

if (process.env.CRM_SERVER_AUTOSTART !== 'false') {
  startServer().catch(error => {
    console.error('Failed to start ArelPro CRM server:', error);
    process.exitCode = 1;
  });
}
