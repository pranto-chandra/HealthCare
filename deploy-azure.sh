#!/bin/bash

# Healthcare Management System - Docker Deployment Script
# For Azure VM Deployment
# IP: 135.235.137.34

set -e  # Exit on error

AZURE_IP="135.235.137.34"
PROJECT_NAME="Healthcare"

echo "=========================================="
echo "Healthcare System Docker Deployment"
echo "=========================================="
echo "Azure VM IP: $AZURE_IP"
echo ""

# STEP 1: Navigate to project
echo "[STEP 1] Navigating to project..."
if [ ! -d "$PROJECT_NAME" ]; then
    echo "ERROR: $PROJECT_NAME directory not found!"
    echo "Make sure you cloned the repo."
    exit 1
fi
cd "$PROJECT_NAME"
echo "✓ Project directory found"
echo ""

# STEP 2: Update .env.docker with Azure IP
echo "[STEP 2] Updating configuration with Azure IP..."
cat > .env.docker << EOF
# MySQL Configuration
MYSQL_ROOT_PASSWORD=rootpassword123
MYSQL_DATABASE=healthcare_db
MYSQL_USER=healthcare_user
MYSQL_PASSWORD=userpassword123
MYSQL_PORT=3306

# Backend Configuration
BACKEND_PORT=5000
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=7d

# Email Configuration
EMAIL_USER=9ihateyou9@gmail.com
EMAIL_PASSWORD=givn_yspg_hpru_toxu

# Azure VM IP Configuration
CLIENT_URL=http://$AZURE_IP
API_URL=http://$AZURE_IP/api
REACT_APP_API_URL=http://$AZURE_IP/api

# Frontend
FRONTEND_PORT=3000

# Database Connection String
DATABASE_URL=mysql://healthcare_user:userpassword123@mysql:3306/healthcare_db
EOF
echo "✓ Configuration updated with IP: $AZURE_IP"
echo ""

# STEP 3: Build Docker containers
echo "[STEP 3] Building Docker containers..."
echo "This may take 5-10 minutes..."
echo ""
docker-compose build
echo ""
echo "✓ Docker containers built successfully"
echo ""

# STEP 4: Start all services
echo "[STEP 4] Starting all services..."
docker-compose --env-file .env.docker up -d
echo ""
echo "Waiting for services to start (30 seconds)..."
sleep 30
echo ""

# STEP 5: Verify services
echo "[STEP 5] Verifying all services..."
echo ""
echo "Running containers:"
docker ps
echo ""

# Check health endpoints
echo "Checking health endpoints..."
echo ""

echo "Testing Backend API..."
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✓ Backend is running"
else
    echo "✗ Backend health check failed"
fi

echo "Testing Frontend..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✓ Frontend is running"
else
    echo "✗ Frontend health check failed"
fi

echo ""
echo "=========================================="
echo "✓ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Application URL: http://$AZURE_IP"
echo ""
echo "Access your application at:"
echo "  http://135.235.137.34"
echo ""
echo "Check logs:"
echo "  docker-compose logs -f"
echo ""
echo "View specific service logs:"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f mysql"
echo "  docker-compose logs -f frontend"
echo ""
echo "Stop all services:"
echo "  docker-compose down"
echo ""
echo "=========================================="
