# Azure VM Deployment Guide

A comprehensive guide for deploying the Healthcare Management System to Azure Virtual Machine using Docker.

## 📋 Prerequisites

### On Your Windows 11 Local Machine:

- Git installed and configured
- GitHub account with SSH key set up
- Docker Desktop for Windows (optional, for local testing)

### On Azure Ubuntu VM:

- Ubuntu 20.04 LTS or 22.04 LTS
- SSH access configured

---

## 🔧 Step 1: Prepare Your Local Machine

### 1.1 Install Git

```powershell
# If not already installed
winget install Git.Git
```

### 1.2 Configure GitHub SSH Key

```powershell
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to SSH agent
ssh-add $env:USERPROFILE\.ssh\id_ed25519

# Copy public key to clipboard
type $env:USERPROFILE\.ssh\id_ed25519.pub | clip
```

Then add this key to your GitHub account: Settings → SSH and GPG keys → New SSH key

### 1.3 Clone Repository

```powershell
# Clone your repository
git clone git@github.com:your-username/HealthCare.git
cd HealthCare
```

### 1.4 (Optional) Test Docker Locally on Windows 11

```powershell
# Install Docker Desktop (if you want to test locally)
winget install Docker.DockerDesktop

# Navigate to project root
cd path\to\HealthCare

# Build and start containers
docker-compose up --build

# Test endpoints
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

---

## ☁️ Step 2: Azure Virtual Machine Setup

### 2.1 Create Azure Virtual Machine

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new **Virtual Machine**
   - **Resource group**: Create new (e.g., `healthcare-rg`)
   - **VM name**: `healthcare-vm`
   - **Region**: Choose closest to your location
   - **Image**: Ubuntu 22.04 LTS
   - **Size**: Standard_B2s (2 vCPU, 4GB RAM) - minimum recommended
   - **Authentication**: SSH public key (recommended) or Username/Password

3. Configure **Networking**
   - Create new **Virtual Network** or use default
   - Allow HTTP (80), HTTPS (443), SSH (22) in NSG (Network Security Group)
   - Also allow ports 3000 (Frontend) and 5000 (Backend) for initial testing

### 2.2 Get VM Public IP

After VM is created, note the **Public IP address**

```
Example: 20.120.45.67
```

### 2.3 Connect to Your VM from Windows 11

#### Option A: Using PowerShell (Recommended)

```powershell
# Connect via SSH
ssh -i $env:USERPROFILE\.ssh\id_ed25519 azureuser@20.120.45.67

# If using password instead of SSH key
# ssh azureuser@20.120.45.67
```

#### Option B: Using VS Code SSH Extension

1. Install "Remote - SSH" extension in VS Code
2. Click Remote Explorer → Add Host
3. Enter: `ssh -i ~/.ssh/id_ed25519 azureuser@20.120.45.67`
4. Click Connect in New Window

---

## 🐳 Step 3: Setup Docker on Azure VM

### 3.1 Execute Setup Script (Automated)

Once connected to your VM:

```bash
# Download the setup script from your GitHub repo
cd ~
git clone git@github.com:your-username/HealthCare.git healthcare
cd healthcare

# Make setup script executable and run it
chmod +x azure-setup.sh
./azure-setup.sh
```

### 3.2 Manual Setup (If Script Fails)

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
sudo apt-get install -y docker.io
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt-get install -y git

# Create deployment directory
mkdir -p ~/healthcare
cd ~/healthcare

# Clone repository
git clone git@github.com:your-username/HealthCare.git .
```

### 3.3 Configure Environment Variables

```bash
# Copy the Docker environment file
cp .env.docker .env

# Edit with your production values
nano .env
```

**Important variables to update:**

```
MYSQL_ROOT_PASSWORD=strong-password-here
MYSQL_PASSWORD=strong-user-password
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
CLIENT_URL=http://your-vm-public-ip:3000
API_URL=http://your-vm-public-ip:5000
REACT_APP_API_URL=http://your-vm-public-ip:5000/api
```

For **Gmail SMTP**, generate an [App Password](https://myaccount.google.com/apppasswords)

### 3.4 Start Containers

```bash
# Build and start all containers
docker-compose up -d

# Wait for MySQL to be ready (about 15-20 seconds)
sleep 20

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Run database migrations
docker-compose exec -T backend npm run prisma:migrate -- --skip-generate

# Seed database (if seed script exists)
docker-compose exec -T backend npm run prisma:seed || true
```

---

## 🔗 Step 4: Configure Azure Networking

### 4.1 Update Network Security Group (NSG)

1. Go to **Azure Portal** → Virtual Machines → Your VM
2. Click **Networking** in the left sidebar
3. Add **Inbound rules**:
   - HTTP (80) ← from Internet
   - HTTPS (443) ← from Internet
   - Custom TCP (3000) ← from Internet (for testing only)
   - Custom TCP (5000) ← from Internet (for testing only, remove in production)

### 4.2 Test Access

Access your application:

```
Frontend: http://20.120.45.67:3000
Backend: http://20.120.45.67:5000/api
```

---

## 🔒 Step 5: SSL/TLS Setup (Production)

### 5.1 Install Nginx

```bash
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5.2 Install Certbot for Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate (replace with your domain)
sudo certbot certonly --standalone -d your-domain.com
```

### 5.3 Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/healthcare`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/healthcare /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

---

## 🚀 Step 6: GitHub Actions CI/CD Setup

### 6.1 Add SSH Key to GitHub Secrets

```powershell
# On your Windows machine, copy private SSH key
type $env:USERPROFILE\.ssh\id_ed25519 | clip
```

1. Go to **GitHub** → Repository → Settings → Secrets and variables → Actions
2. Add new secret:
   - Name: `AZURE_VM_SSH_KEY`
   - Value: Paste your SSH private key

### 6.2 Add Other Required Secrets

Add these secrets to GitHub:

- `AZURE_VM_IP`: Your VM public IP
- `AZURE_VM_USERNAME`: `azureuser`
- `GITHUB_TOKEN`: Auto-generated (already available)

### 6.3 Trigger Deployment

Push to `main` or `deploy` branch:

```bash
git add .
git commit -m "feat: add Docker setup for Azure deployment"
git push origin main
```

The GitHub Actions workflow will automatically:

1. Build Docker images
2. Push to GitHub Container Registry
3. SSH into Azure VM
4. Pull latest images and restart containers

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Database Backup

```bash
# Backup MySQL database
docker-compose exec -T mysql mysqldump -u healthcare_user -p healthcare_db > backup.sql

# Restore from backup
docker-compose exec -T mysql mysql -u healthcare_user -p healthcare_db < backup.sql
```

### Update Application

```bash
cd ~/healthcare

# Pull latest code
git pull origin main

# Rebuild containers
docker-compose build --no-cache

# Restart services
docker-compose down
docker-compose up -d

# Run migrations
docker-compose exec -T backend npm run prisma:migrate -- --skip-generate
```

### Monitor Container Resources

```bash
# View resource usage
docker stats

# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

---

## ⚠️ Troubleshooting

### MySQL Connection Fails

```bash
# Check MySQL container
docker-compose logs mysql

# Verify DATABASE_URL format
docker-compose exec -T backend echo $DATABASE_URL
```

### Backend Shows 502 Gateway Error

```bash
# Check backend logs
docker-compose logs backend

# Verify Prisma migrations ran
docker-compose exec -T backend npm run prisma:migrate -- --skip-generate
```

### Frontend Shows Blank Page

```bash
# Check REACT_APP_API_URL
docker-compose exec frontend env | grep REACT_APP
```

### Rebuild All Containers

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## 🔐 Security Best Practices

1. **Change Default Passwords**: Update all MySQL passwords in `.env`
2. **Use Strong JWT Secret**: Generate a random 32+ character string
3. **Enable SSL/HTTPS**: Use Let's Encrypt certificates
4. **Restrict SSH Access**: Use SSH keys instead of passwords
5. **Regular Backups**: Backup database regularly to Azure Storage
6. **Update System**: Keep Ubuntu and Docker updated
7. **Monitor Logs**: Set up Azure Monitor for alerts
8. **API Rate Limiting**: Already configured in backend

---

## 📞 Support Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Azure VM Documentation](https://learn.microsoft.com/en-us/azure/virtual-machines/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

## ✅ Deployment Checklist

- [ ] Azure VM created and SSH access configured
- [ ] GitHub SSH key added to GitHub account
- [ ] Docker and Docker Compose installed on VM
- [ ] Repository cloned to VM
- [ ] `.env` file configured with production values
- [ ] Containers built and running
- [ ] Database migrations completed
- [ ] Application accessible on public IP
- [ ] NSG rules configured for required ports
- [ ] GitHub Secrets configured for CI/CD
- [ ] SSL/HTTPS certificate installed (production)
- [ ] Nginx reverse proxy configured (production)
- [ ] Database backup strategy implemented
- [ ] Monitoring and logging set up

---

**Congratulations! Your application is now deployed to Azure! 🎉**
