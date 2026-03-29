#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}Healthcare Azure VM Setup${NC}"
echo -e "${YELLOW}================================${NC}\n"

# Check if running on Ubuntu/Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo -e "${RED}This script should be run on Ubuntu/Linux (your Azure VM)${NC}"
    exit 1
fi

# Update system
echo -e "${YELLOW}[1/7] Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo -e "${YELLOW}[2/7] Installing Docker...${NC}"
sudo apt-get install -y docker.io
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
echo -e "${YELLOW}[3/7] Installing Docker Compose...${NC}"
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
echo -e "${YELLOW}[4/7] Installing Git...${NC}"
sudo apt-get install -y git

# Create deployment directory
echo -e "${YELLOW}[5/7] Creating deployment directory...${NC}"
mkdir -p /home/$USER/healthcare
cd /home/$USER/healthcare

# Clone repository (user should provide GitHub token)
echo -e "${YELLOW}[6/7] Cloning GitHub repository...${NC}"
read -p "Enter your GitHub repository URL (with token for private repos): " REPO_URL
git clone $REPO_URL . || git pull

# Create .env file for Docker
echo -e "${YELLOW}[7/7] Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cp .env.docker .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your production values:${NC}"
    echo -e "  - MYSQL_ROOT_PASSWORD"
    echo -e "  - JWT_SECRET"
    echo -e "  - EMAIL credentials"
    echo -e "  - DATABASE settings"
    echo ""
    read -p "Press Enter after updating .env file..." dummy
fi

# Start containers
echo -e "${YELLOW}Starting Docker containers...${NC}"
docker compose --env-file .env.docker up -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 15

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker compose --env-file .env.docker run --rm prisma-migrate || true

# Check status
echo -e "${GREEN}✓ Setup completed!${NC}\n"
docker compose --env-file .env.docker ps
echo ""
echo -e "${GREEN}Your application is running at:${NC}"
echo -e "  Frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo -e "  Backend: http://$(hostname -I | awk '{print $1}'):5000"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Configure Azure NSG (Network Security Group) to allow ports 80, 443, 3000, 5000"
echo -e "  2. Set up SSL/TLS certificate (Let's Encrypt recommended)"
echo -e "  3. Configure Nginx as reverse proxy for port 80/443"
echo -e "  4. Update DNS records to point to Azure VM IP"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  docker-compose logs -f          # View logs"
echo -e "  docker-compose restart backend  # Restart backend"
echo -e "  docker-compose stop             # Stop all containers"
