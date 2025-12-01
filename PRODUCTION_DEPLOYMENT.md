# Radioblog Production Deployment Guide

## Quick Start with Docker Compose

### Prerequisites
- Docker and Docker Compose installed
- Environment variables configured (see `.env.example`)

### Run Staging Environment
```bash
# Copy and customize environment file
cp .env.example .env

# Start all services (MongoDB, Server, Client)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- **Client**: http://localhost:3001
- **Server API**: http://localhost:8800/api
- **Health Check**: http://localhost:8800/health

---

## Environment Variables

### Server (`.env`)
```
NODE_ENV=production
DB_URI=mongodb://admin:password@mongodb:27017/radioblog?authSource=admin
JWT_SECRET=your-super-secret-key-min-32-chars
FRONTEND_URL=https://yourdomain.com
AUTH_EMAIL=noreply@yourdomain.com
AUTH_PASSWORD=your-app-password
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Client (`.env`)
```
REACT_APP_API_URL=https://api.yourdomain.com/api
```

---

## Production Deployment Options

### Option 1: Docker Compose on VPS
```bash
# SSH into your VPS
ssh user@your-vps

# Clone repo and setup
git clone <repo-url>
cd radioblog
cp .env.example .env
# Edit .env with production values
nano .env

# Start services
docker-compose -f docker-compose.yml up -d

# View status
docker-compose ps
docker-compose logs -f server
```

### Option 2: Kubernetes
Use the Dockerfile images and provide K8s manifests with:
- Deployments (server, client)
- Services (LoadBalancer/Ingress)
- ConfigMap/Secrets for env vars
- PersistentVolumeClaim for MongoDB

### Option 3: Traditional Servers (PM2 + Nginx)
```bash
# On server
npm install -g pm2
pm2 start server/index.js --name radioblog-server
pm2 start "npm run start" --name radioblog-client --cwd ./client

# Configure nginx as reverse proxy (see nginx.conf.example)
```

---

## Security Checklist

- [ ] Set `JWT_SECRET` to a strong 32+ char random string
- [ ] Enable HTTPS (SSL/TLS) on your domain
- [ ] Set `CORS_ALLOWED_ORIGINS` to your domain(s) only
- [ ] Use `.env` with secure permissions (600) — never commit secrets
- [ ] Enable rate-limiting (configured in server; limits: 100 likes/hour, 5 login attempts/15min)
- [ ] Monitor logs with Sentry/DataDog (optional — configure SENTRY_DSN)
- [ ] Keep dependencies updated: `npm audit fix` regularly
- [ ] Run `docker-compose` health checks to monitor service status

---

## Health Checks & Monitoring

### Server Health Endpoints
```bash
# Liveness probe (server running)
curl http://localhost:8800/health

# Readiness probe (DB connected, ready for traffic)
curl http://localhost:8800/ready
```

### Docker Compose Health Status
```bash
docker-compose ps  # Shows health status
```

---

## Backup & Restore MongoDB

```bash
# Backup
docker-compose exec mongodb mongodump -u admin -p password123 --out /backup

# Restore
docker-compose exec mongodb mongorestore -u admin -p password123 /backup
```

---

## Updating & Rollback

```bash
# Pull latest code
git pull origin main

# Rebuild images
docker-compose build

# Restart services
docker-compose down && docker-compose up -d

# Rollback (previous container still in history)
docker-compose down
git checkout previous-commit-hash
docker-compose up -d
```

---

## CI/CD Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on every push:
- Lints server & client code
- Builds client production bundle
- Builds Docker images (on main branch)
- Runs npm audit for dependencies

To enable Docker image push to Docker Hub:
1. Create GitHub Secrets: `DOCKER_USERNAME`, `DOCKER_PASSWORD`
2. Images will auto-push on successful build

---

## Troubleshooting

### Services won't start
```bash
docker-compose logs <service-name>  # Check logs
docker-compose ps                   # Check health status
```

### Database connection errors
- Ensure `MONGO_USER` and `MONGO_PASSWORD` match in docker-compose and `.env`
- Wait 10s for MongoDB to initialize on first run

### Client not connecting to API
- Verify `REACT_APP_API_URL` in client `.env`
- Check `CORS_ALLOWED_ORIGINS` on server

### High memory usage
- Limit container memory in docker-compose: `mem_limit: 512m`
- Monitor with: `docker stats`

---

## Support & Monitoring

- **Logs**: `docker-compose logs -f`
- **Metrics**: Add Prometheus scrape or APM (Sentry/New Relic)
- **Alerts**: Configure uptime monitoring (Uptime Robot, PagerDuty)

