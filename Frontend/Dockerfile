# Frontend Dockerfile - Multi-stage build with Nginx serving

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Build arguments
ARG REACT_APP_API_URL=http://localhost:5000/api

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY . .

# Build the React app with API URL from build args
RUN REACT_APP_API_URL=${REACT_APP_API_URL} npm run build

# Stage 2: Production stage - Serve with Nginx
FROM nginx:alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config for React SPA
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 3000;
    server_name _;

    root /usr/share/nginx/html;
    index index.html index.htm;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/javascript application/json;
    gzip_vary on;

    # SPA routing: try to serve file, if not found serve index.html
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }

    # Static assets caching (1 year for versioned files)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Copy built application from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
