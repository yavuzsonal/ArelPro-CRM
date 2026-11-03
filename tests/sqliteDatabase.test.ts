import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { after, test } from 'node:test';
import { createDatabaseBackup, restoreDatabaseBackup } from '../src/services/backupService';
import {
  INITIAL_ACTIVITIES,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_COMPANIES,
  INITIAL_MEETINGS,
  INITIAL_SYNC_LOGS,
} from '../src/data/initialData';
import type { Company } from '../src/types';

const temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'arelpro-sqlite-'));
const databasePath = path.join(temporaryDirectory, 'crm.sqlite');
process.env.CRM_DB_PATH = databasePath;

const { crmDatabase, SqliteDatabase } = await import('../src/services/sqliteDatabase');

after(() => {
  crmDatabase.close();
  rmSync(temporaryDirectory, { recursive: true, force: true });
});

test('initial CRM records are seeded once and can be queried from SQLite', () => {
  const data = SqliteDatabase.getAll();
  assert.ok(data.companies.length > 0);
  assert.ok(data.activities.length > 0);
  assert.ok(data.meetings.length > 0);
  assert.ok(data.calendarEvents.length > 0);
  assert.ok(data.companies.some(company => company.id === 'comp-vem-ilac'));

  const sqlCount = crmDatabase.prepare('SELECT COUNT(*) AS count FROM companies').get() as { count: number };
  assert.equal(sqlCount.count, data.companies.length);

  SqliteDatabase.delete('companies', data.companies[0].id);
  assert.equal(SqliteDatabase.getCollection('companies').length, data.companies.length - 1);
  SqliteDatabase.reset();
});

test('record writes are persistent, ordered, and idempotent', () => {
  const record: Company = {
    ...INITIAL_COMPANIES[0],
    id: 'test-company',
    name: 'SQLite test company',
  };

  SqliteDatabase.upsert('companies', record);
  SqliteDatabase.upsert('companies', { ...record, name: 'Updated test company' });

  const companies = SqliteDatabase.getCollection('companies');
  assert.equal(companies[0].id, record.id);
  assert.equal(companies[0].name, 'Updated test company');
  assert.equal(companies.filter(company => company.id === record.id).length, 1);

  const reopenedDatabase = new DatabaseSync(databasePath);
  try {
    const row = reopenedDatabase.prepare('SELECT payload FROM companies WHERE id = ?').get(record.id) as
      | { payload: string }
      | undefined;
    assert.ok(row);
    assert.equal(JSON.parse(row.payload).name, 'Updated test company');
  } finally {
    reopenedDatabase.close();
  }
});

test('legacy browser data is imported at most once', () => {
  const initialCompany = SqliteDatabase.getCollection('companies').find(company => company.id === 'comp-vem-ilac');
  assert.ok(initialCompany);

  const changedCompany = { ...initialCompany, name: 'Migrated VEM record' };
  assert.equal(SqliteDatabase.migrateLegacyData({ companies: [changedCompany] }), true);
  assert.equal(SqliteDatabase.migrateLegacyData({ companies: [initialCompany] }), false);
  assert.equal(
    SqliteDatabase.getCollection('companies').find(company => company.id === initialCompany.id)?.name,
    changedCompany.name,
  );
});

test('reset restores all seed collections after records were deleted', () => {
  const companyCount = SqliteDatabase.getCollection('companies').length;
  const counts = {
    companies: INITIAL_COMPANIES.length,
    activities: INITIAL_ACTIVITIES.length,
    meetings: INITIAL_MEETINGS.length,
    calendarEvents: INITIAL_CALENDAR_EVENTS.length,
    syncLogs: INITIAL_SYNC_LOGS.length,
  };

  SqliteDatabase.delete('companies', 'comp-vem-ilac');
  assert.equal(SqliteDatabase.getCollection('companies').length, companyCount - 1);
  const reset = SqliteDatabase.reset();
  assert.deepEqual(
    Object.fromEntries(Object.entries(reset).map(([key, records]) => [key, records.length])),
    counts,
  );
});

test('database backups preserve a readable snapshot without stopping the live database', async () => {
  const backupPath = await createDatabaseBackup(crmDatabase, path.join(temporaryDirectory, 'backups'));
  assert.ok(existsSync(backupPath));

  const backupDatabase = new DatabaseSync(backupPath, { readOnly: true });
  try {
    const row = backupDatabase.prepare('SELECT COUNT(*) AS count FROM companies').get() as { count: number };
    assert.equal(row.count, INITIAL_COMPANIES.length);
  } finally {
    backupDatabase.close();
  }

  assert.ok(SqliteDatabase.getCollection('companies').length > 0);
});

test('database restore validates backups and preserves the replaced database', async () => {
  const backupPath = await createDatabaseBackup(crmDatabase, path.join(temporaryDirectory, 'backups'));
  const targetPath = path.join(temporaryDirectory, 'restore-target.sqlite');
  const targetDatabase = new DatabaseSync(targetPath);
  targetDatabase.exec(readFileSync(path.join(process.cwd(), 'database', 'schema.sql'), 'utf8'));
  targetDatabase.prepare(
    'INSERT INTO companies (id, payload, position) VALUES (?, ?, ?)',
  ).run('preserved-record', JSON.stringify({ id: 'preserved-record' }), 0);
  targetDatabase.close();

  const lockPath = `${targetPath}.app.lock`;
  writeFileSync(lockPath, 'active');
  await assert.rejects(restoreDatabaseBackup(backupPath, targetPath), /Stop the CRM server/);
  rmSync(lockPath);

  const previousPath = await restoreDatabaseBackup(backupPath, targetPath);
  assert.ok(previousPath);

  const restoredDatabase = new DatabaseSync(targetPath, { readOnly: true });
  const restoredCount = restoredDatabase.prepare('SELECT COUNT(*) AS count FROM companies').get() as
    { count: number };
  restoredDatabase.close();
  assert.equal(restoredCount.count, INITIAL_COMPANIES.length);

  const preservedDatabase = new DatabaseSync(previousPath, { readOnly: true });
  const preservedRecord = preservedDatabase.prepare(
    'SELECT id FROM companies WHERE id = ?',
  ).get('preserved-record');
  preservedDatabase.close();
  assert.ok(preservedRecord);
});
