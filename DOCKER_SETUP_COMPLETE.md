# Healthcare Management System - Docker & Azure Deployment

## ✅ Complete Docker Setup Created

I've created a complete Docker setup for your Healthcare Management System with 3 containers for deployment to Azure. Here's what was created:

---

## 📦 Docker Containers Setup

### 1. **Frontend Container** (React)

- **File:** [Frontend/Dockerfile](Frontend/Dockerfile)
- **Port:** 3000
- **Base Image:** Node.js 20 Alpine (lightweight)
- **Build Strategy:** Multi-stage (compiles React, serves with `serve`)
- **Features:**
  - Optimized production build
  - Health check included
  - Proper signal handling

### 2. **Backend Container** (Node.js/Express)

- **File:** [Backend/Dockerfile](Backend/Dockerfile)
- **Port:** 5000
- **Base Image:** Node.js 20 Alpine
- **Build Strategy:** Multi-stage (compiles dependencies, generates Prisma client)
- **Features:**
  - Prisma client generation
  - Proper environment variable handling
  - Health check included
  - Persistent uploads directory

### 3. **MySQL Container** (Database)

- **File:** [docker-compose.yml](docker-compose.yml)
- **Port:** 3306
- **Image:** mysql:8.0
- **Features:**
  - UTF-8 character set (utf8mb4_unicode_ci)
  - Persistent volume for data
  - Health checks
  - Auto-initialization script

---

## 📋 Files Created

### Docker Configuration

| File                                               | Purpose                                    |
| -------------------------------------------------- | ------------------------------------------ |
| [Backend/Dockerfile](Backend/Dockerfile)           | Build backend container                    |
| [Frontend/Dockerfile](Frontend/Dockerfile)         | Build frontend container                   |
| [docker-compose.yml](docker-compose.yml)           | Orchestrate all 3 containers (development) |
| [docker-compose.prod.yml](docker-compose.prod.yml) | Production-optimized setup                 |
| [Backend/.dockerignore](Backend/.dockerignore)     | Exclude files from backend image           |
| [Frontend/.dockerignore](Frontend/.dockerignore)   | Exclude files from frontend image          |

### Configuration Files

| File                             | Purpose                                   |
| -------------------------------- | ----------------------------------------- |
| [.env.docker](.env.docker)       | Template for Docker environment variables |
| [mysql-init.sql](mysql-init.sql) | MySQL initialization script               |
| [my.cnf](my.cnf)                 | MySQL performance configuration           |
| [nginx.conf](nginx.conf)         | Nginx reverse proxy config (production)   |

### Deployment & Automation

| File                                                                           | Purpose                             |
| ------------------------------------------------------------------------------ | ----------------------------------- |
| [.github/workflows/deploy-to-azure.yml](.github/workflows/deploy-to-azure.yml) | CI/CD pipeline for GitHub Actions   |
| [azure-setup.sh](azure-setup.sh)                                               | Automated setup script for Azure VM |
| [docker-manager.sh](docker-manager.sh)                                         | Local Docker management utility     |

### Documentation

| File                                                   | Purpose                                    |
| ------------------------------------------------------ | ------------------------------------------ |
| [AZURE_DEPLOYMENT_GUIDE.md](AZURE_DEPLOYMENT_GUIDE.md) | **Complete step-by-step deployment guide** |
| [DOCKER_QUICKREF.md](DOCKER_QUICKREF.md)               | Quick reference for common commands        |

---

## 🚀 Quick Start Guide

### Step 1: Test Locally (Windows 11)

```powershell
# Install Docker Desktop (if not already)
winget install Docker.DockerDesktop

# Navigate to project
cd path\to\HealthCare

# Update configuration
cp .env.docker .env
# Edit .env with your values (SMTP credentials, passwords, etc.)

# Start all containers
docker-compose up --build

# Test application
Start-Process http://localhost:3000    # Frontend
Start-Process http://localhost:5000    # Backend
```

### Step 2: Setup Azure VM (Ubuntu)

**Option A: Fast Setup (via script)**

```bash
# Connect to Azure VM
ssh azureuser@YOUR_VM_PUBLIC_IP

# Run automated setup
git clone git@github.com:your-username/HealthCare.git ~/healthcare
cd ~/healthcare
chmod +x azure-setup.sh
./azure-setup.sh
```

**Option B: Manual Setup**

```bash
# Install Docker & Docker Compose
sudo apt-get update && sudo apt-get install -y docker.io git
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone and setup
git clone git@github.com:your-username/HealthCare.git ~/healthcare
cd ~/healthcare
cp .env.docker .env
# Edit .env with production values
docker-compose up -d
```

### Step 3: Configure GitHub Actions (CI/CD)

Add these secrets to GitHub (Settings → Secrets):

- `AZURE_VM_IP`: Your Azure VM public IP
- `AZURE_VM_USERNAME`: `azureuser`
- `AZURE_VM_SSH_KEY`: Your SSH private key (contents of `~/.ssh/id_ed25519`)

Push to `main` branch and GitHub Actions will automatically:

1. Build Docker images
2. Push to GitHub Container Registry
3. SSH into Azure VM
4. Pull and restart containers

---

## 🔧 Configuration Guide

### Environment Variables (.env)

**Copy template:**

```bash
cp .env.docker .env
```

**Essential variables to update:**

```env
# Database
MYSQL_ROOT_PASSWORD=your-strong-password-min-12-chars
MYSQL_PASSWORD=your-user-password-min-12-chars
MYSQL_DATABASE=healthcare_db
MYSQL_USER=healthcare_user

# JWT & Security
JWT_SECRET=generate-32-char-random-string-here-minimum
JWT_EXPIRE=7d

# Email (Gmail example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=get-from-Google-Account-App-Passwords

# URLs
CLIENT_URL=http://your-azure-vm-ip:3000          # During setup
API_URL=http://your-azure-vm-ip:5000
REACT_APP_API_URL=http://your-azure-vm-ip:5000/api

# After SSL setup, change to:
CLIENT_URL=https://your-domain.com
API_URL=https://your-domain.com
REACT_APP_API_URL=https://your-domain.com/api
```

---

## 📊 Docker Network Architecture

```
┌─────────────────────────────────────────────────────┐
│         Healthcare Network (Docker bridge)          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │   Frontend       │  │    Backend       │        │
│  │   Port: 3000     │  │    Port: 5000    │        │
│  │   React + Serve  │  │  Node + Express  │        │
│  └────────┬─────────┘  └────────┬─────────┘        │
│           │                      │                   │
│           └──────────────────────┴──────┬───────────┤
│                                         │            │
│                                  ┌──────▼─────┐    │
│                                  │   MySQL    │    │
│                                  │ Port: 3306 │    │
│                                  │ Database   │    │
│                                  └────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Security Features Implemented

### Docker

- ✅ Multi-stage builds (smaller images)
- ✅ Alpine Linux (minimal attack surface)
- ✅ Non-root user considerations
- ✅ Health checks configured
- ✅ Proper signal handling (dumb-init)

### Database

- ✅ Authentication required
- ✅ UTF-8 encoding
- ✅ Persistent encrypted volumes
- ✅ Health checks

### Network

- ✅ Containers communicate via internal network
- ✅ Only necessary ports exposed
- ✅ NSG rules in Azure for firewall

### Production (Nginx)

- ✅ SSL/TLS termination
- ✅ Security headers configured
- ✅ Rate limiting (Express)
- ✅ Request validation
- ✅ CORS properly configured

---

## 📈 Monitoring & Maintenance

### View Logs

```bash
# All containers
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Database Backup

```bash
# Backup
docker-compose exec mysql mysqldump -u healthcare_user -p healthcare_db > backup.sql

# Restore
docker-compose exec mysql mysql -u healthcare_user -p healthcare_db < backup.sql
```

### Update Application

```bash
cd ~/healthcare
git pull origin main
docker-compose build --no-cache
docker-compose down
docker-compose up -d
docker-compose exec -T backend npm run prisma:migrate -- --skip-generate
```

---

## 🔗 Important Links

| Resource           | Link                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **Detailed Guide** | [AZURE_DEPLOYMENT_GUIDE.md](AZURE_DEPLOYMENT_GUIDE.md)                         |
| **Quick Commands** | [DOCKER_QUICKREF.md](DOCKER_QUICKREF.md)                                       |
| **GitHub Actions** | [.github/workflows/deploy-to-azure.yml](.github/workflows/deploy-to-azure.yml) |
| **Docker Compose** | [docker-compose.yml](docker-compose.yml)                                       |

---

## ⚡ Common Commands Cheat Sheet

```bash
# Build and start
docker-compose up --build

# Start (no rebuild)
docker-compose up -d

# Stop all
docker-compose down

# View status
docker-compose ps

# View logs
docker-compose logs -f

# Execute command in backend
docker-compose exec -T backend npm run prisma:migrate -- --skip-generate

# SSH into container
docker exec -it healthcare-backend bash

# Rebuild specific service
docker-compose build --no-cache backend

# Stop specific service
docker-compose stop backend

# Scale service (advanced)
docker-compose up -d --scale backend=2

# Clean up everything
docker-compose down -v
docker system prune -a
```

---

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Check which process
netstat -tuln | grep :3000
# Kill process and retry
docker-compose up -d
```

### MySQL Connection Fails

```bash
# Check MySQL logs
docker-compose logs mysql

# Verify DATABASE_URL
docker-compose exec backend echo $DATABASE_URL
```

### Prisma Migration Issues

```bash
# Reset database and run from scratch
docker-compose down -v
docker-compose up -d
sleep 20
docker-compose exec -T backend npm run prisma:migrate -- --skip-generate
```

### Container Crashes

```bash
# Check logs
docker-compose logs -f backend

# Rebuild from scratch
docker-compose build --no-cache backend
docker-compose up -d backend
```

---

## 📚 Next Steps

1. **Local Testing**
   - [ ] Copy `.env.docker` to `.env`
   - [ ] Fill in sensitive values
   - [ ] Run `docker-compose up --build`
   - [ ] Test at http://localhost:3000

2. **Azure Setup**
   - [ ] Create Azure VM (Ubuntu 22.04)
   - [ ] Configure SSH access
   - [ ] Add SSH key to GitHub Secrets
   - [ ] Run `azure-setup.sh` on VM

3. **GitHub Actions**
   - [ ] Add required secrets
   - [ ] Push to main/deploy branch
   - [ ] Monitor Actions tab for deployment

4. **Production Hardening**
   - [ ] Set up SSL/TLS (Let's Encrypt)
   - [ ] Configure Nginx reverse proxy
   - [ ] Update DNS records
   - [ ] Configure backup strategy
   - [ ] Set up monitoring

---

## 📞 Support

For detailed instructions, see: [AZURE_DEPLOYMENT_GUIDE.md](AZURE_DEPLOYMENT_GUIDE.md)

For quick command reference, see: [DOCKER_QUICKREF.md](DOCKER_QUICKREF.md)

---

**Created Date:** March 29, 2026  
**Status:** ✅ Ready for Deployment  
**Architecture:** React + Node.js + MySQL + Prisma in Docker  
**Deployment Target:** Microsoft Azure (Ubuntu VM)
