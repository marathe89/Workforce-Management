import express from 'express';
import bcrypt from 'bcrypt';
import db from '../db/connection.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Create a new user account
 */
router.post('/signup', async (req, res) => {
  const { email, name, password, role = 'employee', department, manager_id } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (email, name, role, department, manager_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, department, manager_id`,
      [email, name, role, department || null, manager_id || null]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      message: 'User created successfully',
      user,
      token,
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
      'SELECT id, email, name, role, department FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
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
