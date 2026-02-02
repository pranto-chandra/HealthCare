import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import "./Reports.css";

export default function Reports() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Dummy statistics (replace with backend data later)
  const stats = [
    { title: "Total Users", value: 320 },
    { title: "Doctors", value: 45 },
    { title: "Patients", value: 260 },
    { title: "Appointments This Month", value: 128 },
  ];

  const reports = [
    { id: 1, name: "Monthly Appointments Report", date: "Jan 2026" },
    { id: 2, name: "User Activity Summary", date: "Jan 2026" },
    { id: 3, name: "Doctor Performance Report", date: "Jan 2026" },
  ];

  return (
    <div className="admin-reports-page">
      {/* Sidebar Toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div className={`admin-reports-layout ${isSidebarOpen ? "" : "collapsed"}`}>
        {isSidebarOpen && <Sidebar role="Admin" />}

        <main className="admin-reports-content">
          <h1 className="page-title">System Reports & Analytics</h1>

          {/* --- Statistics Cards --- */}
          <section className="stats-section">
            {stats.map((item, index) => (
              <div className="stat-card" key={index}>
                <h3>{item.value}</h3>
                <p>{item.title}</p>
              </div>
            ))}
          </section>

          {/* --- Reports List --- */}
          <section className="reports-section">
            <h2>Generated Reports</h2>
            <ul className="report-list">
              {reports.map((report) => (
                <li key={report.id} className="report-item">
                  <div>
                    <h4>{report.name}</h4>
                    <span>{report.date}</span>
                  </div>
                  <button className="download-btn">Download</button>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
