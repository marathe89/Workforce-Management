import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool, types } = pkg;

// pg returns NUMERIC/DECIMAL columns (OID 1700) as strings by default, to
// avoid silent precision loss. This app treats them as plain JS numbers
// everywhere (e.g. Dashboard.jsx calls .toFixed() on aggregate values), so
// parse them as floats here once instead of casting in every query/route.
types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'workforce_intelligence',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
  process.exit(-1);
});

export default pool;
