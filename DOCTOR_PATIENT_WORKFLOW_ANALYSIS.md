# Doctor-Patient Information Sharing Workflow Analysis

## Executive Summary

The healthcare system has a **functional but partially incomplete** doctor-patient information sharing workflow. Doctors can access patients through appointments, but **email-based patient search is NOT implemented**. Prescription management is partially implemented with frontend UI but needs backend-to-frontend data binding. Lab tests are fully functional with real-time updates.

---

## 1. Doctor Accessing Patient Information

### 1.1 Current Implementation: Appointment-Based Access Only ✅

**How Doctors Access Patients:**

- Doctors can **ONLY** view patients they have existing appointments with
- No direct email/ID search functionality exists

**Backend Flow:**

```
GET /doctors/me/patients -> getMyPatients()
  ↓
Uses JWT token to get logged-in doctor's profile
  ↓
Queries all appointments for this doctor (distinct patientId)
  ↓
Returns list of associated patients with their email
```

**Key Functions:**

- [doctorController.js](Backend/src/controllers/doctorController.js) → `getMyPatients()` (line 861)
  - Gets doctor profile from JWT token
  - Finds all unique patients from appointments
  - Returns patient profiles with email

### 1.2 Patient Information Accessible ✅

**What Information Doctors Can View:**

1. **From `getPatientRecord()` endpoint** [doctorController.js](Backend/src/controllers/doctorController.js) (line 297):
   - Patient Profile: name, phone, dateOfBirth, gender, bloodGroup
   - Appointments scheduled with this doctor
   - Prescriptions linked to those appointments
   - Medical History (filtered by doctor)
   - Health Records (last 10 records)
   - Lab Tests (filtered by doctor)

2. **Related Data:**

   ```
   PatientProfile → includes:
   ├── User (email)
   ├── Appointments (for this doctor)
   │   └── Prescription
   │       └── MedicationTracking[]
   ├── MedicalHistory (for this doctor)
   ├── HealthMonitoring
   └── LabTests (recommended by this doctor)
   ```

3. **API Endpoint Structure:**
   ```
   GET /doctors/:id/records/:patient_id
   Returns: {
     id, name, phone, dateOfBirth, gender, bloodGroup,
     user: { email },
     appointments: [],
     medicalHistory: [],
     healthRecords: [],
     labTests: []
   }
   ```

### 1.3 Frontend: PatientRecords Component Status ⚠️ INCOMPLETE

**File:** [Frontend/src/pages/Doctor/PatientRecords.js](Frontend/src/pages/Doctor/PatientRecords.js)

**Current State:**

- Uses **HARDCODED mock data** - NOT fetching from backend
- Sample patient: "John Doe" with ID "patient-123"
- No API calls to retrieve actual patient data
- No search functionality

**What's Missing:**

- No integration with `doctorApi.getPatientRecord()`
- No patient selection/search component
- No real appointment data binding

**Code Example (Current):**

```javascript
const [patient, setPatient] = useState({
  id: "patient-123", // HARDCODED
  name: "John Doe", // HARDCODED
  history: ["Type 2 Diabetes", "Hypertension"],
  prescriptions: ["Metformin 850mg - daily"],
});
```

---

## 2. Email-Based Patient Search - NOT IMPLEMENTED ❌

### 2.1 Backend Status

No endpoint exists for doctors to search patients by email/ID.

**Available Doctor Search Functions:**

- `searchDoctors()` - Search for OTHER doctors (not patients)
- `getDoctorPatients()` - Get existing patients from appointments only
- No `searchPatients()` or `getPatientByEmail()` function

### 2.2 What's Missing

1. **Backend Endpoint Needed:**

   ```
   GET /doctors/me/patients/search?email=patient@example.com
   or
   GET /doctors/me/patients/search?id=patient-uuid
   ```

2. **Backend Logic Needed:**

   ```
   Find patient by email → Check if doctor-patient relationship exists
   If NO relationship → Deny access (privacy)
   If YES relationship → Return patient record
   ```

3. **Frontend Search UI:**
   - Search input field
   - Search button
   - Results display

### 2.3 Security Consideration

**Design Decision:** Email-based patient search likely intentionally NOT implemented because:

- Privacy concerns: Doctors shouldn't access arbitrary patients
- Doctors access only patients they have treated (appointment-based)
- Direct email search could violate HIPAA/privacy regulations

**Recommended Implementation IF Needed:**

- Require appointment or referral first
- Log all patient record access
- Implement role-based access control

---

## 3. Prescription Management Workflow

### 3.1 Complete Flow Diagram

```
DOCTOR SIDE:
┌─────────────────────────────────┐
│ Doctor Dashboard                │ → Shows test stats, no prescriptions displayed
└───────────┬─────────────────────┘
            │
            ↓
┌─────────────────────────────────┐
│ Doctor/Prescriptions.js         │ ⚠️ MOCK DATA ONLY - NOT CONNECTED
│ - Has form to add prescription  │
│ - No backend integration        │
└─────────────────────────────────┘
            │
            ↓
        SHOULD CALL
    doctorApi.createPrescription()
            │
            ↓
POST /doctors/:id/prescriptions
      (doctorController.js)
            │
            ↓
    createPrescription()
      - Takes appointmentId, diagnosis, description, medications
      - Creates Prescription record
      - Creates MedicationTracking for each medication
      - Returns prescription with medications
            │
            ├─────────────────────────────→ DATABASE
            │                                  ├── Prescription
            │                                  └── MedicationTracking[]
            │
            └─────────────────────────────→ SHOULD NOTIFY PATIENT
                                           (NOT IMPLEMENTED)

PATIENT SIDE:
┌─────────────────────────────────┐
│ Patient/Prescriptions.js        │
├─────────────────────────────────┤
│ Tabs:                           │
│ • Medications (HARDCODED)       │ ⚠️ Using mock data
│ • Lab Tests (WORKING)           │ ✅ Fetches via labApi
└─────────────────────────────────┘
            │
            ↓
        SHOULD CALL
patientApi.getPatientPrescriptions()
            │
            ↓
    (ENDPOINT MISSING - NOT IMPLEMENTED)
    No endpoint to get patient's prescriptions
```

### 3.2 Create Prescription - Backend Implementation ✅

**Endpoint:** `POST /doctors/:id/prescriptions`

**Backend Controller:** [doctorController.js](Backend/src/controllers/doctorController.js) - `createPrescription()` (line 50)

**Request Payload:**

```json
{
  "appointmentId": "uuid",
  "patientId": "uuid",
  "diagnosis": "Type 2 Diabetes",
  "description": "Patient needs glucose monitoring",
  "medications": [
    {
      "medicationName": "Metformin",
      "dosage": "850mg",
      "frequency": "Once daily",
      "duration": "30 days"
    }
  ]
}
```

**Database Schema:**

```
Prescription
├── id
├── appointmentId (UNIQUE - one prescription per appointment)
├── patientId
├── doctorId
├── prescriptionDate
├── diagnosis
├── description
└── MedicationTracking[]
    ├── medicationName
    ├── dosage
    ├── frequency
    └── duration
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "appointmentId": "uuid",
    "patientId": "uuid",
    "doctorId": "uuid",
    "diagnosis": "Type 2 Diabetes",
    "prescriptionDate": "2026-03-22",
    "medications": [
      {
        "id": "uuid",
        "medicationName": "Metformin",
        "dosage": "850mg",
        "frequency": "Once daily",
        "duration": "30 days"
      }
    ]
  }
}
```

### 3.3 Doctor View Prescriptions - Partially Working ⚠️

**Endpoint:** `GET /doctors/:id/prescriptions`

**Backend:** [doctorController.js](Backend/src/controllers/doctorController.js) - `getDoctorPrescriptions()` (line 103)

**API Call:** [Frontend/src/api/doctorApi.js](Frontend/src/api/doctorApi.js)

```javascript
getDoctorPrescriptions: (doctorId) => {
  return apiClient.get(`/doctors/${doctorId}/prescriptions`);
};
```

**Frontend Component:** [Doctor/Prescriptions.js](Frontend/src/pages/Doctor/Prescriptions.js)

- ⚠️ Uses mock/hardcoded data
- Form exists but doesn't save to backend
- No integration with `doctorApi.createPrescription()`

### 3.4 Patient View Prescriptions - INCOMPLETE ❌

**Patient Frontend:** [Patient/Prescriptions.js](Frontend/src/pages/Patient/Prescriptions.js)

**Current Status:**

```javascript
// Medications Tab - HARDCODED
<div className="prescription-card">
  <h3>Amoxicillin</h3>
  <p>Dosage: 500mg, twice daily</p>
  <p>Prescribed by: Dr. Rahman</p>
</div>
// These are NOT fetched from database
```

**Missing Backend Endpoint:**

```
GET /patients/:id/prescriptions  ❌ DOES NOT EXIST
```

**What's Needed:**

1. Add endpoint to patientController.js
2. Query Prescription records where patientId matches
3. Include medication details
4. Include doctor information

**Example Implementation Needed:**

```javascript
export const getPatientPrescriptions = async (req, res) => {
  const prescriptions = await prisma.prescription.findMany({
    where: { patientId: req.params.id },
    include: {
      medications: true,
      doctor: { select: { name: true } },
      appointment: { select: { diagnosis: true } },
    },
    orderBy: { prescriptionDate: "desc" },
  });

  res.json({ success: true, data: prescriptions });
};
```

---

## 4. Lab Test Management - FULLY WORKING ✅

Lab tests are the **most complete** feature with full frontend-backend integration.

### 4.1 Doctor Recommending Lab Test

**Flow:**

```
Doctor Dashboard/PatientRecords
      ↓
Doctor/RecommendTest.js (component)
      ↓
labApi.recommendTest(doctorId, {
  patientId, testName, description
})
      ↓
POST /lab-tests/doctors/:id/recommend
      ↓
labTestController.js → recommendTest()
      ↓
Creates LabTest record with status: RECOMMENDED
      ↓
Patient receives notification (if webhook/socket implemented)
```

**Backend:** [Backend/src/controllers/labTestController.js](Backend/src/controllers/labTestController.js)

- `recommendTest()` - Doctor recommends a test
- `getDoctorRecommendedTests()` - Doctor views their recommendations

### 4.2 Patient Viewing Lab Tests

**Frontend:** [Patient/Prescriptions.js](Frontend/src/pages/Patient/Prescriptions.js) (line 92-141)

**Working Flow:**

```javascript
useEffect(() => {
  const response = await labApi.getPatientTests(user.patientProfile.id);
  setLabTests(response?.data?.data || []);
}, [user?.patientProfile?.id]);
```

**API:** [Frontend/src/api/labApi.js](Frontend/src/api/labApi.js)

```javascript
getPatientTests: (patientId, status = null) => {
  let url = `/lab-tests/patients/${patientId}`;
  if (status) url += `?status=${status}`;
  return apiClient.get(url);
};
```

**Test States:**

- ✅ RECOMMENDED - Doctor recommended
- 🔄 PENDING - Lab is processing
- ✅ REPORT_ADDED - Results ready to download

### 4.3 Database Schema

```
LabTest
├── id
├── patientId
├── doctorId (who recommended)
├── pathologistId (who processed)
├── appointmentId (if from appointment)
├── testName
├── testDate
├── description
├── resultFile (report file path)
├── reportNotes
├── status: RECOMMENDED | PENDING | COMPLETED | REPORT_ADDED
├── recommendedAt
├── completedAt
└── timestamps

Status Transitions:
RECOMMENDED (default)
    ↓
PENDING (when pathologist starts work)
    ↓
COMPLETED (test done)
    ↓
REPORT_ADDED (results uploaded)
```

---

## 5. Data Synchronization

### 5.1 Real-Time Updates - NOT IMPLEMENTED ❌

**Current Status:** No WebSockets, no webhooks, no real-time sync

**Evidence:**

- No socket.io in [Backend/server.js](Backend/server.js)
- No server-sent events
- No subscription-based updates
- Frontend uses polling-based data fetching

### 5.2 Data Synchronization Method: POLL-BASED

```
Frontend Component
    ↓
useEffect(() => {
  fetchData()  ← Manual refresh needed
}, [dependencies])
    ↓
Patient must manually refresh prescriptions page
Doctor must manually refresh patient records page
```

### 5.3 How Prescription Updates Reflect

**Current Flow:**

1. Doctor creates prescription
   - Stored in database
   - Response sent to frontend

2. Patient sees prescription
   - ❌ Patient doesn't see it automatically
   - Patient must manually refresh page
   - Frontend fetches from `/patients/:id/prescriptions` (endpoint doesn't exist)

**For Lab Tests (Working):**

```
Doctor recommends test
    ↓
LabTest record created
    ↓
Patient refreshes Prescriptions page
    ↓
labApi.getPatientTests() fetches all tests
    ↓
Patient sees new test with status: RECOMMENDED
```

---

## 6. Current Implementation Status Summary

| Feature                              | Status             | Notes                                      |
| ------------------------------------ | ------------------ | ------------------------------------------ |
| **Doctor Access Patients**           | ❌ Incomplete      | Only through appointments, no email search |
| **View Patient Records**             | ✅ Backend Ready   | Frontend not integrated (mock data)        |
| **Prescription Creation**            | ✅ Backend Ready   | Frontend form not connected                |
| **Prescription Retrieval - Doctor**  | ✅ Working         | But frontend doesn't display real data     |
| **Prescription Retrieval - Patient** | ❌ Missing         | Endpoint missing, hardcoded UI only        |
| **Medication Tracking**              | ✅ Backend Ready   | Via MedicationTracking model               |
| **Lab Test Recommendations**         | ✅ Fully Working   | Complete flow implemented                  |
| **Lab Test Updates**                 | ✅ Fully Working   | Status tracking implemented                |
| **Real-Time Sync**                   | ❌ Not Implemented | Poll-based only                            |
| **Webhooks**                         | ❌ Not Implemented | No event notifications                     |
| **Email Search Patients**            | ❌ Not Implemented | Privacy-first design                       |

---

## 7. Complete Doctor-Patient Workflow

### 7.1 Ideal Complete Workflow

```
Step 1: PATIENT BOOKS APPOINTMENT
┌────────────────────────────────────┐
│ Patient/BookAppointment.js         │
│ Searches doctor by specialization  │
│ Selects doctor, books appointment  │
└────────────┬───────────────────────┘
             ↓ POST /patients/:id/appointments
        Creates Appointment
        Status: PENDING
             ↓
Step 2: DOCTOR CONFIRMS APPOINTMENT
┌────────────────────────────────────┐
│ Doctor/Appointments.js             │
│ Views pending appointments         │
│ Confirms/Schedules appointment     │
└────────────┬───────────────────────┘
             ↓ POST /doctors/me/appointments/:id/confirm
        Appointment.Status = CONFIRMED
             ↓
Step 3: VISIT/CONSULTATION
┌────────────────────────────────────┐
│ Doctor consultations with patient  │
│ Doctor documents findings          │
└────────────┬───────────────────────┘
             ↓
Step 4: DOCTOR CREATES PRESCRIPTION
┌────────────────────────────────────┐
│ Doctor/Prescriptions.js            │
│ Fills prescription form            │
│ Selects medications, dosages       │
└────────────┬───────────────────────┘
             ↓ POST /doctors/:id/prescriptions
        Creates Prescription + MedicationTracking
             ↓ SHOULD NOTIFY PATIENT ⚠️ NOT IMPLEMENTED
             ↓
Step 5: PATIENT VIEWS PRESCRIPTION
┌────────────────────────────────────┐
│ Patient/Prescriptions.js - Tab 1   │
│ Views medications prescribed       │
│ Shows dosage, doctor, dates        │
└────────────┬───────────────────────┘
             ↓ GET /patients/:id/prescriptions ❌ ENDPOINT MISSING
        ⚠️ Currently hardcoded, not fetching from DB
             ↓

Step 6: DOCTOR RECOMMENDS LAB TEST
┌────────────────────────────────────┐
│ Doctor/RecommendTest.js            │
│ Selects patient from records       │
│ Chooses tests needed               │
└────────────┬───────────────────────┘
             ↓ POST /lab-tests/doctors/:id/recommend
        Creates LabTest
        Status: RECOMMENDED
             ↓ Patient sees new test ✅
             ↓
Step 7: PATHOLOGIST PROCESSES TEST
┌────────────────────────────────────┐
│ Pathologist/Dashboard              │
│ Views recommended tests            │
│ Updates status → PENDING           │
│ Completes test → COMPLETED         │
│ Uploads report → REPORT_ADDED      │
└────────────┬───────────────────────┘
             ↓ Updates LabTest.status
             ↓
Step 8: PATIENT VIEWS TEST RESULTS
┌────────────────────────────────────┐
│ Patient/Prescriptions.js - Tab 2   │
│ Sees test result status            │
│ Downloads report when ready ✅     │
└────────────────────────────────────┘
```

### 7.2 Communication Between Actors

**Doctor ↔ Patient Communication:**

- Via Appointments
- Via Prescriptions (one-way: Doctor → Patient)
- Via Lab Tests (one-way: Doctor → Patient)

**Synchronization:**

- ✅ Lab Test status updates
- ⚠️ Prescription status (manual refresh needed)
- ❌ Real-time notifications
- ❌ Bi-directional messaging

---

## 8. Recommendations

### Phase 1: Complete Current Features (PRIORITY)

1. **Implement Patient Prescription Endpoint**

   ```javascript
   // Add to patientController.js
   export const getPatientPrescriptions = async (req, res) => {
     // Query prescriptions for patient
   };

   // Add to patientRoutes.js
   router.get("/:id/prescriptions", getPatientPrescriptions);

   // Connect frontend: Patient/Prescriptions.js
   const getPrescriptions = async () => {
     const response = await patientApi.getPrescriptions(patientId);
     setPrescriptions(response.data);
   };
   ```

2. **Connect Doctor Prescription Form**
   - Doctor/Prescriptions.js form should use `doctorApi.createPrescription()`
   - Clear form after successful submission
   - Display success/error messages
   - Fetch and display created prescriptions

3. **Connect Patient Records to Real Data**
   - Doctor/PatientRecords.js should fetch via `getPatientRecord()`
   - Add patient search/selection dropdown
   - Display real appointments and prescriptions

### Phase 2: Add Search & Validation (OPTIONAL)

1. Search functionality with privacy controls
2. Email verification for access
3. Audit logging for access

### Phase 3: Real-Time Features (NICE-TO-HAVE)

1. WebSocket for live updates
2. Notifications on prescription creation
3. Email notifications
4. In-app notification center

---

## 9. API Reference

### Doctor Endpoints

- `GET /doctors/me/appointments` - Get own appointments (JWT)
- `GET /doctors/me/patients` - Get own patients (JWT)
- `POST /doctors/me/appointments/:id/confirm` - Confirm appointment (JWT)
- `GET /doctors/:id/records/:patientId` - Get patient record
- `POST /doctors/:id/prescriptions` - Create prescription
- `GET /doctors/:id/prescriptions` - Get own prescriptions

### Patient Endpoints

- `GET /patients/:id` - Get profile
- `GET /patients/:id/history` - Get medical history
- `GET /patients/:id/appointments` - Get appointments
- ❌ `GET /patients/:id/prescriptions` - MISSING
- `POST /patients/:id/appointments` - Book appointment

### Lab Test Endpoints

- `POST /lab-tests/doctors/:id/recommend` - Doctor recommends test
- `GET /lab-tests/doctors/:id/recommended` - Get recommended tests (doctor)
- `GET /lab-tests/patients/:id` - Get patient's tests

---

## 10. Database Relationships

```
User
├── AdminProfile
├── DoctorProfile
│   ├── Appointments (as doctor)
│   ├── Prescriptions (as doctor)
│   └── LabTests (as doctor who recommended)
├── PatientProfile
│   ├── Appointments (as patient)
│   ├── Prescriptions (as patient)
│   ├── LabTests
│   ├── MedicalHistory
│   └── HealthMonitoring
└── PathologistProfile
    └── LabTests (as pathologist who processed)

Appointment
└── Prescription (one-to-one via appointmentId)
    └── MedicationTracking[] (one-to-many)

LabTest
├── Appointment (optional)
└── Pathologist (optional)

MedicalHistory
├── Patient
└── Doctor
```

---

## File Summary

**Key Frontend Files:**

- [Frontend/src/pages/Doctor/Prescriptions.js](Frontend/src/pages/Doctor/Prescriptions.js) - ⚠️ Not connected
- [Frontend/src/pages/Doctor/PatientRecords.js](Frontend/src/pages/Doctor/PatientRecords.js) - ⚠️ Mock data
- [Frontend/src/pages/Patient/Prescriptions.js](Frontend/src/pages/Patient/Prescriptions.js) - ⚠️ Partial
- [Frontend/src/api/doctorApi.js](Frontend/src/api/doctorApi.js) - Ready to use
- [Frontend/src/api/patientApi.js](Frontend/src/api/patientApi.js) - Needs methods

**Key Backend Files:**

- [Backend/src/controllers/doctorController.js](Backend/src/controllers/doctorController.js) - Core logic
- [Backend/src/controllers/patientController.js](Backend/src/controllers/patientController.js) - Needs prescription methods
- [Backend/src/routes/doctorRoutes.js](Backend/src/routes/doctorRoutes.js) - API routes
- [Backend/prisma/schema.prisma](Backend/prisma/schema.prisma) - Database structure

---

## Conclusion

The healthcare system has a **solid backend foundation** with completed database schema and working lab test module. However, **prescription management and patient record access are incomplete** on the frontend. The architectural decision to use appointment-based patient access (instead of email search) appears intentional for privacy/data protection.

**Quick Win:** Implementing the missing `/patients/:id/prescriptions` endpoint and connecting the patient prescription page would immediately improve the workflow.
