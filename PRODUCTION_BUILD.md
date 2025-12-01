# Production Build Guide

This guide walks you through building and deploying Radioblog for production.

## Prerequisites

- Node.js >= 24.0.0
- npm >= 10.0.0
- Docker & Docker Compose (for containerized deployment)
- MongoDB instance (Atlas or self-hosted)
- Environment variables configured (.env file)

---

## Quick Start: Build & Run Locally

### 1. Prepare Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your production values
nano .env
# OR on Windows
notepad .env
```

Required environment variables:
```
NODE_ENV=production
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/radioblog
JWT_SECRET=your-super-secret-key-min-32-chars
FRONTEND_URL=https://yourdomain.com
AUTH_EMAIL=noreply@yourdomain.com
AUTH_PASSWORD=your-app-password
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 2. Install Dependencies

```bash
# Server dependencies
cd server
npm ci --omit=dev
cd ..

# Client dependencies
cd client
npm ci --omit=dev
cd ..
```

### 3. Build Client

```bash
cd client
npm run build
cd ..
```

This creates `client/build/` directory with optimized static files.

### 4. Start Server

```bash
cd server
NODE_ENV=production node index.js
```

Server will:
- Listen on port 8800
- Serve the client build from `../client/build`
- Validate MongoDB connection
- Initialize Sentry (if `SENTRY_DSN` set)

---

## Docker Production Build

### 1. Build Docker Images

```bash
# Build both server and client images
docker-compose build

# Or build individually
docker build -t radioblog-server:latest ./server
docker build -t radioblog-client:latest ./client
```

### 2. Verify Images

```bash
docker images | grep radioblog
```

You should see:
- `radioblog-server:latest`
- `radioblog-client:latest`

### 3. Run Production Stack

```bash
# Start all services (MongoDB, Server, Client)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f server
docker-compose logs -f client
```

Services available at:
- **Client**: http://localhost:3001
- **Server API**: http://localhost:8800/api
- **Health Check**: http://localhost:8800/health
- **Readiness Check**: http://localhost:8800/ready

### 4. Verify Deployment

```bash
# Health check
curl http://localhost:8800/health
# Expected: {"status":"ok","timestamp":"2025-12-01T..."}

# Readiness check
curl http://localhost:8800/ready
# Expected: {"status":"ready","db":"connected","timestamp":"2025-12-01T..."}

# Test API (get posts)
curl http://localhost:8800/api/posts
```

---

## Production Deployment to VPS / Cloud

### Option A: Docker Compose on VPS

```bash
# 1. SSH to your VPS
ssh user@your-vps-ip

# 2. Clone repository
git clone <your-repo-url>
cd radioblog

# 3. Setup environment
cp .env.example .env
nano .env  # Edit with production values

# 4. Build and start
docker-compose build
docker-compose up -d

# 5. Verify health
curl http://localhost:8800/health

# 6. Setup reverse proxy (see nginx section below)
```

### Option B: Kubernetes

Use the Docker images with Kubernetes manifests:

```bash
# Build images and push to registry
docker build -t your-registry/radioblog-server:latest ./server
docker build -t your-registry/radioblog-client:latest ./client
docker push your-registry/radioblog-server:latest
docker push your-registry/radioblog-client:latest

# Apply K8s manifests (provide your own or contact support)
kubectl apply -f k8s/
```

### Option C: Traditional PM2 + Node

```bash
# Install PM2
npm install -g pm2

# Build client
cd client && npm run build && cd ..

# Start server with PM2
pm2 start "NODE_ENV=production node index.js" --name radioblog-server

# Start client (static server)
pm2 start "npx serve -s build -l 3001" --name radioblog-client --cwd ./client

# Monitor
pm2 monit

# Logs
pm2 logs radioblog-server
```

---

## Nginx Reverse Proxy Setup

Create `/etc/nginx/sites-available/radioblog.conf`:

```nginx
upstream server_backend {
    server localhost:8800;
}

upstream client_frontend {
    server localhost:3001;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client (React app)
    location / {
        proxy_pass http://client_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://server_backend/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # Health checks (for monitoring)
    location /health {
        proxy_pass http://server_backend/health;
    }

    location /ready {
        proxy_pass http://server_backend/ready;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/radioblog.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (Certbot handles this by default)
sudo systemctl enable certbot.timer
```

---

## Environment Checklist

Before deploying, ensure you have:

```bash
# Check Node version
node --version  # Should be >= 24.0.0

# Check npm version
npm --version   # Should be >= 10.0.0

# Verify .env file exists and has all required keys
cat .env | grep -E "NODE_ENV|DB_URI|JWT_SECRET|FRONTEND_URL|CORS_ALLOWED_ORIGINS"

# Test MongoDB connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.DB_URI).then(() => console.log('✓ DB Connected')).catch(e => console.log('✗ DB Error:', e.message))"

# Verify client build output
ls -la client/build/

# Check server can start
timeout 5 node server/index.js || echo "Server started successfully"
```

---

## Production Performance Checklist

- [ ] **Rate Limiting**: Enabled in production (global 100/15min, auth 5/15min, likes 100/hour)
- [ ] **CORS**: Restricted to your domain(s) only
- [ ] **Helmet**: Security headers enabled
- [ ] **Compression**: Add `compression` middleware if needed (React build already gzipped)
- [ ] **Database Indexes**: Ensure indexes on `user`, `category`, `createdAt` fields
- [ ] **Caching**: Consider Redis for sessions/tokens (optional)
- [ ] **CDN**: Serve static assets from CDN if available
- [ ] **Monitoring**: Sentry configured (optional but recommended)
- [ ] **Backups**: MongoDB backups scheduled daily
- [ ] **Health Checks**: Load balancer/orchestrator pinging `/health` and `/ready`

---

## Troubleshooting Production Build

### Client Build Fails

```bash
cd client
npm run build 2>&1 | tail -20  # Check last 20 lines of error
```

Common fixes:
- Clear node_modules: `rm -rf node_modules && npm ci`
- Check Node version: `node --version` should be >= 24.0.0
- Increase memory: `NODE_OPTIONS=--max_old_space_size=4096 npm run build`

### Server Won't Connect to DB

```bash
# Test MongoDB connection
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/radioblog"

# Check connection string in .env
echo $DB_URI
```

### Docker Build Fails

```bash
# View build logs
docker-compose build --no-cache 2>&1 | tail -50

# Try building individual images
docker build -t radioblog-server:latest ./server --progress=plain
```

### Port Already in Use

```bash
# Kill process using port 8800
lsof -ti:8800 | xargs kill -9

# OR change port in docker-compose.yml
# ports:
#   - "8801:8800"  # Use 8801 instead
```

---

## Deployment Commands Summary

```bash
# LOCAL PRODUCTION
npm ci --omit=dev  # Both server and client
npm run build      # Client only
NODE_ENV=production node server/index.js

# DOCKER PRODUCTION
docker-compose build
docker-compose up -d
docker-compose logs -f

# VPS DEPLOYMENT
ssh user@vps
cd /var/www/radioblog
git pull
docker-compose build
docker-compose down && docker-compose up -d

# VERIFY
curl http://localhost:8800/health
curl http://localhost:3001
```

---

## Next Steps

1. **Before Launch**:
   - [ ] Test full stack locally with `docker-compose`
   - [ ] Verify health endpoints respond correctly
   - [ ] Load test with `ab` or `k6`
   - [ ] Security scan with OWASP ZAP

2. **Launch**:
   - [ ] Deploy to VPS/cloud
   - [ ] Configure domain DNS
   - [ ] Setup SSL certificate (Let's Encrypt)
   - [ ] Configure Nginx reverse proxy

3. **Post-Launch**:
   - [ ] Monitor error rate (Sentry)
   - [ ] Check server logs daily
   - [ ] Setup automated backups
   - [ ] Configure monitoring/alerts

---

## Support & Monitoring

See `PRODUCTION_DEPLOYMENT.md` and `PRODUCTION_CHECKLIST.md` for additional details.

For questions, check logs:
```bash
docker-compose logs -f server  # Server logs
docker-compose logs -f client  # Client logs
tail -f server/logs/*.log      # File logs (if configured)
```

