import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  INITIAL_ACTIVITIES,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_COMPANIES,
  INITIAL_MEETINGS,
  INITIAL_SYNC_LOGS,
} from '../data/initialData';
import { Activity, CalendarEvent, Company, Meeting, SyncLog } from '../types';

export interface CrmData {
  companies: Company[];
  activities: Activity[];
  meetings: Meeting[];
  calendarEvents: CalendarEvent[];
  syncLogs: SyncLog[];
}

export type CrmCollection = keyof CrmData;

const tableNames: Record<CrmCollection, string> = {
  companies: 'companies',
  activities: 'activities',
  meetings: 'meetings',
  calendarEvents: 'calendar_events',
  syncLogs: 'sync_logs',
};

const initialData: CrmData = {
  companies: INITIAL_COMPANIES,
  activities: INITIAL_ACTIVITIES,
  meetings: INITIAL_MEETINGS,
  calendarEvents: INITIAL_CALENDAR_EVENTS,
  syncLogs: INITIAL_SYNC_LOGS,
};

export const databasePath = path.resolve(
  process.env.CRM_DB_PATH || path.join(process.cwd(), 'data', 'arelpro.sqlite'),
);
mkdirSync(path.dirname(databasePath), { recursive: true });

export const crmDatabase = new DatabaseSync(databasePath);
crmDatabase.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;');
crmDatabase.exec(readFileSync(path.join(process.cwd(), 'database', 'schema.sql'), 'utf8'));

function runTransaction(operation: () => void): void {
  crmDatabase.exec('BEGIN IMMEDIATE');
  try {
    operation();
    crmDatabase.exec('COMMIT');
  } catch (error) {
    crmDatabase.exec('ROLLBACK');
    throw error;
  }
}

function upsertRows(collection: CrmCollection, records: Array<{ id?: string }>): void {
  const table = tableNames[collection];
  const statement = crmDatabase.prepare(`
    INSERT INTO ${table} (id, payload, position)
    VALUES (?, ?, COALESCE((SELECT MAX(position) + 1 FROM ${table}), 0))
    ON CONFLICT(id) DO UPDATE SET
      payload = excluded.payload,
      position = excluded.position
  `);

  for (const record of [...records].reverse()) {
    if (typeof record.id !== 'string' || record.id.trim() === '') {
      throw new Error(`Every ${collection} record must have a non-empty id.`);
    }
    statement.run(record.id, JSON.stringify(record));
  }
}

function replaceRows(collection: CrmCollection, records: Array<{ id?: string }>): void {
  const table = tableNames[collection];
  const deleteStatement = crmDatabase.prepare(`DELETE FROM ${table}`);
  const insertStatement = crmDatabase.prepare(
    `INSERT INTO ${table} (id, payload, position) VALUES (?, ?, ?)`,
  );
  deleteStatement.run();

  records.forEach((record, index) => {
    if (typeof record.id !== 'string' || record.id.trim() === '') {
      throw new Error(`Every ${collection} record must have a non-empty id.`);
    }
    insertStatement.run(record.id, JSON.stringify(record), records.length - index);
  });
}

function loadCollection<T>(collection: CrmCollection): T[] {
  const table = tableNames[collection];
  const rows = crmDatabase.prepare(
    `SELECT payload FROM ${table} ORDER BY position DESC, rowid DESC`,
  ).all() as Array<{ payload: string }>;
  return rows.map(row => JSON.parse(row.payload) as T);
}

function seedInitialData(): void {
  const seed = crmDatabase.prepare(
    "SELECT value FROM metadata WHERE key = 'seed_version'",
  ).get();
  if (seed) return;

  runTransaction(() => {
    for (const collection of Object.keys(initialData) as CrmCollection[]) {
      if (initialData[collection].length > 0) {
        replaceRows(collection, initialData[collection] as Array<{ id?: string }>);
      }
    }
    crmDatabase.prepare(
      "INSERT INTO metadata (key, value) VALUES ('seed_version', '1') ON CONFLICT(key) DO NOTHING",
    ).run();
  });
}

seedInitialData();

export const SqliteDatabase = {
  getAll(): CrmData {
    return {
      companies: loadCollection<Company>('companies'),
      activities: loadCollection<Activity>('activities'),
      meetings: loadCollection<Meeting>('meetings'),
      calendarEvents: loadCollection<CalendarEvent>('calendarEvents'),
      syncLogs: loadCollection<SyncLog>('syncLogs'),
    };
  },

  getCollection<T extends CrmCollection>(collection: T): CrmData[T] {
    return loadCollection(collection) as CrmData[T];
  },

  getMetadata(key: string): string | null {
    const row = crmDatabase.prepare('SELECT value FROM metadata WHERE key = ?').get(key) as
      | { value: string }
      | undefined;
    return row?.value ?? null;
  },

  setMetadata(entries: Record<string, string>): void {
    runTransaction(() => {
      const statement = crmDatabase.prepare(
        'INSERT INTO metadata (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      );
      for (const [key, value] of Object.entries(entries)) statement.run(key, value);
    });
  },

  upsert<T extends { id?: string }>(collection: CrmCollection, record: T): void {
    runTransaction(() => upsertRows(collection, [record]));
  },

  replace<T extends { id?: string }>(collection: CrmCollection, records: T[]): void {
    runTransaction(() => replaceRows(collection, records));
  },

  migrateLegacyData(data: Partial<CrmData>): boolean {
    const migrated = crmDatabase.prepare(
      "SELECT value FROM metadata WHERE key = 'legacy_local_storage_migrated'",
    ).get();
    if (migrated) return false;

    runTransaction(() => {
      for (const collection of Object.keys(initialData) as CrmCollection[]) {
        const records = data[collection];
        if (Array.isArray(records) && records.length > 0) {
          upsertRows(collection, records as Array<{ id?: string }>);
        }
      }
      crmDatabase.prepare(
        "INSERT INTO metadata (key, value) VALUES ('legacy_local_storage_migrated', '1')",
      ).run();
    });
    return true;
  },

  delete(collection: CrmCollection, id: string): void {
    const table = tableNames[collection];
    crmDatabase.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
  },

  reset(): CrmData {
    runTransaction(() => {
      for (const collection of Object.keys(initialData) as CrmCollection[]) {
        replaceRows(collection, initialData[collection] as Array<{ id?: string }>);
      }
    });
    return this.getAll();
  },
};
