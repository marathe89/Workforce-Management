# Workforce Intelligence Portal

A customer-facing, cloud-native intelligence platform for workforce management, resource allocation, and performance tracking. Powered by Claude AI for intelligent insights.

## 🎯 Overview

**Workforce Intelligence Portal** is a comprehensive solution enabling:
- **Resource Allocation**: Smart matching of employee skills to project requirements
- **Performance Tracking**: Real-time analytics on team utilization and output
- **Headcount Planning**: Forecast-driven strategic hiring decisions
- **Skill Management**: Inventory and gap analysis across the organization
- **Flight Risk Detection**: Identify and retain high-value employees

**Role-Based Access Control**:
- **Employees**: View personal profile, skills, assignments, performance
- **Managers**: Manage team, allocate resources, track performance, identify risks
- **HR Admins**: Full headcount planning, forecasting, compensation management
- **Executives**: Strategic dashboards, department-level analytics, forecasting

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (React)                       │
│          (Vercel - Serverless Hosting)                  │
│  Dashboard | Employees | Projects | Intelligence       │
└────────────────────┬────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────┐
│           BACKEND API (Node.js/Express)                 │
│          (Railway - Container Hosting)                  │
│  • Authentication & RBAC                                │
│  • Employee Management                                  │
│  • Project Management                                   │
│  • Claude AI Integration                                │
│  • Dashboard Analytics                                  │
└────────────────────┬────────────────────────────────────┘
                     │ SQL Queries
┌────────────────────▼────────────────────────────────────┐
│            DATABASE (PostgreSQL)                        │
│  • Users & Profiles                                     │
│  • Skills & Proficiencies                               │
│  • Projects & Assignments                               │
│  • Performance Reviews                                  │
│  • Audit Logs                                           │
└─────────────────────────────────────────────────────────┘
```

## 📊 Database Schema

### Core Tables
- **users**: User accounts with role-based access
- **employee_profiles**: Workforce metrics and risk assessment
- **skills**: Skill catalog
- **employee_skills**: Proficiency levels and experience
- **projects**: Project management with resource requirements
- **project_assignments**: Employee-to-project allocations
- **performance_reviews**: Historical performance data
- **headcount_forecasts**: Strategic hiring plans
- **audit_logs**: Compliance and security audit trail

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)
- Anthropic API Key

### Local Development (Docker)

```bash
# Clone repository
git clone <repo-url>
cd workforce-intelligence

# Set environment variables
cp backend/.env.example backend/.env
# Edit .env with your credentials

export ANTHROPIC_API_KEY="your-key-here"

# Start all services
docker-compose up

# Backend runs on http://localhost:5000
# Frontend runs on http://localhost:3000
# Database: localhost:5432
```

### Manual Setup

**Backend**:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with PostgreSQL credentials
npm run migrate  # Initialize database
npm run seed     # Add sample data
npm run dev      # Start server
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev      # Start dev server
```

## 🔑 Demo Credentials

```
Email: manager@company.com
Password: password123
Role: Manager
```

## 📚 API Documentation

### Authentication
```bash
# Login
POST /api/auth/login
{
  "email": "user@company.com",
  "password": "password123"
}

Response:
{
  "user": { "id": 1, "name": "John Doe", "role": "manager" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Dashboard
```bash
GET /api/dashboard/overview
GET /api/dashboard/team-performance
GET /api/dashboard/resource-allocation
GET /api/dashboard/skill-inventory
GET /api/dashboard/performance-distribution
GET /api/dashboard/at-risk-employees
```

### Employees
```bash
GET /api/employees
GET /api/employees/:id
GET /api/employees/:id/skills
POST /api/employees
PUT /api/employees/:id
POST /api/employees/:id/skills
```

### Projects
```bash
GET /api/projects
GET /api/projects/:id
GET /api/projects/:id/assignments
POST /api/projects
PUT /api/projects/:id
POST /api/projects/:id/assign
```

### Intelligence (Claude-Powered)
```bash
POST /api/intelligence/team-analysis
POST /api/intelligence/skill-gaps
POST /api/intelligence/headcount-forecast
POST /api/intelligence/flight-risk
POST /api/intelligence/performance-summary
```

## 🧠 Claude AI Capabilities

The Intelligence module leverages Claude for:

1. **Team Performance Analysis**: Identify bottlenecks, productivity trends, and optimization opportunities
2. **Skill Gap Identification**: Recommend training and development paths
3. **Headcount Forecasting**: Strategic hiring recommendations based on growth trends
4. **Flight Risk Assessment**: Predict turnover risk with retention strategies
5. **Performance Summaries**: Generate actionable insights from performance data

## 📈 Frontend Pages

### Dashboard
Executive overview with:
- KPI cards (total employees, utilization, risk, projects)
- Team performance by department
- Performance distribution pie chart
- Resource allocation table
- Utilization trends

### Employees
- Directory with search/filter
- Detailed employee profiles
- Skill inventory
- Performance ratings
- Risk assessment

### Projects
- Project list with status filtering
- Resource allocation view
- Team member assignments
- Project timeline
- Skill requirements

### Intelligence
Interactive analysis tools:
- Team performance analysis
- Skill gap identification
- Headcount forecasting
- Flight risk assessment
- Claude-generated insights

## 🌐 Deployment

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Set environment variables in Vercel dashboard
VITE_API_URL=https://your-railway-api.up.railway.app/api
```

### Backend (Railway)

1. Connect your GitHub repository to Railway
2. Create a PostgreSQL service
3. Add environment variables:
   ```
   DB_USER=postgres
   DB_PASSWORD=<secure-password>
   DB_HOST=<railway-postgres-host>
   DB_PORT=5432
   DB_NAME=workforce_intelligence
   JWT_SECRET=<secure-jwt-secret>
   ANTHROPIC_API_KEY=<your-anthropic-key>
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
4. Deploy from backend directory

### Database (Railway PostgreSQL)
1. Create PostgreSQL service on Railway
2. Run migrations:
   ```bash
   psql -h <host> -U postgres -d workforce_intelligence < workforce-schema.sql
   ```

## 🔒 Security Features

- **JWT Authentication**: Stateless token-based auth
- **Role-Based Access Control (RBAC)**: Fine-grained permissions
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent abuse
- **SQL Injection Prevention**: Parameterized queries
- **Audit Logging**: Compliance tracking
- **CORS Configuration**: Secure cross-origin requests
- **Environment Secrets**: API keys never in source code

## 📝 API Response Formats

### Success Response
```json
{
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "error": "Descriptive error message",
  "status": 400,
  "details": { ... }
}
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📊 Sample Data

The project includes seed data for testing:
- 20 sample employees
- 5 departments
- 10 projects
- 15 skills
- Sample assignments and reviews

Run: `npm run seed` in backend directory

## 🔄 CI/CD Pipeline

Configure GitHub Actions for:
- Automated tests on pull requests
- Database migration verification
- Build optimization checks
- Deployment to production on merge to main

Example workflow in `.github/workflows/deploy.yml`

## 📞 Support & Troubleshooting

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d workforce_intelligence

# Check environment variables
echo $DB_HOST $DB_USER $DB_NAME
```

### API Not Responding
```bash
# Check backend logs
docker logs workforce_api

# Verify health check
curl http://localhost:5000/health
```

### Frontend Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 🎓 Learning Resources

- [Claude API Documentation](https://docs.anthropic.com)
- [Express.js Guide](https://expressjs.com)
- [React Documentation](https://react.dev)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [REST API Best Practices](https://restfulapi.net)

---

**Built with ❤️ using Claude AI, Node.js, React, and PostgreSQL**
