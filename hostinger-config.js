export default {
  backend: {
    port: process.env.PORT || 3002,
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || 'production'
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'workforce_intelligence',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
  },
  frontend: {
    // Origins allowed to call this API — update with your real Hostinger domain(s).
    allowedOrigins: [
      'http://localhost:3002',
      'http://your-domain.com:3002',
      'https://your-domain.com'
    ]
  }
};
