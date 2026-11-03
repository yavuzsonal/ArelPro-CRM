import { backup, DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { mkdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';

export async function createDatabaseBackup(
  database: DatabaseSync,
  backupDirectory: string,
): Promise<string> {
  await mkdir(backupDirectory, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDirectory, `arelpro-${timestamp}-${randomUUID()}.sqlite`);
  await backup(database, backupPath);
  return backupPath;
}

function assertValidCrmDatabase(database: DatabaseSync): void {
  const integrity = database.prepare('PRAGMA integrity_check').get() as { integrity_check: string };
  if (integrity.integrity_check !== 'ok') {
    throw new Error('The SQLite database failed its integrity check.');
  }
  const tables = database.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all()
    .map(row => (row as { name: string }).name);
  const requiredTables = ['companies', 'activities', 'meetings', 'calendar_events', 'sync_logs', 'metadata'];
  if (!requiredTables.every(table => tables.includes(table))) {
    throw new Error('The selected file is not a complete ArelPro CRM database.');
  }
}

export async function restoreDatabaseBackup(
  backupPath: string,
  databasePath: string,
  applicationLockPath = `${databasePath}.app.lock`,
): Promise<string | null> {
  const sourcePath = path.resolve(backupPath);
  const targetPath = path.resolve(databasePath);
  const resolvedLockPath = path.resolve(applicationLockPath);
  if (sourcePath === targetPath) {
    throw new Error('The backup file and active database path must be different.');
  }
  if (!existsSync(sourcePath)) {
    throw new Error('The selected SQLite backup file does not exist.');
  }
  if (existsSync(resolvedLockPath)) {
    throw new Error('Stop the CRM server before restoring a database backup.');
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  try {
    writeFileSync(resolvedLockPath, `${process.pid}\n`, { flag: 'wx', mode: 0o600 });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'EEXIST') {
      throw new Error('The CRM server or another restore operation is already using this database.');
    }
    throw error;
  }

  const stagingPath = `${targetPath}.restore-${randomUUID()}.sqlite`;
  let source: DatabaseSync | undefined;
  let staged: DatabaseSync | undefined;
  let current: DatabaseSync | undefined;
  let previousPath: string | null = null;
  let movedCurrentDatabase = false;

  try {
    source = new DatabaseSync(sourcePath, { readOnly: true });
    assertValidCrmDatabase(source);
    await backup(source, stagingPath);
    source.close();
    source = undefined;

    staged = new DatabaseSync(stagingPath, { readOnly: true });
    assertValidCrmDatabase(staged);
    staged.close();
    staged = undefined;

    if (existsSync(targetPath)) {
      current = new DatabaseSync(targetPath);
      assertValidCrmDatabase(current);
      const checkpoint = current.prepare('PRAGMA wal_checkpoint(TRUNCATE)').get() as
        | { busy: number }
        | undefined;
      if (checkpoint && checkpoint.busy !== 0) {
        throw new Error('The active SQLite database could not be checkpointed for restore.');
      }
      current.close();
      current = undefined;
      if (existsSync(`${targetPath}-wal`) || existsSync(`${targetPath}-shm`)) {
        throw new Error('SQLite sidecar files remain; verify the CRM server is stopped before restoring.');
      }

      const backupDirectory = path.join(path.dirname(targetPath), 'backups');
      await mkdir(backupDirectory, { recursive: true });
      previousPath = path.join(
        backupDirectory,
        `arelpro-before-restore-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}.sqlite`,
      );
      await rename(targetPath, previousPath);
      movedCurrentDatabase = true;
    }

    await rename(stagingPath, targetPath);
    return previousPath;
  } catch (error) {
    if (movedCurrentDatabase && previousPath && !existsSync(targetPath)) {
      await rename(previousPath, targetPath);
    }
    throw error;
  } finally {
    try {
      source?.close();
      staged?.close();
      current?.close();
      await rm(stagingPath, { force: true });
    } finally {
      try {
        unlinkSync(resolvedLockPath);
      } catch (error) {
        if (!(typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT')) {
          throw error;
        }
      }
    }
  }
}
