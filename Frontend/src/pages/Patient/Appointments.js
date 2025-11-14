import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import "./Appointments.css";

export default function Appointments() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Temporary Dummy Data (replace with API later)
  const appointments = [
    {
      id: 1,
      doctor: "Dr. Rahman",
      date: "2025-02-12",
      time: "10:00 AM",
      status: "Confirmed",
    },
    {
      id: 2,
      doctor: "Dr. Sara Ahmed",
      date: "2025-02-18",
      time: "3:15 PM",
      status: "Pending",
    },
    {
      id: 3,
      doctor: "Dr. Kamal Hossain",
      date: "2025-03-01",
      time: "8:45 AM",
      status: "Completed",
    },
  ];

  return (
    <div className="appointments-page">
      {/* Toggle Sidebar */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div
        className={`appointments-layout ${
          isSidebarOpen ? "" : "collapsed"
        }`}
      >
        {isSidebarOpen && <Sidebar role="Patient" />}

        {/* MAIN CONTENT */}
        <main className="appointments-content">
          <h1 className="page-title">Your Appointments</h1>

          {/* --- Upcoming Card Section --- */}
          <section className="upcoming-section">
            <h2>Upcoming Appointment</h2>

            {appointments.length > 0 ? (
              <div className="upcoming-card">
                <p>
                  <strong>Doctor:</strong> {appointments[0].doctor}
                </p>
                <p>
                  <strong>Date:</strong> {appointments[0].date}
                </p>
                <p>
                  <strong>Time:</strong> {appointments[0].time}
                </p>
                <span className="status confirmed">
                  {appointments[0].status}
                </span>
              </div>
            ) : (
              <p>No upcoming appointments.</p>
            )}
          </section>

          {/* --- Table of All Appointments --- */}
          <section className="table-section">
            <h2>Appointment History</h2>

            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.doctor}</td>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td>
                      <span className={`status ${a.status.toLowerCase()}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
}
