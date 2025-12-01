# Multi-stage Dockerfile for React client
# Stage 1: Build
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;
  error_page 404 =200 /index.html;
  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
EOF
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/index.html || exit 1
