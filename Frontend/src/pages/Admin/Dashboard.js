import React from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "./Dashboard.css";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">

      <div className="dashboard-layout">
        <Sidebar role="Admin" />

        <main className="dashboard-content">
          <section className="welcome-section">
            <h1>Welcome, System Admin 🏥</h1>
            <p>Manage users, clinics, and monitor overall system performance.</p>
          </section>

          <section className="cards-section">
            <div className="info-card">
              <h3>Total Users</h3>
              <p>243 active</p>
            </div>

            <div className="info-card">
              <h3>Registered Doctors</h3>
              <p>45</p>
            </div>

            <div className="info-card">
              <h3>New Reports</h3>
              <p>8 pending</p>
            </div>
          </section>

          <section className="reports-section">
            <h2>System Analytics</h2>
            <ul>
              <li>📈 User engagement up by <b>12%</b> this week.</li>
              <li>⚙️ Database maintenance completed successfully.</li>
              <li>🧾 3 new clinic registrations approved.</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
