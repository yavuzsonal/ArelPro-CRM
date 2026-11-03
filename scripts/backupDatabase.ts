import 'dotenv/config';
import path from 'node:path';
import { crmDatabase, databasePath } from '../src/services/sqliteDatabase';
import { createDatabaseBackup } from '../src/services/backupService';

const backupDirectory = path.resolve(
  process.env.CRM_BACKUP_DIR || path.join(path.dirname(databasePath), 'backups'),
);

try {
  const backupPath = await createDatabaseBackup(crmDatabase, backupDirectory);
  console.log(`SQLite backup created: ${backupPath}`);
} catch (error) {
  console.error('SQLite backup failed:', error);
  process.exitCode = 1;
} finally {
  crmDatabase.close();
}
