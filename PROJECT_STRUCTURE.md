# Project Structure - Workforce Intelligence Portal

## Complete Directory Layout

```
workforce-intelligence/
│
├── 📄 README.md                          # Project overview & quick start
├── 📄 DEPLOYMENT.md                      # Complete deployment guide
├── 📄 DELIVERY_SUMMARY.md                # MVP delivery package summary
├── 📄 API_DOCS.md                        # OpenAPI documentation
├── 📄 PROJECT_STRUCTURE.md               # This file
├── 📄 workforce-schema.sql               # PostgreSQL schema
│
├── 🐳 docker-compose.yml                 # Local development orchestration
│
│
├── 📁 backend/
│   ├── 📄 package.json                   # Dependencies & scripts
│   ├── 📄 .env.example                   # Environment template
│   ├── 📄 Dockerfile                     # Container image
│   ├── 📄 railway.toml                   # Railway deployment config
│   │
│   └── 📁 src/
│       ├── 📄 server.js                  # Express app setup
│       │
│       ├── 📁 db/
│       │   └── 📄 connection.js          # PostgreSQL pool
│       │
│       ├── 📁 middleware/
│       │   ├── 📄 auth.js               # JWT & RBAC
│       │   └── 📄 errorHandler.js       # Error handling
│       │
│       ├── 📁 routes/
│       │   ├── 📄 auth.js               # POST /login, /signup
│       │   ├── 📄 employees.js          # CRUD employees & skills
│       │   ├── 📄 projects.js           # CRUD projects & assignments
│       │   ├── 📄 intelligence.js       # Claude AI endpoints
│       │   └── 📄 dashboard.js          # Analytics & KPIs
│       │
│       └── 📁 services/
│           └── 📄 claudeService.js      # Anthropic API wrapper
│
│
├── 📁 frontend/
│   ├── 📄 package.json                   # React dependencies
│   ├── 📄 vite.config.js                # Vite build config
│   ├── 📄 tailwind.config.js            # Tailwind styling
│   ├── 📄 vercel.json                   # Vercel deployment
│   ├── 📄 Dockerfile                    # Container + nginx
│   ├── 📄 nginx.conf                    # Web server config
│   ├── 📄 index.html                    # HTML entry point
│   │
│   └── 📁 src/
│       ├── 📄 main.jsx                  # React entry point
│       ├── 📄 App.jsx                   # Root component
│       ├── 📄 index.css                 # Tailwind styles
│       │
│       ├── 📁 pages/
│       │   ├── 📄 Login.jsx             # Authentication page
│       │   ├── 📄 Dashboard.jsx         # Executive overview
│       │   ├── 📄 Employees.jsx         # Employee directory
│       │   ├── 📄 Projects.jsx          # Project management
│       │   └── 📄 Intelligence.jsx      # Claude AI insights
│       │
│       ├── 📁 components/
│       │   ├── 📄 Layout.jsx            # Main layout
│       │   ├── 📄 Sidebar.jsx           # Navigation
│       │   ├── 📄 Header.jsx            # User menu
│       │   ├── 📄 KPICard.jsx           # Metric cards
│       │   ├── 📄 ProtectedRoute.jsx   # Auth guard
│       │   └── 📄 LoadingSpinner.jsx   # Loading state
│       │
│       ├── 📁 stores/
│       │   └── 📄 authStore.js          # Zustand state
│       │
│       └── 📁 api/
│           └── 📄 client.js             # Axios client
│
│
└── 📁 .github/ (optional)
    └── 📁 workflows/
        └── 📄 deploy.yml                # CI/CD pipeline
```

## File Descriptions

### Root Level Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview, architecture, features |
| `DEPLOYMENT.md` | Step-by-step production deployment guide |
| `DELIVERY_SUMMARY.md` | MVP package summary & features |
| `API_DOCS.md` | OpenAPI specification for all endpoints |
| `PROJECT_STRUCTURE.md` | This file - directory layout |
| `docker-compose.yml` | Local development with all services |
| `workforce-schema.sql` | Complete PostgreSQL database schema |

### Backend Files (`backend/src/`)

#### `server.js` (70 lines)
- Express app initialization
- Middleware setup (CORS, helmet, morgan)
- Route registration
- Database connection testing
- Server startup

#### `db/connection.js` (25 lines)
- PostgreSQL connection pool
- Pooling configuration (20 max connections)
- Error handling for pool

#### `middleware/auth.js` (60 lines)
- JWT token verification
- Role-based authorization
- Token generation
- Supported roles: employee, manager, hr_admin, executive

#### `middleware/errorHandler.js` (50 lines)
- Centralized error handling
- Database error mapping
- Validation error formatting
- Development error details

#### `routes/auth.js` (70 lines)
- POST `/auth/signup` - Create user account
- POST `/auth/login` - Authenticate user
- POST `/auth/refresh` - Refresh JWT token

#### `routes/employees.js` (140 lines)
- GET `/employees` - List with filtering
- GET `/employees/:id` - Single employee
- POST `/employees` - Create profile
- PUT `/employees/:id` - Update profile
- GET `/employees/:id/skills` - List skills
- POST `/employees/:id/skills` - Add skill

#### `routes/projects.js` (120 lines)
- GET `/projects` - List with filtering
- GET `/projects/:id` - Project details
- POST `/projects` - Create project
- PUT `/projects/:id` - Update project
- POST `/projects/:id/assign` - Allocate resource
- GET `/projects/:id/assignments` - Team assignments

#### `routes/dashboard.js` (160 lines)
- GET `/dashboard/overview` - KPI metrics
- GET `/dashboard/team-performance` - Department metrics
- GET `/dashboard/resource-allocation` - Project staffing
- GET `/dashboard/skill-inventory` - Skills distribution
- GET `/dashboard/performance-distribution` - Rating distribution
- GET `/dashboard/utilization-trend` - Utilization metrics
- GET `/dashboard/at-risk-employees` - Risk list

#### `routes/intelligence.js` (180 lines)
- POST `/intelligence/team-analysis` - Claude team insights
- POST `/intelligence/skill-gaps` - Skill gap analysis
- POST `/intelligence/headcount-forecast` - Hiring forecast
- POST `/intelligence/flight-risk` - Turnover risk assessment
- POST `/intelligence/performance-summary` - Performance review

#### `services/claudeService.js` (200 lines)
- `analyzeTeamPerformance()` - Team metrics analysis
- `identifySkillGaps()` - Training recommendations
- `generateHeadcountForecast()` - Hiring strategy
- `generatePerformanceSummary()` - Performance insights
- `assessFlightRisk()` - Retention risk detection
- Model: claude-opus-4-1
- Token limit: 500-600 per response

### Frontend Files (`frontend/src/`)

#### `main.jsx` (10 lines)
- React 18 entry point
- ReactDOM root setup

#### `App.jsx` (35 lines)
- React Router setup
- Protected routes
- Page transitions

#### `index.css` (20 lines)
- Tailwind directives
- Base styling
- CSS reset

#### `pages/Login.jsx` (80 lines)
- Email/password form
- Error messages
- JWT token storage
- Demo credentials display

#### `pages/Dashboard.jsx` (120 lines)
- KPI cards (employees, utilization, risk, projects)
- Team performance bar chart
- Performance distribution pie chart
- Resource allocation table
- Real-time data fetching

#### `pages/Employees.jsx` (110 lines)
- Employee directory table
- Search and filter
- Selected employee details panel
- Performance ratings
- Utilization progress bars
- Risk indicators

#### `pages/Projects.jsx` (100 lines)
- Project list with cards
- Status filtering
- Project details panel
- Resource tracking
- Headcount requirements

#### `pages/Intelligence.jsx` (200 lines)
- 4 Claude analysis tools
- Input parameter forms
- Claude response display
- Results visualization
- Async processing

#### `components/Layout.jsx` (15 lines)
- Main layout structure
- Sidebar + Header
- Content area

#### `components/Sidebar.jsx` (40 lines)
- Navigation menu
- Active route highlighting
- Logo and branding

#### `components/Header.jsx` (40 lines)
- User name and role
- Logout button
- Page title display

#### `components/KPICard.jsx` (40 lines)
- Reusable metric card
- Color variants
- Trend indicators
- Icon support

#### `components/ProtectedRoute.jsx` (15 lines)
- Route guard
- Redirect to login if no token
- Conditional rendering

#### `components/LoadingSpinner.jsx` (15 lines)
- Animated spinner
- Loading message

#### `stores/authStore.js` (35 lines)
- Zustand state management
- Login/logout actions
- Token persistence
- User hydration

#### `api/client.js` (35 lines)
- Axios instance
- JWT token injection
- 401 error handling
- Base URL configuration

### Database Schema (`workforce-schema.sql`)

#### 9 Core Tables:
1. **users** (5 cols) - User accounts with roles
2. **employee_profiles** (9 cols) - Workforce metrics
3. **skills** (3 cols) - Skill catalog
4. **employee_skills** (5 cols) - Proficiency levels
5. **projects** (8 cols) - Project tracking
6. **project_skill_requirements** (4 cols) - Skill needs
7. **project_assignments** (6 cols) - Resource allocation
8. **performance_reviews** (6 cols) - Review history
9. **headcount_forecasts** (7 cols) - Hiring plans
10. **audit_logs** (6 cols) - Compliance tracking

#### 15 Performance Indexes:
```sql
idx_users_role
idx_users_manager
idx_employee_profiles_user
idx_employee_profiles_status
idx_employee_profiles_risk
idx_employee_skills_user
idx_employee_skills_skill
idx_project_assignments_user
idx_project_assignments_project
idx_performance_reviews_user
idx_audit_logs_user
idx_audit_logs_timestamp
```

### Configuration Files

#### Backend Configuration
- `package.json` - 13 dependencies + scripts
- `.env.example` - 9 environment variables
- `Dockerfile` - Multi-stage container build
- `railway.toml` - Railway deployment config

#### Frontend Configuration
- `package.json` - 12 dependencies
- `vite.config.js` - Build optimization
- `tailwind.config.js` - Style framework
- `vercel.json` - Vercel deployment
- `Dockerfile` - Nginx-based container
- `nginx.conf` - Web server routing

#### Docker Orchestration
- `docker-compose.yml` - 3 services (app, api, db)
- Health checks configured
- Volume persistence
- Network isolation

## Code Statistics

| Component | Files | Lines of Code | Endpoints |
|-----------|-------|----------------|-----------|
| Backend | 11 | ~1,200 | 25+ |
| Frontend | 13 | ~1,600 | 5 pages |
| Database | 1 | ~150 | 9 tables |
| Config | 8 | ~300 | - |
| Docs | 4 | ~2,000 | - |
| **TOTAL** | **37** | **~5,250** | **25+ API** |

## Dependencies Summary

### Backend (13)
- express, cors, helmet, morgan
- pg, dotenv, jsonwebtoken, bcrypt
- joi, anthropic, express-async-errors
- nodemon, jest (dev)

### Frontend (12)
- react, react-dom, react-router-dom
- axios, zustand, recharts
- tailwindcss, vite, postcss
- @vitejs/plugin-react, vitest

### Database
- PostgreSQL 15+

### Containerization
- Docker, Docker Compose

## Deployment Configuration

### Local Development
- `docker-compose.yml` - Full stack
- Port mappings: 5000 (API), 3000 (UI), 5432 (DB)
- Volume mounts for hot reload
- Health checks

### Production - Frontend (Vercel)
- `vercel.json` - Deployment config
- `Dockerfile` - Nginx container
- Build: `npm run build`
- Output: `dist/`

### Production - Backend (Railway)
- `railway.toml` - Configuration
- `Dockerfile` - Node.js container
- Health endpoint: `/health`
- Startup: `npm start`

### Database (Railway PostgreSQL)
- Managed PostgreSQL 15
- Automatic backups
- Connection pooling
- SSL enabled

## Key Features Per File

| Feature | File | Lines |
|---------|------|-------|
| Authentication | routes/auth.js | 70 |
| RBAC | middleware/auth.js | 60 |
| Dashboard | pages/Dashboard.jsx | 120 |
| Claude AI | services/claudeService.js | 200 |
| Employee CRUD | routes/employees.js | 140 |
| Project CRUD | routes/projects.js | 120 |
| Analytics | routes/dashboard.js | 160 |
| Intelligence UI | pages/Intelligence.jsx | 200 |
| API Client | api/client.js | 35 |
| State Mgmt | stores/authStore.js | 35 |
| Database | workforce-schema.sql | 150 |

## Getting Started

1. **Review Files**: Start with README.md
2. **Setup Database**: workforce-schema.sql
3. **Start Backend**: See backend/package.json
4. **Start Frontend**: See frontend/package.json
5. **Deploy**: Follow DEPLOYMENT.md

---

**Total Deliverables: 37 files | 5,250+ lines of production-ready code**
