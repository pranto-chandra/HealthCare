# API Integration Guide - Usage Examples

This guide shows how to use the API modules you've created for future development.

## Basic API Client Usage

### In any React component:

```javascript
import authApi from "../../api/authApi";
import patientApi from "../../api/patientApi";
import doctorApi from "../../api/doctorApi";
import appointmentApi from "../../api/appointmentApi";
import adminApi from "../../api/adminApi";
```

---

## Authentication API Examples

### Login

```javascript
import authApi from "../../api/authApi";

try {
  const response = await authApi.login("user@example.com", "password123");
  const { user, token } = response.data;
  // Token is automatically stored by AuthContext
} catch (error) {
  console.error("Login failed:", error.response.data.message);
}
```

### Register

```javascript
const userData = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "password123",
  role: "Patient",
};

try {
  const response = await authApi.register(userData);
  console.log("Registration successful:", response.data);
} catch (error) {
  console.error("Registration failed:", error.response.data);
}
```

### Logout

```javascript
try {
  await authApi.logout();
  // Clear localStorage happens in AuthContext
} catch (error) {
  console.error("Logout error:", error);
}
```

---

## Patient API Examples

### Get All Patients (Admin)

```javascript
import patientApi from "../../api/patientApi";

useEffect(() => {
  const fetchPatients = async () => {
    try {
      const response = await patientApi.getAllPatients();
      setPatients(response.data);
    } catch (error) {
      setError(error.response.data.message);
    }
  };
  fetchPatients();
}, []);
```

### Get Patient Details

```javascript
const fetchPatient = async (patientId) => {
  try {
    const response = await patientApi.getPatient(patientId);
    setPatient(response.data);
  } catch (error) {
    console.error("Failed to fetch patient:", error);
  }
};
```

### Get Patient Appointments

```javascript
const fetchAppointments = async (patientId) => {
  try {
    const response = await patientApi.getAppointments(patientId);
    setAppointments(response.data);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
  }
};
```

### Get Patient Prescriptions

```javascript
const fetchPrescriptions = async (patientId) => {
  try {
    const response = await patientApi.getPrescriptions(patientId);
    setPrescriptions(response.data);
  } catch (error) {
    console.error("Failed to fetch prescriptions:", error);
  }
};
```

### Create Patient (Admin)

```javascript
const createPatient = async (patientData) => {
  try {
    const response = await patientApi.createPatient(patientData);
    setPatients([...patients, response.data]);
  } catch (error) {
    setError(error.response.data.message);
  }
};
```

### Update Patient

```javascript
const updatePatient = async (patientId, updates) => {
  try {
    const response = await patientApi.updatePatient(patientId, updates);
    setPatients(patients.map((p) => (p.id === patientId ? response.data : p)));
  } catch (error) {
    setError(error.response.data.message);
  }
};
```

---

## Doctor API Examples

### Get All Doctors

```javascript
import doctorApi from "../../api/doctorApi";

const fetchDoctors = async () => {
  try {
    const response = await doctorApi.getAllDoctors();
    setDoctors(response.data);
  } catch (error) {
    console.error("Failed to fetch doctors:", error);
  }
};
```

### Get Doctor's Appointments

```javascript
const fetchDoctorAppointments = async (doctorId) => {
  try {
    const response = await doctorApi.getAppointments(doctorId);
    setAppointments(response.data);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
  }
};
```

### Get Doctor's Patients

```javascript
const fetchDoctorPatients = async (doctorId) => {
  try {
    const response = await doctorApi.getPatients(doctorId);
    setPatients(response.data);
  } catch (error) {
    console.error("Failed to fetch patients:", error);
  }
};
```

### Update Appointment Status

```javascript
const updateAppointmentStatus = async (appointmentId, newStatus) => {
  try {
    const response = await doctorApi.updateAppointmentStatus(
      appointmentId,
      newStatus,
    );
    setAppointments(
      appointments.map((a) => (a.id === appointmentId ? response.data : a)),
    );
  } catch (error) {
    setError(error.response.data.message);
  }
};
```

---

## Appointment API Examples

### Get All Appointments

```javascript
import appointmentApi from "../../api/appointmentApi";

const fetchAppointments = async () => {
  try {
    const response = await appointmentApi.getAllAppointments();
    setAppointments(response.data);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
  }
};
```

### Get Patient's Appointments

```javascript
const fetchPatientAppointments = async (patientId) => {
  try {
    const response = await appointmentApi.getAppointmentsByPatient(patientId);
    setAppointments(response.data);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
  }
};
```

### Get Doctor's Appointments

```javascript
const fetchDoctorAppointments = async (doctorId) => {
  try {
    const response = await appointmentApi.getAppointmentsByDoctor(doctorId);
    setAppointments(response.data);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
  }
};
```

### Create Appointment

```javascript
const createAppointment = async (appointmentData) => {
  try {
    const response = await appointmentApi.createAppointment(appointmentData);
    setAppointments([...appointments, response.data]);
  } catch (error) {
    setError(error.response.data.message);
  }
};
```

### Update Appointment

```javascript
const updateAppointment = async (appointmentId, updates) => {
  try {
    const response = await appointmentApi.updateAppointment(
      appointmentId,
      updates,
    );
    setAppointments(
      appointments.map((a) => (a.id === appointmentId ? response.data : a)),
    );
  } catch (error) {
    setError(error.response.data.message);
  }
};
```

### Delete Appointment

```javascript
const deleteAppointment = async (appointmentId) => {
  try {
    await appointmentApi.deleteAppointment(appointmentId);
    setAppointments(appointments.filter((a) => a.id !== appointmentId));
  } catch (error) {
    setError(error.response.data.message);
  }
};
```

---

## Admin API Examples

### Get All Users

```javascript
import adminApi from "../../api/adminApi";

const fetchUsers = async () => {
  try {
    const response = await adminApi.getAllUsers();
    setUsers(response.data);
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }
};
```

### Create User (Admin)

```javascript
const createUser = async (userData) => {
  try {
    const response = await adminApi.createUser(userData);
    setUsers([...users, response.data]);
  } catch (error) {
    setError(error.response.data.message);
  }
};
```

### Get All Clinics

```javascript
const fetchClinics = async () => {
  try {
    const response = await adminApi.getAllClinics();
    setClinics(response.data);
  } catch (error) {
    console.error("Failed to fetch clinics:", error);
  }
};
```

### Create Clinic

```javascript
const createClinic = async (clinicData) => {
  try {
    const response = await adminApi.createClinic(clinicData);
    setClinics([...clinics, response.data]);
  } catch (error) {
    setError(error.response.data.message);
  }
};
```

### Get Reports

```javascript
const fetchReports = async () => {
  try {
    const response = await adminApi.getReports();
    setReports(response.data);
  } catch (error) {
    console.error("Failed to fetch reports:", error);
  }
};
```

---

## Error Handling Best Practices

### Using the helper function

```javascript
import { getErrorMessage } from "../../utils/helpers";

try {
  const response = await apiCall();
} catch (error) {
  const message = getErrorMessage(error);
  // Shows user-friendly error message
  setError(message);
}
```

### Handling specific status codes

```javascript
try {
  const response = await appointmentApi.createAppointment(data);
} catch (error) {
  if (error.response?.status === 400) {
    setError("Invalid appointment data");
  } else if (error.response?.status === 401) {
    // User is unauthorized - AuthContext will handle redirect
    setError("Please login again");
  } else if (error.response?.status === 404) {
    setError("Appointment not found");
  } else {
    setError("An error occurred. Please try again.");
  }
}
```

---

## Component Template with API

```javascript
import React, { useState, useEffect } from "react";
import appointmentApi from "../../api/appointmentApi";
import { getErrorMessage } from "../../utils/helpers";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await appointmentApi.getAllAppointments();
        setAppointments(response.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      {appointments.map((apt) => (
        <div key={apt.id}>{apt.patientName}</div>
      ))}
    </div>
  );
}
```

---

## Token & Authentication Notes

- **Token is automatically added** to all requests via the apiClient interceptor
- **Token is stored** in localStorage as "token"
- **Token is automatically removed** on logout
- **401 errors** automatically trigger redirect to login
- **No need to manually handle** token management in components

---

## Common Response Formats

### Success Response

```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "Success"
}
```

### Error Response

```json
{
  "message": "Invalid credentials",
  "status": 401
}
```

### List Response

```json
{
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "total": 2
}
```

---

## Tips for Development

1. **Always add loading state** while fetching
2. **Always add error state** for user feedback
3. **Use try-catch** with proper error messages
4. **Use useEffect cleanup** for async operations
5. **Import from correct paths** - use relative imports
6. **Check response structure** - know what data shape to expect
7. **Use helper functions** like `getErrorMessage()` for consistency

Good luck with your integration! 🚀
