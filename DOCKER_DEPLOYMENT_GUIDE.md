# Complete Docker Deployment Guide for Azure VM

## 🚀 Quick Start (One Command)

### Prerequisites
- Docker & Docker Compose installed on Azure VM
- Git cloned: `git clone https://github.com/pranto-chandra/HealthCare.git`
- SSH access to Azure VM

### Deployment Steps

#### Step 1: SSH into Azure VM
```bash
ssh -i C:\Users\HP\Downloads\Baymax_key.pem baymax@103.135.253.215
cd HealthCare
```

#### Step 2: Generate SSL Certificate
The system needs HTTPS with self-signed certificate for secure communication.

**On Linux/Mac:**
```bash
chmod +x generate-ssl.sh
./generate-ssl.sh
```

**On Windows PowerShell:**
```powershell
.\generate-ssl.ps1
```

This creates:
- `ssl/certs/healthcare.crt` - SSL Certificate
- `ssl/certs/healthcare.key` - Private Key

#### Step 3: Start All Services
```bash
docker compose up -d
```

This starts:
- ✅ MySQL Database (Port 3306, internal)
- ✅ Backend API (Port 5000, internal)
- ✅ Frontend (Port 80 internal, served via Nginx)
- ✅ Nginx Reverse Proxy (Port 80 → HTTP, Port 443 → HTTPS, external)

#### Step 4: Verify Services
```bash
# Check container status
docker compose ps

# All should show "Up ... (healthy)"
```

#### Step 5: Access Application

**From any machine on the network:**
```
https://103.135.253.215
```

**Note:** Browser will show SSL warning (this is normal for self-signed certs)
- Click "Advanced" → "Proceed to 103.135.253.215"
- Or add security exception

---

## 🏗️ Architecture

```
User's Browser
     ↓
https://103.135.253.215  (Port 443 - HTTPS)
     ↓
Nginx Container (Reverse Proxy)
├─ Redirect HTTP (80) → HTTPS (443)
├─ /api/* → Backend Container (5000)
├─ /uploads/* → Backend Container (5000)
└─ /* → Frontend Container (80)
     ↓
    ┌─────────────────────────────┐
    │ Backend Container (5000)     │ ← → MySQL (3306)
    │ ├─ Express.js               │       Database
    │ ├─ Authentication           │
    │ ├─ REST API                 │
    │ └─ Business Logic           │
    └─────────────────────────────┘
     ↓ (served by Nginx)
    ┌─────────────────────────────┐
    │ Frontend Container (80)      │
    │ ├─ React App (Built)        │
    │ ├─ Static Assets (JS, CSS)  │
    │ └─ Web Pages                │
    └─────────────────────────────┘
```

---

## 🔐 SSL Certificate Details

- **Type:** Self-Signed (valid for 365 days)
- **Subjects:** healthcare.local, localhost, 103.135.253.215
- **Location:** `ssl/certs/`
- **For Production:** Replace with valid CA certificate

---

## 📝 Environment Configuration

All services use `.env.docker` for configuration:

```env
# Database
MYSQL_USER=healthcare_user
MYSQL_PASSWORD=userpassword123
MYSQL_DATABASE=healthcare_db

# Backend
JWT_SECRET=your-secret-key
EMAIL_USER=          # Leave empty for dev
EMAIL_PASS=          # Leave empty for dev

# URLs (Azure VM IP)
CLIENT_URL=http://103.135.253.215
API_URL=http://103.135.253.215/api
REACT_APP_API_URL=http://103.135.253.215/api
```

**For Production:**
- Change all secrets
- Use valid SSL certificate
- Use proper environment variables (not .env file)
- Enable email configuration

---

## 🔍 Troubleshooting

### Containers not starting
```bash
# Check logs
docker compose logs -f

# Check specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

### Port already in use
```bash
# Find process using port 80 or 443
lsof -i :80
lsof -i :443

# Kill process if needed
kill -9 <PID>
```

### Nginx not proxying correctly
```bash
# Check Nginx config
docker exec healthcare-nginx nginx -t

# Test backend connectivity
docker exec healthcare-nginx curl http://backend:5000/api/health

# Test frontend
docker exec healthcare-nginx curl http://frontend:80
```

### Frontend not loading
```bash
# Check frontend logs
docker compose logs -f frontend

# Verify API URL is correct
curl https://103.135.253.215/api/health
```

---

## 🔄 Common Operations

### Restart services
```bash
docker compose restart
```

### Stop all services
```bash
docker compose down
```

### Remove all data (WARNING - deletes database)
```bash
docker compose down -v
```

### View real-time logs
```bash
docker compose logs -f

# Specific service
docker compose logs -f backend
```

### Update code from GitHub
```bash
git pull origin main
docker compose up -d --build
```

---

## 📊 Default Credentials (Change in Production!)

### Database
- **User:** healthcare_user
- **Password:** userpassword123
- **Database:** healthcare_db

### Application
- Access at: https://103.135.253.215
- Default test account: (check your database seeding)

---

## ✅ Health Checks

Monitor service health:

```bash
# Check all containers
docker compose ps

# Manual health checks
curl https://103.135.253.215/health              # Nginx health
curl https://103.135.253.215/api/health          # Backend health
curl http://localhost:3306                       # MySQL (port check)
```

---

## 🚨 Important Notes

1. **Self-Signed Certificate:** Browser security warning is expected. This is development setup.

2. **.env.docker in Repo:** This file contains credentials for convenience. 
   - **DELETE BEFORE COMMITTING TO PUBLIC REPO**
   - Use proper secrets management for production

3. **Credentials to Change:**
   - `MYSQL_PASSWORD`
   - `JWT_SECRET`
   - Email credentials (when enabled)

4. **Performance:** 
   - First load might take 2-3 seconds (database connection, migrations)
   - Subsequent loads are fast (connection pooling, caching)

---

## 📞 Support

For issues, check:
1. Docker logs: `docker compose logs -f`
2. Ensure ports 80 and 443 are open in firewall
3. Verify Azure VM network security groups allow inbound HTTP/HTTPS
4. Check `.env.docker` configuration
5. Ensure SSL certificates exist in `ssl/certs/`

---

## 🎉 You're All Set!

Visit: **https://103.135.253.215**

System should be:
- ✅ Nginx running on port 80/443
- ✅ Backend API responding to /api/*
- ✅ Frontend serving React app
- ✅ MySQL database connected
- ✅ HTTPS enabled with self-signed cert

Happy coding! 🚀
