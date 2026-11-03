import 'dotenv/config';
import path from 'node:path';
import { restoreDatabaseBackup } from '../src/services/backupService';

const databasePath = path.resolve(
  process.env.CRM_DB_PATH || path.join(process.cwd(), 'data', 'arelpro.sqlite'),
);
const backupPath = process.argv[2];
if (!backupPath) {
  console.error('Usage: npm run db:restore -- <path-to-backup.sqlite>');
  process.exitCode = 1;
} else {
  try {
    const previousPath = await restoreDatabaseBackup(backupPath, databasePath);
    console.log(`SQLite database restored from: ${backupPath}`);
    if (previousPath) console.log(`Previous database preserved at: ${previousPath}`);
  } catch (error) {
    console.error('SQLite restore failed:', error);
    process.exitCode = 1;
  }
}
