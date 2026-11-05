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
    console.log('✓ Schema already applied, skipping base schema');
  } else {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    await db.query(schema);
    console.log('✓ Schema applied successfully');
  }

  // Incremental changes for databases created before they were added to
  // workforce-schema.sql. Each must be idempotent.
  await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)');
  console.log('✓ Incremental migrations applied');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✗ Migration failed:', err);
    process.exit(1);
  });
