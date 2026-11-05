import bcrypt from 'bcrypt';
import db from './connection.js';

/**
 * Set (or reset) a user's login password.
 *
 *   NEW_PASSWORD='...' npm run set-password -- user@company.com
 *
 * The password is read from the NEW_PASSWORD environment variable rather
 * than a command-line argument so it doesn't land in shell history or `ps`.
 */
async function setPassword() {
  const email = process.argv[2];
  const password = process.env.NEW_PASSWORD;

  if (!email || !password) {
    throw new Error("Usage: NEW_PASSWORD='...' npm run set-password -- <email>");
  }
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const hash = await bcrypt.hash(password, 10);
  const result = await db.query(
    'UPDATE users SET password_hash = $2, updated_at = CURRENT_TIMESTAMP WHERE email = $1 RETURNING id',
    [email, hash]
  );
  if (result.rows.length === 0) {
    throw new Error(`No user with email ${email}`);
  }
  console.log(`✓ Password set for ${email} (id ${result.rows[0].id})`);
}

setPassword()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✗', err.message);
    process.exit(1);
  });
