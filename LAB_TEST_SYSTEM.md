# Lab Test Recommendation & Report System

## Overview

This document describes the complete test recommendation and report submission workflow implemented in the Healthcare application. The system allows doctors to recommend tests after appointments, pathologists to manage those recommendations and submit reports, and patients/doctors to view test results.

## System Architecture

### User Roles

1. **DOCTOR** - Recommends tests after appointments
2. **PATHOLOGIST** - Accepts, processes, and reports on tests  
3. **PATIENT** - Views recommended tests and test results
4. **ADMIN** - System administration

### Database Schema Changes

#### New Enum: TestStatus
- `RECOMMENDED` - Doctor has recommended the test
- `PENDING` - Pathologist has accepted the test
- `COMPLETED` - Test is being processed
- `REPORT_ADDED` - Final report with results added

#### New Model: PathologistProfile
```prisma
model PathologistProfile {
  id              String       @id @default(uuid())
  userId          String       @unique
  name            String
  phone           String
  licenseNumber   String       @unique
  labName         String?
  qualification   String?
  user            User         @relation(...)
  labTests        LabTest[] @relation("PathologistLabTests")
}
```

#### Updated Model: LabTest
```prisma
model LabTest {
  id              String
  patientId       String
  doctorId        String
  appointmentId   String?
  pathologistId   String?        // NEW: Links to pathologist
  testName        String
  testDate        DateTime?
  description     String
  resultFile      String?        // NEW: Path to result document
  reportNotes     String?        // NEW: Additional notes
  status          TestStatus     // NEW: Test status tracking
  recommendedAt   DateTime
  completedAt     DateTime?      // NEW: When report was added
  // ... other relations
}
```

#### Updated Model: User Role Enum
- Added `PATHOLOGIST` role

## Backend Implementation

### Controllers

#### 1. **pathologistController.js**
- `getPathologistProfile()` - Get pathologist's profile
- `updatePathologistProfile()` - Update profile info
- `getRecommendedTests()` - Get all recommended tests
- `getMyTests()` - Get tests assigned to this pathologist
- `getTestDetails()` - Get single test details
- `acceptTest()` - Accept and assign test to pathologist
- `addTestReport()` - Submit test report with file
- `getPatientTestResults()` - Get all completed tests for a patient

#### 2. **labTestController.js**
- `recommendTest()` - Doctor recommends a test
- `getPatientTests()` - Get all tests for a patient
- `getDoctorRecommendedTests()` - Get doctor's recommended tests
- `getTestDetail()` - Get single test details
- `getTestResults()` - Get completed test results
- `updateTestStatus()` - Update test status
- `deleteTestRecommendation()` - Remove recommended test

### Routes

#### Pathologist Routes (`/pathologists`)
```
GET    /profile                    - Get pathologist profile
PUT    /profile                    - Update pathologist profile
GET    /tests/recommended          - Get recommended tests
GET    /tests/my                   - Get assigned tests
GET    /tests/:testId              - Get test details
PUT    /tests/:testId/accept       - Accept test
POST   /tests/:testId/report       - Submit test report (multipart)
GET    /patients/:patientId/results- Get patient's results
```

#### Lab Test Routes (`/lab-tests`)
```
POST   /doctors/:id/recommend      - Doctor recommends test
GET    /patients/:patientId        - Get patient's tests
GET    /doctors/:doctorId/recommended - Get doctor's recommended tests
GET    /:testId                    - Get test details
GET    /patients/:patientId/results- Get test results
PUT    /:testId/status             - Update test status
DELETE /:testId                    - Delete test recommendation
```

### Authentication & Authorization

```javascript
// Pathologist routes require:
- protect middleware (authentication)
- authorize('PATHOLOGIST') middleware

// Lab test routes require:
- protect middleware (authentication)
- Role-based access (doctors can recommend, patients can view their own)
```

## Frontend Implementation

### API Client - `labApi.js`

```javascript
// Doctor endpoints
labApi.recommendTest(doctorId, data)
labApi.getDoctorRecommendedTests(doctorId, status)

// Patient endpoints
labApi.getPatientTests(patientId, status)
labApi.getPatientTestResults(patientId)

// Pathologist endpoints
labApi.getRecommendedTests(status)
labApi.getMyTests()
labApi.acceptTest(testId)
labApi.addTestReport(testId, formData)
labApi.getPathologistProfile()
```

### Components

#### 1. **PathologistDashboard** (`/pages/Pathologist/PathologistDashboard.js`)
Main dashboard for pathologists with three tabs:
- **Recommended** - View all recommended tests
- **My Tests** - Tests assigned to this pathologist  
- **Completed** - Tests with reports added

Features:
- Accept test recommendations
- Upload test reports with file attachment
- View test details
- Filter by status

#### 2. **RecommendTest** (`/pages/Doctor/RecommendTest.js`)
Component for doctors to recommend tests with:
- Quick test suggestions (Blood Test, X-Ray, etc.)
- Test description textarea
- Submit functionality
- Success/error messaging

#### 3. **TestReports** (`/components/TestReports.js`)
Displays test recommendations and results:
- Filter tabs: All, Recommended, Completed
- Card-based display
- Download report links
- Status tracking
- Used in patient profiles and doctor's patient view

### Integration Points

#### In Doctor's Appointments View
```javascript
import RecommendTest from "../components/RecommendTest";

// After appointment completion:
<RecommendTest 
  appointmentId={appointment.id}
  patientId={patient.id}
  doctorId={doctor.id}
  onTestRecommended={() => refreshAppointments()}
/>
```

#### In Patient Profile
```javascript
import TestReports from "../components/TestReports";

// Display test history:
<TestReports patientId={patient.id} />
```

#### In Doctor's Patient Records
```javascript
// PatientRecords.js now includes:
<TestReports patientId={patient.id} />
```

## Workflow

### 1. Test Recommendation (Doctor)
```
Doctor completes appointment
  → Doctor recommends test using RecommendTest component
  → Test created with status = "RECOMMENDED"
  → Patient notified (can view in timeline)
  → Pathologist sees in dashboard
```

### 2. Test Acceptance (Pathologist)
```
Pathologist views recommended tests
  → Clicks "Accept Test"
  → Test status changes to "PENDING"
  → Test assigned to pathologist
  → Pathologist can now add report
```

### 3. Report Submission (Pathologist)
```
Pathologist clicks "Add Report"
  → Uploads report file (PDF/JPG/PNG)
  → Optionally adds notes
  → Test status changes to "REPORT_ADDED"
  → Completion date recorded
  → Results visible to doctor and patient
```

### 4. Viewing Results
```
Patient/Doctor can view:
  - Test recommendations
  - Processing status
  - Completed reports
  - Download report files
  - Lab and pathologist details
```

## File Uploads

Test reports are stored in `uploads/lab-results/` directory with:
- Multer configuration for 5MB file limit
- Allowed formats: PDF, JPG, JPEG, PNG
- Unique filenames to prevent overwrites

Access: Reports accessible at `/{resultFile}` path

## Status Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   RECOMMENDED                            │
│          (Doctor recommends test after appointment)     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    PENDING                               │
│      (Pathologist accepts and processes the test)       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   REPORT_ADDED                           │
│            (Pathologist submits final report)           │
└─────────────────────────────────────────────────────────┘
```

## Common Test Examples

Pre-defined suggestions in RecommendTest component:
- Blood Test (CBC)
- Blood Test (Lipid Panel)  
- Blood Test (Glucose)
- Blood Test (Liver Function)
- Blood Test (Kidney Function)
- Urinalysis
- Thyroid Function Test (TSH, T3, T4)
- ECG
- X-Ray
- Ultrasound
- CT Scan
- MRI Scan
- ECHO (Echocardiogram)
- Stress Test
- Endoscopy

## Security Considerations

1. **Authentication** - All endpoints require valid JWT token
2. **Authorization** - Role-based access control
3. **File Upload** - Validated file types and size limits
4. **Data Access** - Users can only access relevant data
5. **Pathologist Assignment** - Only assigned pathologist can add reports

## Future Enhancements

1. Email notifications for test recommendations
2. SMS reminders for pending tests
3. Test result interpretation/analysis
4. Integration with external lab systems
5. Batch test ordering
6. Payment tracking for lab tests
7. Test scheduling with appointment booking
8. Historical test trends and comparisons
9. Lab reports with digital signatures
10. Mobile app integration for document upload

## Troubleshooting

### Tests not appearing in pathologist dashboard
- Verify pathologist is logged in with correct role
- Check database for test records with correct status
- Verify database migration was applied

### Report upload failing
- Check file size (must be < 5MB)
- Verify file format (PDF, JPG, JPEG, PNG only)
- Check `uploads/lab-results` directory exists and is writable
- Check Multer configuration in routes

### Test status not updating
- Verify pathologist is logged in
- Check JWT token validity
- Verify correct testId is being used
- Check database transaction rollback

### Patient not seeing test reports
- Verify patientId is correct
- Check test status is "REPORT_ADDED"
- Verify database relations are properly set
- Check for database query errors in console
