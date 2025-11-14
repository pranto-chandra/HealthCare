import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "./Dashboard.css";

export default function PatientDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="patient-dashboard">

      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div className={`dashboard-layout ${isSidebarOpen ? "" : "collapsed"}`}>
        {isSidebarOpen && <Sidebar role="Patient" />}

        <main className="dashboard-content">
          {/* --- Welcome Section --- */}
          <section className="welcome-section">
            <h1>Welcome back, Patient 👋</h1>
            <p>Your health records, appointments and more.</p>
          </section>

          {/* Cards Section */}
          <section className="cards-section">
            <div className="info-card">
              <h3>Upcoming Appointments</h3>
              <p>2 scheduled</p>
            </div>
            <div className="info-card">
              <h3>Active Prescriptions</h3>
              <p>3 medications</p>
            </div>
            <div className="info-card">
              <h3>Health Monitoring</h3>
              <p>Last update: 2 days ago</p>
            </div>
          </section>

          {/* Recent Updates */}
          <section className="reports-section">
            <h2>Recent Updates</h2>
            <ul>
              <li>🩺 Appointment booked with Dr. Rahman.</li>
              <li>💊 New prescription added.</li>
              <li>📊 Health data updated.</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
