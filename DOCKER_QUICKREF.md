# Docker & Azure Deployment Quick Reference

## 🚀 Quick Start - Local Testing

```bash
# From project root directory
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

**Access Points:**

- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api
- Database: localhost:3306

---

## 🐋 Docker Commands

### Build

```bash
docker-compose build                 # Build images
docker-compose build --no-cache      # Rebuild without cache
docker-compose build backend         # Build specific service
```

### Run & Stop

```bash
docker-compose up -d                 # Start in background
docker-compose up                    # Start in foreground
docker-compose down                  # Stop and remove containers
docker-compose restart               # Restart containers
docker-compose restart backend       # Restart specific service
```

### Logs & Debugging

```bash
docker-compose logs -f               # View all logs (live)
docker-compose logs -f backend       # View specific service logs
docker-compose logs --tail 100       # Last 100 lines
docker exec -it healthcare-backend bash    # Shell into container
```

### Database

```bash
docker-compose exec -T backend npm run prisma:migrate -- --skip-generate
docker-compose exec -T backend npm run prisma:seed
docker-compose exec -T mysql mysql -u healthcare_user -p healthcare_db
```

### Clean Up

```bash
docker-compose down -v               # Remove containers and volumes
docker system prune -a               # Remove all unused images
docker volume prune                  # Remove unused volumes
```

---

## 🔧 Configuration

### Environment Variables (.env)

**Key variables to change:**

```
MYSQL_ROOT_PASSWORD=YOUR_STRONG_PASSWORD
MYSQL_PASSWORD=YOUR_USER_PASSWORD
JWT_SECRET=YOUR_32_CHAR_RANDOM_STRING
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CLIENT_URL=http://your-domain.com
API_URL=http://your-domain.com/api
```

### Copy from template

```bash
cp .env.docker .env
# Edit .env with your values
```

---

## ☁️ Azure Deployment

### Initial Setup on Azure VM

```bash
# Connect to VM
ssh azureuser@YOUR_VM_IP

# Clone repository
git clone git@github.com:YOUR_USERNAME/HealthCare.git ~/healthcare
cd ~/healthcare

# Run setup script
chmod +x azure-setup.sh
./azure-setup.sh
```

### Manual deployment after setup

```bash
cd ~/healthcare
git pull origin main
docker-compose build --no-cache
docker-compose down
docker-compose up -d
docker-compose exec -T backend npm run prisma:migrate -- --skip-generate
```

---

## 📊 Monitoring

```bash
# Container resource usage
docker stats

# View system usage
docker system df

# Check specific container
docker inspect healthcare-backend
```

---

## 🔐 Security Commands

### Backup Database

```bash
docker-compose exec mysql mysqldump -u healthcare_user -p healthcare_db > backup.sql
```

### View Environment Variables in Container

```bash
docker-compose exec backend env
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
# Wait for MySQL to be ready
sleep 20
docker-compose exec -T backend npm run prisma:migrate -- --skip-generate
```

---

## 🚨 Troubleshooting

### Issue: Can't connect to database

```bash
# Check MySQL status
docker-compose logs mysql

# Verify connection string
docker-compose exec backend echo $DATABASE_URL

# Test connection
docker-compose exec mysql mysql -u healthcare_user -p -h mysql -e "SELECT 1"
```

### Issue: Backend service won't start

```bash
# Check backend logs
docker-compose logs backend

# Run migrations
docker-compose exec -T backend npm run prisma:migrate -- --skip-generate

# Check if port is already in use
netstat -tuln | grep 5000
```

### Issue: Frontend shows blank page

```bash
# Verify API URL
docker-compose exec frontend env | grep REACT_APP

# Check frontend logs
docker-compose logs frontend
```

### Issue: Docker service won't start

```bash
# On Azure VM
sudo systemctl status docker
sudo systemctl restart docker

# Check logs
sudo journalctl -u docker -f
```

---

## 📝 Useful File Locations

**On Azure VM:**

```
~/healthcare/                          # Project root
~/healthcare/.env                      # Configuration
~/healthcare/docker-compose.yml        # Docker setup
~/healthcare/logs/                     # Application logs
~/healthcare/Backend/uploads/          # Uploaded files
/var/log/docker/                       # Docker logs (system)
```

---

## 🔄 CI/CD with GitHub Actions

Status: Push to `main` or `deploy` branch → GitHub Actions triggers → Azure deployment

**Required GitHub Secrets:**

- `AZURE_VM_IP` - Your VM public IP
- `AZURE_VM_USERNAME` - Usually `azureuser`
- `AZURE_VM_SSH_KEY` - Your private SSH key

---

## 📞 Support & Documentation

- [Docker Docs](https://docs.docker.com/)
- [Azure VM Docs](https://learn.microsoft.com/azure/virtual-machines/)
- [Project Guide](./AZURE_DEPLOYMENT_GUIDE.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Last Updated:** March 29, 2026
