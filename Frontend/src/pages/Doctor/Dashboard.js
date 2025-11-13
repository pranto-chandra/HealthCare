import React from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "./Dashboard.css";

export default function DoctorDashboard() {
  return (
    <div className="doctor-dashboard">
      

      <div className="dashboard-layout">
        <Sidebar role="Doctor" />

        <main className="dashboard-content">
          <section className="welcome-section">
            <h1>Welcome, Dr. Rahman 👨‍⚕️</h1>
            <p>Your patients are waiting for expert care today.</p>
          </section>

          <section className="cards-section">
            <div className="info-card">
              <h3>Today's Appointments</h3>
              <p>12 scheduled</p>
            </div>

            <div className="info-card">
              <h3>Pending Prescriptions</h3>
              <p>5 to review</p>
            </div>

            <div className="info-card">
              <h3>New Patient Records</h3>
              <p>3 updated</p>
            </div>
          </section>

          <section className="reports-section">
            <h2>Recent Activities</h2>
            <ul>
              <li>✅ Appointment with <b>Mr. Ahmed</b> completed.</li>
              <li>💊 Prescription updated for <b>Ms. Nabila</b>.</li>
              <li>🩺 Health report submitted for <b>Mr. Karim</b>.</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}

