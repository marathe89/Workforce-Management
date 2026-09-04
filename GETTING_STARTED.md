# 🚀 Workforce Intelligence Portal - Getting Started

Welcome! This is your complete source code for the Workforce Intelligence Portal.

## 📁 What's Included

```
workforce-intelligence/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── server.js          # Main server file
│   │   ├── db/                # Database files
│   │   ├── middleware/        # Auth & error handling
│   │   ├── routes/            # API endpoints
│   │   └── services/          # Claude AI integration
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment template
│   ├── Dockerfile             # Container image
│   └── railway.toml           # Deployment config
│
├── frontend/                   # React/Vite app
│   ├── src/
│   │   ├── pages/             # 5 main pages
│   │   ├── components/        # 7 UI components
│   │   ├── stores/            # State management
│   │   ├── api/               # API client
│   │   ├── main.jsx           # Entry point
│   │   └── App.jsx            # Root component
│   ├── package.json           # Dependencies
│   ├── vite.config.js         # Build config
│   ├── Dockerfile             # Container image
│   └── index.html             # HTML entry
│
├── docker-compose.yml         # Local development
├── workforce-schema.sql       # Database schema
├── README.md                  # Project overview
├── DEPLOYMENT.md              # Production setup
├── API_DOCS.md                # API reference
└── .gitignore                 # Git configuration
```

## ⚡ Quick Start (5 Minutes)

### 1. Prerequisites
- macOS, Windows, or Linux
- Docker Desktop installed
- Anthropic API key (free at https://console.anthropic.com)

### 2. Setup

```bash
# Clone or extract to your machine
cd workforce-intelligence

# Copy environment template
cp backend/.env.example backend/.env

# Edit .env and add your Anthropic API key
nano backend/.env
# Change: ANTHROPIC_API_KEY=YOUR_KEY_HERE
```

### 3. Run Locally

```bash
# Start all services
docker-compose up

# Wait 2-3 minutes for services to start
# Then open: http://localhost:3000
# Login: manager@company.com / password123
```

## 📚 Key Files

| File | Purpose |
|------|---------|
| `README.md` | Full project documentation |
| `DEPLOYMENT.md` | Production deployment guide |
| `API_DOCS.md` | API endpoint documentation |
| `docker-compose.yml` | Local development setup |
| `workforce-schema.sql` | PostgreSQL database schema |

## 🎯 Next Steps

1. **Read**: `README.md` for full overview
2. **Run**: `docker-compose up` for local testing
3. **Deploy**: Follow `DEPLOYMENT.md` for production

## 🔗 Links

- **Project Docs**: See README.md
- **API Reference**: See API_DOCS.md
- **Deployment**: See DEPLOYMENT.md
- **Setup Guide**: See macOS_SETUP_GUIDE.md (if applicable)

## ✅ What You Have

✅ Complete backend API (25+ endpoints)  
✅ React frontend (5 pages + 7 components)  
✅ PostgreSQL database schema  
✅ Claude AI integration  
✅ Docker containerization  
✅ Production deployment configs  
✅ Comprehensive documentation  

## 🚀 Ready to Go!

Start with `README.md` and run `docker-compose up`!

---

**Built with ❤️ using Claude AI, Node.js, React, and PostgreSQL**
