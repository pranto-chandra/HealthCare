import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";


import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import LandingPage from "./pages/Landing";
import PatientDashboard from "./pages/Patient/Dashboard";
import DoctorDashboard from "./pages/Doctor/Dashboard";
import AdminDashboard from "./pages/Admin/Dashboard";
import PatientAppointment from "./pages/Patient/Appointments";
import PatientPrescriptions from "./pages/Patient/Prescriptions";
import HealthMonitoring from "./pages/Patient/HealthMonitoring";
import DoctorAppointment from "./pages/Doctor/Appointments";
import PatientRecords from "./pages/Doctor/PatientRecords";
import PrescriptionPage from "./pages/Doctor/Prescriptions";
import ManageUsers from "./pages/Admin/ManageUsers";
import Reports from "./pages/Admin/Reports";
import Clinics from "./pages/Admin/Clinics";
import NotFound from "./pages/NotFound";
import PatientEdit from "./pages/Patient/EditProfile";
import DoctorEdit from "./pages/Doctor/EditProfile";
import AdminEdit from "./pages/Admin/EditProfile";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/patient" element={<PatientDashboard/>}/>
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/admin" element={<AdminDashboard/>}/>
          <Route path="/patient/appointments" element={<PatientAppointment/>}/>
          <Route path="/patient/prescriptions" element={<PatientPrescriptions/>}/>
          <Route path="/patient/health" element={<HealthMonitoring/>}/>
          <Route path="/doctor/appointments" element={<DoctorAppointment/>}/>
          <Route path="/doctor/patients" element={<PatientRecords/>}/>
          <Route path="/doctor/prescriptions" element={<PrescriptionPage/>}/>
          <Route path="/admin/manage" element={<ManageUsers/>}/>
          <Route path="/admin/reports" element={<Reports/>}/>
          <Route path="/admin/clinics" element={<Clinics/>}/>
          <Route path="/patient/editprofile" element={<PatientEdit/>}/>
          <Route path="/doctor/editprofile" element={<DoctorEdit/>}/>
          <Route path="/admin/editprofile" element={<AdminEdit/>}/>

          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute role="Patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute role="Doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all route for 404 - MUST be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
