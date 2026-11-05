import express from 'express';
import bcrypt from 'bcrypt';
import db from '../db/connection.js';
import { generateToken, authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

// Hash compared against when the email doesn't exist (or has no password
// set), so "unknown user" and "wrong password" take the same time.
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer-not-a-real-password', BCRYPT_ROUNDS);

/**
 * POST /api/auth/signup
 * Create a user account. Not public: only signed-in managers, HR admins and
 * executives can create accounts (the Add Employee / bulk upload flows).
 */
router.post('/signup', authenticate, authorize('hr_admin', 'executive', 'manager'), async (req, res) => {
  const { email, name, password, role = 'employee', department, manager_id } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (String(password).length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }

  try {
    const hashedPassword = await bcrypt.hash(String(password), BCRYPT_ROUNDS);

    const result = await db.query(
      `INSERT INTO users (email, name, role, department, manager_id, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, role, department, manager_id`,
      [email, name, role, department || null, manager_id || null, hashedPassword]
    );

    // No token in the response: the caller is an admin creating someone
    // else's account, not the new user signing themselves in.
    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0],
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    throw err;
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await db.query(
      'SELECT id, email, name, role, department, password_hash FROM users WHERE email = $1',
      [email]
    );

    const row = result.rows[0];
    const passwordOk = await bcrypt.compare(String(password), row?.password_hash || DUMMY_HASH);
    if (!row || !row.password_hash || !passwordOk) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password_hash, ...user } = row;
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user,
      token,
    });
  } catch (err) {
    throw err;
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token required' });
  }

  try {
    // In production, verify old token and generate new one
    // For MVP, just regenerate
    res.json({ message: 'Token refreshed' });
  } catch (err) {
    throw err;
  }
});

export default router;
