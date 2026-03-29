# Backend Dockerfile - Multi-stage build for optimization

# Stage 1: Build stage
FROM node:20-bullseye AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npm run prisma:generate

# Stage 2: Production stage
FROM node:20-bullseye

WORKDIR /app

# Install dumb-init and OpenSSL 1.1 compatibility for Prisma
# libssl1.1 provides libssl.so.1.1 required by Prisma's query engine
RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init libssl1.1 ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Copy application files
COPY . .

# Create uploads directory for lab results
RUN mkdir -p uploads/lab-results

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to properly handle signals (use PATH-resolved binary)
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]
