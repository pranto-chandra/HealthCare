import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "./Dashboard.css";

export default function DoctorDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useContext(AuthContext);

  const getDoctorName = () => {
    if (user && user.firstName) {
      return `Dr. ${user.firstName}${user.lastName ? " " + user.lastName : ""}`;
    }
    return "Doctor";
  };
  return (
    <div className="doctor-dashboard">
      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div className={`dashboard-layout ${isSidebarOpen ? "" : "collapsed"}`}>
        {isSidebarOpen && <Sidebar role="Doctor" />}

        <main className="dashboard-content">
          <section className="welcome-section">
            <h1>Welcome, {getDoctorName()} 👨‍⚕️</h1>
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
              <li>
                ✅ Appointment with <b>Mr. Ahmed</b> completed.
              </li>
              <li>
                💊 Prescription updated for <b>Ms. Nabila</b>.
              </li>
              <li>
                🩺 Health report submitted for <b>Mr. Karim</b>.
              </li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
