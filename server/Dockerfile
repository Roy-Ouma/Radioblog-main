# Multi-stage Dockerfile for Node.js server
# Stage 1: Build dependencies
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runtime
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 8800
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8800/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
CMD ["node", "index.js"]
