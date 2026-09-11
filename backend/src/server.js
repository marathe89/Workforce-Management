import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';
import dotenv from 'dotenv';

import db from './db/connection.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import projectRoutes from './routes/projects.js';
import intelligenceRoutes from './routes/intelligence.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';
import { authenticate, authorize } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      employees: '/api/employees',
      projects: '/api/projects',
      intelligence: '/api/intelligence',
      dashboard: '/api/dashboard',
      users: '/api/users'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', authenticate, employeeRoutes);
app.use('/api/projects', authenticate, projectRoutes);
app.use('/api/intelligence', authenticate, intelligenceRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/users', authenticate, userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const result = await db.query('SELECT NOW()');
    console.log('✓ Database connected:', result.rows[0]);

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('✗ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export default app;
