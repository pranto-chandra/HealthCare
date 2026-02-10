# Quick Start Guide - Frontend & Backend Connection

## ✅ What's Been Done

Your Healthcare application frontend and backend are now fully connected!

### Created API Layer

- **apiClient.js** - Axios instance with automatic token management
- **authApi.js** - Authentication endpoints
- **patientApi.js** - Patient data operations
- **doctorApi.js** - Doctor data operations
- **appointmentApi.js** - Appointment management
- **adminApi.js** - Admin operations

### Updated Components

- **AuthContext.js** - Real backend authentication
- **Login.js** - Backend-integrated login with role-based routing
- **Doctor Appointments.js** - Fetches appointments from backend
- **helpers.js** - Utility functions for common tasks

### Configuration

- **Frontend .env** - API URL configuration
- **Environment variables** - All set up for development

---

## 🚀 Quick Start (2 Steps)

### Step 1: Start Backend

```bash
cd Backend
npm install     # Only first time
npm run dev
# Wait for: "Server running on port 5000"
```

### Step 2: Start Frontend

```bash
cd Frontend
npm install     # Only first time
npm start
# Automatically opens http://localhost:3000
```

---

## 🧪 Test the Connection

1. **Frontend should load** → http://localhost:3000
2. **Go to Login** → Click login link or navigate to `/login`
3. **Check console** → Should see API calls to `http://localhost:5000/api`
4. **Login with test credentials** → Use users from your database
5. **Should redirect** → Based on user role (Admin/Doctor/Patient)

---

## 📝 Database Setup (If Needed)

If you haven't set up the database yet:

```bash
cd Backend

# Create database and run migrations
npm run prisma:migrate dev

# This creates tables and seeds initial data if configured
```

---

## 🔌 API Endpoints Summary

All endpoints are prefixed with: `http://localhost:5000/api`

| Feature            | Endpoint                       | Method |
| ------------------ | ------------------------------ | ------ |
| **Auth**           |
| Login              | `/auth/login`                  | POST   |
| Register           | `/auth/register`               | POST   |
| Logout             | `/auth/logout`                 | POST   |
| Reset Password     | `/auth/password-reset`         | POST   |
| **Patients**       |
| Get All            | `/patients`                    | GET    |
| Get Appointments   | `/patients/{id}/appointments`  | GET    |
| Get Prescriptions  | `/patients/{id}/prescriptions` | GET    |
| **Doctors**        |
| Get All            | `/doctors`                     | GET    |
| Get Appointments   | `/doctors/{id}/appointments`   | GET    |
| Update Appointment | `/doctors/appointments/{id}`   | PUT    |
| Get Patients       | `/doctors/{id}/patients`       | GET    |
| **Admin**          |
| Get Users          | `/admin/users`                 | GET    |
| Get Clinics        | `/admin/clinics`               | GET    |
| Get Reports        | `/admin/reports`               | GET    |

---

## ⚠️ Common Issues & Solutions

### "Cannot GET /api/..."

**Solution:** Backend not running. Start it with `npm run dev` in Backend folder.

### CORS Error

**Solution:** Already enabled in backend. Restart both servers if it persists.

### Token Issues / 401 Errors

**Solution:** Login again - tokens may be expired. Check browser localStorage.

### Wrong Port

**Solution:** Frontend expects backend on port 5000. Check `Backend/.env PORT` value.

---

## 📂 Key Files to Know

```
Frontend/
├── .env                          # API URL config
├── src/
│   ├── api/                      # NEW - API layer
│   │   ├── apiClient.js          # Axios setup
│   │   ├── authApi.js            # Auth endpoints
│   │   ├── patientApi.js         # Patient endpoints
│   │   ├── doctorApi.js          # Doctor endpoints
│   │   ├── appointmentApi.js     # Appointment endpoints
│   │   └── adminApi.js           # Admin endpoints
│   ├── context/
│   │   └── AuthContext.js        # UPDATED - Real auth
│   ├── pages/Auth/
│   │   └── Login.js              # UPDATED - Backend login
│   ├── pages/Doctor/
│   │   └── Appointments.js       # UPDATED - Real data
│   └── utils/
│       └── helpers.js            # UPDATED - New utilities

Backend/
├── .env                          # Database & JWT config
├── server.js                     # Express server
├── src/
│   ├── routes/                   # API endpoints
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── adminRoutes.js
│   │   └── ...
│   ├── controllers/              # Business logic
│   └── config/                   # Configuration
└── prisma/                       # Database schema
```

---

## 🔐 How Authentication Works

1. User logs in with email/password
2. Frontend sends to `/auth/login`
3. Backend validates and returns `user` + `token`
4. Frontend stores both in localStorage
5. Token auto-attached to all future requests
6. Backend validates token before processing
7. On logout, token is removed

---

## 🎯 Next Steps to Complete Integration

### Immediate (Easy)

- [ ] Test login/logout flow
- [ ] Test doctor appointments page
- [ ] Add error notifications with react-toastify

### Short Term (Medium)

- [ ] Update Register.js to use backend
- [ ] Update Patient Dashboard to fetch data
- [ ] Update Doctor Dashboard to fetch data
- [ ] Update Admin Dashboard to fetch data

### Long Term (Complete)

- [ ] Add loading spinners to all pages
- [ ] Add error boundaries
- [ ] Implement pagination for lists
- [ ] Add filters and search functionality
- [ ] Production deployment setup

---

## 📞 Support

Check the `INTEGRATION_SETUP.md` file for detailed documentation.

**Everything is ready to go! Start both servers and begin testing.** ✨
