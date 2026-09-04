# Workforce Intelligence Portal - Complete Setup & Deployment Guide

## 📋 Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Production Deployment](#production-deployment)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Testing & Validation](#testing--validation)
6. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Step 1: Prerequisites
```bash
# Check Node.js version (18+ required)
node --version
npm --version

# Check Docker (optional)
docker --version
docker-compose --version
```

### Step 2: Clone & Install
```bash
git clone <repository-url>
cd workforce-intelligence

# Backend setup
cd backend
npm install
cd ..

# Frontend setup
cd frontend
npm install
cd ..
```

### Step 3: Configure Environment
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit with your settings
nano backend/.env
```

**backend/.env** should contain:
```
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=workforce_intelligence
PORT=5000
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-in-production
ANTHROPIC_API_KEY=sk-ant-xxx
FRONTEND_URL=http://localhost:3000
```

### Step 4: Start Services

**Option A: Using Docker Compose (Recommended)**
```bash
# Set Anthropic API key
export ANTHROPIC_API_KEY="your-key-here"

# Start all services
docker-compose up

# In another terminal, initialize database
docker exec workforce_api npm run migrate
docker exec workforce_api npm run seed
```

**Option B: Manual Start**
```bash
# Terminal 1: Start PostgreSQL (using Docker)
docker run --name workforce_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=workforce_intelligence \
  -p 5432:5432 \
  postgres:15-alpine

# Terminal 2: Initialize database
cd backend
npm run migrate
npm run seed

# Terminal 3: Start backend
npm run dev

# Terminal 4: Start frontend
cd frontend
npm run dev
```

### Step 5: Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: localhost:5432

**Demo Login:**
```
Email: manager@company.com
Password: password123
```

---

## Production Deployment

### Deployment Architecture
```
┌──────────────────────────────────────────────────────┐
│                   Vercel (Frontend)                  │
│         React App + Static Asset Hosting             │
└────────────────────┬─────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼─────────────────────────────────┐
│                 Railway (Backend)                    │
│         Node.js API Server + PostgreSQL              │
└──────────────────────────────────────────────────────┘
```

### Step 1: Prepare Repository

```bash
# Ensure repo structure
workforce-intelligence/
├── backend/
│   ├── src/
│   ├── package.json
│   ├── railway.toml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vercel.json
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── API_DOCS.md
```

### Step 2: Deploy Backend (Railway)

**Via Railway CLI:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
cd backend
railway init

# Set environment variables
railway variables add DB_USER=postgres
railway variables add DB_PASSWORD=$(openssl rand -base64 32)
railway variables add DB_NAME=workforce_intelligence
railway variables add JWT_SECRET=$(openssl rand -base64 32)
railway variables add ANTHROPIC_API_KEY=sk-ant-xxx
railway variables add NODE_ENV=production

# Add PostgreSQL service
railway service add postgres

# Deploy
railway up
railway logs  # Monitor logs
```

**Get your Railway API URL:**
```bash
railway open  # Opens Railway dashboard
# Copy your API URL from deployment settings
# Format: https://your-app.up.railway.app
```

### Step 3: Deploy Frontend (Vercel)

**Via Vercel CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Select project settings when prompted
# Set environment variable:
# VITE_API_URL = https://your-railway-app.up.railway.app/api
```

**Or via GitHub:**
1. Push code to GitHub
2. Go to vercel.com
3. Connect your GitHub repository
4. Configure environment variables
5. Deploy

### Step 4: Configure Database

```bash
# Connect to Railway PostgreSQL
railway connect postgres

# Or via psql
psql \
  -h your-railway-postgres-host \
  -U postgres \
  -d workforce_intelligence

# Run migrations
\i workforce-schema.sql

# Seed data
-- Insert initial data or use Node.js seed script
```

### Step 5: Verify Deployment

```bash
# Test backend health
curl https://your-railway-app.up.railway.app/health

# Test frontend
open https://your-vercel-app.vercel.app

# Check logs
railway logs
vercel logs
```

---

## Database Setup

### Migration Steps

```bash
# 1. Create database
createdb workforce_intelligence

# 2. Connect and run schema
psql -U postgres -d workforce_intelligence < workforce-schema.sql

# 3. Verify tables
psql -U postgres -d workforce_intelligence -c "\dt"

# 4. Seed sample data (optional)
npm run seed
```

### Backup & Restore

```bash
# Backup
pg_dump -U postgres workforce_intelligence > backup.sql

# Restore
psql -U postgres -d workforce_intelligence < backup.sql

# Backup with compression
pg_dump -U postgres -Fc workforce_intelligence > backup.dump
pg_restore -U postgres -d workforce_intelligence backup.dump
```

### Database Maintenance

```bash
# Check database size
SELECT pg_size_pretty(pg_database_size('workforce_intelligence'));

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM employees;

# Vacuum and analyze
VACUUM ANALYZE;
```

---

## Environment Configuration

### Backend Variables

| Variable | Default | Production | Notes |
|----------|---------|-----------|-------|
| DB_USER | postgres | - | Database user |
| DB_PASSWORD | - | - | Secure password |
| DB_HOST | localhost | Railway host | Database server |
| DB_PORT | 5432 | 5432 | Database port |
| DB_NAME | workforce_intelligence | - | Database name |
| PORT | 5000 | - | API port |
| NODE_ENV | development | production | Environment |
| JWT_SECRET | dev-secret | - | **MUST CHANGE** |
| ANTHROPIC_API_KEY | - | - | Claude API key |
| FRONTEND_URL | http://localhost:3000 | - | CORS origin |

### Frontend Variables

| Variable | Default | Notes |
|----------|---------|-------|
| VITE_API_URL | http://localhost:5000/api | Backend API URL |

### Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 16

# Generate API key secret
openssl rand -hex 32
```

---

## Testing & Validation

### API Testing

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@company.com",
    "password": "password123"
  }'

# Test with token
TOKEN="your-jwt-token"
curl http://localhost:5000/api/employees \
  -H "Authorization: Bearer $TOKEN"

# Test dashboard
curl http://localhost:5000/api/dashboard/overview \
  -H "Authorization: Bearer $TOKEN"

# Test Claude intelligence
curl -X POST http://localhost:5000/api/intelligence/team-analysis \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"department": "Engineering"}'
```

### Database Validation

```bash
# Check user count
psql -U postgres -d workforce_intelligence -c "SELECT COUNT(*) FROM users;"

# Verify tables exist
psql -U postgres -d workforce_intelligence -c "\dt"

# Check indexes
psql -U postgres -d workforce_intelligence -c "\di"
```

### Frontend Testing

```bash
# Build test
npm run build

# Visual inspection
npm run preview

# Performance check
lighthouse http://localhost:3000
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -U postgres -h localhost -c "SELECT version();"

# Check if service is running
pg_isready -h localhost -p 5432

# Verify credentials
psql -U postgres -d workforce_intelligence
```

### Backend Won't Start

```bash
# Check if port 5000 is in use
lsof -i :5000
kill -9 <PID>

# Check environment variables
env | grep DB_

# Verify database connection
npm run test:db
```

### Frontend Build Issues

```bash
# Clear build cache
rm -rf dist node_modules package-lock.json

# Reinstall dependencies
npm install

# Try build again
npm run build

# Check for TypeErrors
npm run lint
```

### Claude API Errors

```bash
# Verify API key format
echo $ANTHROPIC_API_KEY

# Test Claude API directly
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

### Performance Issues

```bash
# Check slow queries
psql -U postgres -d workforce_intelligence
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

# Monitor API response times
npm install -g clinic
clinic doctor -- npm run dev

# Profile React component
npm install -g react-devtools
```

### SSL/HTTPS Issues

```bash
# Test SSL certificate
openssl s_client -connect your-domain.com:443

# Renew Let's Encrypt certificate
certbot renew

# Check certificate expiry
curl -vI https://your-domain.com 2>&1 | grep expiry
```

---

## Monitoring & Logging

### Backend Logging

```bash
# View logs
tail -f logs/app.log

# Set log level
LOG_LEVEL=debug npm run dev

# Structured logging (JSON)
npm install -g winston pino
```

### Cloud Monitoring

**Railway:**
```bash
railway logs --follow
railway metrics
```

**Vercel:**
```bash
vercel logs
vercel analytics
```

### Health Checks

```bash
# Monitor dashboard
watch -n 5 'curl http://localhost:5000/health'

# Set up external monitoring
# Use: UptimeRobot, Monitoring.com, DataDog
```

---

## Security Checklist

- [ ] Change JWT_SECRET from default
- [ ] Change DB password from default
- [ ] Enable HTTPS/SSL on production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database encryption
- [ ] Implement request logging
- [ ] Set up backup strategy
- [ ] Configure firewall rules
- [ ] Use environment secrets (not in code)
- [ ] Regular security updates
- [ ] Review audit logs

---

## Performance Optimization

### Database
```sql
-- Create indexes on frequently queried columns
CREATE INDEX idx_employee_department ON employees(department);
CREATE INDEX idx_project_status ON projects(status);
CREATE INDEX idx_utilization_rate ON employee_profiles(utilization_rate);
```

### API
```javascript
// Enable compression
app.use(compression());

// Cache static responses
app.use(express.static('public', { maxAge: '1d' }));
```

### Frontend
```bash
# Production build optimization
npm run build -- --analyze

# Enable gzip in nginx
gzip on;
gzip_types text/plain text/css application/json;
```

---

## Rollback Procedure

```bash
# Railway rollback
railway rollback <commit-hash>

# Vercel rollback
vercel rollback

# Database rollback
pg_restore -d workforce_intelligence backup.dump
```

---

## Support & Resources

- Documentation: See README.md
- API Docs: See API_DOCS.md
- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Email: support@workforce-intelligence.app

**Built with ❤️ using Claude AI**
