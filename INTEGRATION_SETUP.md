# Healthcare System - Frontend & Backend Integration Setup

## What Has Been Configured

I've successfully connected your frontend with the backend by implementing the following:

### 1. **API Client Setup**

- Created a centralized `apiClient.js` using Axios with:
  - Base URL pointing to `http://localhost:5000/api`
  - Automatic token injection for authenticated requests
  - 401 error handling for expired tokens
  - Environment variable support for API URL configuration

### 2. **API Endpoints**

Created dedicated API modules for different features:

- **authApi.js** - Login, Register, Logout, Password Reset
- **patientApi.js** - Patient CRUD operations and records
- **doctorApi.js** - Doctor CRUD and appointment management
- **appointmentApi.js** - Appointment management for both roles
- **adminApi.js** - User and clinic management

### 3. **Authentication Context**

Updated `AuthContext.js` with:

- Real backend API calls for login and registration
- Token management (stored in localStorage)
- Loading and error states
- Support for all user roles (Admin, Doctor, Patient)

### 4. **Updated Components**

- **Login.js** - Now uses backend authentication with role-based navigation
- **Doctor Appointments.js** - Integrated with backend API for real data fetching
- **Helper Functions** - Added utilities for date formatting, validation, and error handling

### 5. **Environment Variables**

Created `.env` file in Frontend folder with:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Prerequisites

### Backend

- Node.js and npm installed
- MySQL database configured
- Backend environment variables set in `Backend/.env`
- All required packages installed: `npm install`

### Frontend

- Node.js and npm installed
- React and dependencies installed: `npm install`

## How to Run

### 1. **Start the Backend Server**

```bash
cd Backend
npm install
npm run dev
# Backend will run on http://localhost:5000
```

### 2. **Start the Frontend**

```bash
cd Frontend
npm install
npm start
# Frontend will run on http://localhost:3000
```

## Testing the Integration

### Test Login Flow

1. Open http://localhost:3000/login
2. Use credentials that match your database users
3. On successful login, you'll be redirected based on user role:
   - Admin → `/admin/dashboard`
   - Doctor → `/doctor/dashboard`
   - Patient → `/patient/dashboard`

### Test Doctor Appointments

1. Login as a doctor
2. Navigate to `/doctor/appointments`
3. Appointments will be fetched from the backend
4. You can update appointment statuses (Complete, Cancel, Reset)

## API Endpoints Available

### Auth Routes (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /password-reset` - Reset password

### Patient Routes (`/api/patients`)

- `GET /` - Get all patients
- `GET /:id` - Get specific patient
- `GET /:id/appointments` - Get patient appointments
- `GET /:id/prescriptions` - Get patient prescriptions
- `POST /` - Create patient
- `PUT /:id` - Update patient
- `DELETE /:id` - Delete patient

### Doctor Routes (`/api/doctors`)

- `GET /` - Get all doctors
- `GET /:id` - Get specific doctor
- `GET /:id/appointments` - Get doctor appointments
- `GET /:id/patients` - Get doctor's patients
- `PUT /appointments/:id` - Update appointment

### Admin Routes (`/api/admin`)

- `GET /users` - Get all users
- `POST /users` - Create user
- `GET /clinics` - Get all clinics
- `POST /clinics` - Create clinic

## Error Handling

The system now handles:

- Network errors
- 401 Unauthorized (automatic logout and redirect to login)
- Validation errors from backend
- Missing or expired tokens
- Connection issues

## Next Steps

To fully integrate all pages:

1. **Update other auth pages** (Register.js, ResetPassword.js) similarly
2. **Integrate patient components** (Dashboard, Appointments, Prescriptions, Health Monitoring)
3. **Integrate doctor components** (PatientRecords, Prescriptions)
4. **Integrate admin components** (ManageUsers, Clinics, Reports)
5. **Add loading states and error boundaries**
6. **Implement proper error notifications** (using react-toastify which is already installed)

## Troubleshooting

### "Cannot connect to backend" error

- Ensure backend is running on port 5000
- Check if CORS is enabled in backend (already configured)
- Verify API_BASE_URL in `.env`

### 401 Unauthorized errors

- Token may be expired - logout and login again
- Check if JWT_SECRET in backend matches tokens being generated

### CORS errors

- Backend already has CORS enabled by default
- If issues persist, check server.js for CORS configuration

### Database connection errors

- Verify DATABASE_URL in Backend/.env
- Ensure MySQL service is running
- Run migrations: `npm run prisma:migrate`

---

## Key Files Modified/Created

**Frontend Files:**

- `src/api/apiClient.js` (NEW)
- `src/api/authApi.js` (NEW)
- `src/api/patientApi.js` (NEW)
- `src/api/doctorApi.js` (NEW)
- `src/api/appointmentApi.js` (NEW)
- `src/api/adminApi.js` (NEW)
- `src/context/AuthContext.js` (MODIFIED)
- `src/pages/Auth/Login.js` (MODIFIED)
- `src/pages/Doctor/Appointments.js` (MODIFIED)
- `src/utils/helpers.js` (MODIFIED)
- `.env` (NEW)

Your frontend and backend are now connected and ready to use!
