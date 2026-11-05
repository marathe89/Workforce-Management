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
    // Origins allowed to call this API. Hostinger VPS: 189.72.144.75.
    // Override with a comma-separated ALLOWED_ORIGINS env var.
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
      : [
          'http://localhost:3002',
          'https://workforceintelligence.amitmarathe.com',
          'http://189.72.144.75',
          'http://189.72.144.75:3002'
        ]
  }
};
