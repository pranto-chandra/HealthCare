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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
