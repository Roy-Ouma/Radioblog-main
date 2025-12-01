# Production Readiness Checklist

## Security ✅
- [x] **Rate Limiting**: Global (100 req/15min), Auth-specific (5 logins/15min), Like/Comment/Post limits in place
- [x] **Helmet.js**: HTTP headers hardened (XSS, CSRF, Clickjacking protection)
- [x] **CORS**: Restricted to configured origins; development mode allows all for convenience
- [x] **Brute-force Protection**: Failed login tracking with 15-min lockout after 5 attempts
- [x] **Environment Variables**: `.env` never committed; `.env.example` provided; secrets in env only
- [ ] **HTTPS**: Configure SSL/TLS on your domain (use Let's Encrypt/Certbot or cloud provider)
- [ ] **Secrets Management**: Consider external vault (AWS Secrets Manager, HashiCorp Vault)
- [ ] **Input Sanitization**: `express-mongo-sanitize` ready to wire in (add to `index.js` if needed)

## Infrastructure & Deployment ✅
- [x] **Dockerfile** (server & client): Multi-stage builds for optimal image size
- [x] **Docker Compose**: Full stack (MongoDB, server, client) for local staging
- [x] **Health Endpoints**: `/health` (liveness) and `/ready` (readiness) for orchestration
- [x] **Production Deployment Guide**: See `PRODUCTION_DEPLOYMENT.md`
- [ ] **Reverse Proxy**: Configure Nginx or load balancer (example configs available in PRODUCTION_DEPLOYMENT.md)
- [ ] **Persistent Volumes**: MongoDB data backed up and mounted from persistent storage
- [ ] **Monitoring & Logging**: Container logs aggregated to centralized system (ELK, Datadog, etc.)

## Code Quality & CI/CD ✅
- [x] **GitHub Actions CI**: Linting, building, Docker image creation on push
- [x] **Dependabot**: Auto-check for updates weekly; auto-merge patch/minor versions
- [x] **Dependency Audit**: `npm audit` integrated in CI pipeline
- [x] **Version Pinning**: `engines` field set in `package.json`
- [ ] **Unit Tests**: Add Jest/Mocha tests for critical paths (auth, like/unlike, post CRUD)
- [ ] **E2E Tests**: Playwright/Cypress tests for user workflows
- [ ] **Code Coverage**: Aim for 70%+ coverage on critical paths

## Performance
- [x] **Shuffle Posts**: Posts randomized per page
- [x] **Pagination**: Implemented and enforced on all list endpoints
- [ ] **Caching**: Add Redis for session/token caching (optional but recommended)
- [ ] **Database Indexing**: Ensure indexes on frequently queried fields (user, category, createdAt)
- [ ] **CDN**: Serve static assets (images) via CDN if possible
- [ ] **Image Optimization**: Compress uploads and serve WebP where supported

## Database
- [x] **MongoDB Connection**: Validated in `.env` and `dbConfig.js`
- [ ] **Backups**: Automated daily backups to secure storage (S3, GCS)
- [ ] **Replication**: Set up replica sets for high availability (if using MongoDB Atlas, enabled by default)
- [ ] **Migrations**: Plan for data migrations and version control (Migrate-mongo or manual scripts)
- [ ] **Indexes**: Analyze slow queries and add indexes as needed

## Error Handling & Logging
- [x] **Error Middleware**: Centralized error handling in place
- [x] **Sentry Integration**: Optional SDK integrated in server and client
- [ ] **Structured Logging**: Consider Winston/Pino for JSON logs (easier for log aggregation)
- [ ] **Request Logging**: Morgan logs all requests; consider storing to file/DB in production

## Monitoring & Alerts
- [ ] **Uptime Monitoring**: Use Uptime Robot, Pingdom, or cloud provider health checks
- [ ] **Error Rate Alerts**: Alert when error rate exceeds threshold (Sentry, PagerDuty)
- [ ] **Performance Metrics**: Monitor response times, database latency, memory usage
- [ ] **Rate Limit Metrics**: Track how often rate limits are triggered (indicates abuse/load)
- [ ] **Disk Space**: Monitor available disk space (uploads, logs, database)

## Client Build
- [x] **Production Build**: `npm run build` tested and optimized
- [ ] **Minification & Tree-shaking**: React scripts handles by default; verify bundle size
- [ ] **Source Maps**: Generate source maps for error tracking but exclude from production build
- [ ] **Service Worker**: Optional; consider for offline support/caching
- [ ] **Lighthouse Audit**: Run Lighthouse to verify performance, accessibility, SEO

## Deployment Checklist (Before Going Live)
- [ ] Test full stack locally: `docker-compose up -d && curl http://localhost:3001`
- [ ] Create GitHub Secrets: `DOCKER_USERNAME`, `DOCKER_PASSWORD` (if pushing images)
- [ ] Copy `.env.example` to `.env` and fill in production values securely
- [ ] Test health endpoints: `curl http://localhost:8800/health && curl http://localhost:8800/ready`
- [ ] Verify CORS by accessing from your domain (not localhost)
- [ ] Run `npm audit` on both server and client; fix critical vulnerabilities
- [ ] Test rate limiting: Create 6 login attempts in quick succession; expect 429 on 6th
- [ ] Test database backup restore process
- [ ] Load test with Apache Bench or k6 (simulate user load)
- [ ] Security scan with OWASP ZAP or Burp Suite (optional)
- [ ] Document runbook for deployment, rollback, and emergency procedures
- [ ] Brief team on monitoring dashboards and alert escalation

## Post-Launch Monitoring
- [ ] Monitor error rate for first 24h (should be <0.1%)
- [ ] Check for unusual patterns in rate limit hits
- [ ] Verify database performance and slow queries
- [ ] Monitor server resource usage (CPU, memory)
- [ ] Get user feedback and iterate on issues

---

## Quick Deploy Script (Example)

```bash
# 1. SSH to server
ssh user@your-vps

# 2. Clone/update repo
cd /var/www/radioblog
git pull origin main

# 3. Update environment
cp .env.example .env
# Edit .env with production values
nano .env

# 4. Build and start
docker-compose build
docker-compose down
docker-compose up -d

# 5. Verify
curl http://localhost:8800/health
curl http://localhost:3001

# 6. Check logs
docker-compose logs -f
```

---

## Additional Resources
- Docker Best Practices: https://docs.docker.com/develop/dev-best-practices/
- Express Security: https://expressjs.com/en/advanced/best-practice-security.html
- OWASP Top 10: https://owasp.org/Top10/
- Production Deployment: See `PRODUCTION_DEPLOYMENT.md` for detailed instructions

