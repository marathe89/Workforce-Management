import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';
import dotenv from 'dotenv';

import config from '../hostinger-config.js';
import db from './src/db/connection.js';
import authRoutes from './src/routes/auth.js';
import employeeRoutes from './src/routes/employees.js';
import projectRoutes from './src/routes/projects.js';
import intelligenceRoutes from './src/routes/intelligence.js';
import dashboardRoutes from './src/routes/dashboard.js';
import userRoutes from './src/routes/users.js';
import { authenticate } from './src/middleware/auth.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const app = express();

// Configuration
const PORT = process.env.PORT || config.backend.port || 3002;
const HOST = config.backend.host;

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontend.allowedOrigins,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: `running on port ${PORT}`, timestamp: new Date().toISOString() });
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

    app.listen(PORT, HOST, () => {
      console.log(`✅ Server running on http://${HOST}:${PORT}`);
      console.log(`📊 API available at http://${HOST}:${PORT}/api`);
      console.log(`❤️  Health check: http://${HOST}:${PORT}/health`);
    });
  } catch (err) {
    console.error('✗ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export default app;
