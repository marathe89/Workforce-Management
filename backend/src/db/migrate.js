import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import db from './connection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.join(__dirname, '../../../workforce-schema.sql');

/**
 * Apply workforce-schema.sql to the database.
 * Safe to run multiple times: skips if the schema is already applied.
 */
async function migrate() {
  const exists = await db.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_name = 'users'
    ) as exists
  `);

  if (exists.rows[0].exists) {
    console.log('✓ Schema already applied, skipping migration');
    return;
  }

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  await db.query(schema);
  console.log('✓ Schema applied successfully');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✗ Migration failed:', err);
    process.exit(1);
  });
