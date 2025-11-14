import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "./Appointments.css";

export default function Appointments() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patient: "John Doe",
      date: "2025-11-15",
      time: "10:00 AM",
      status: "Pending",
    },
    {
      id: 2,
      patient: "Jane Smith",
      date: "2025-11-14",
      time: "2:30 PM",
      status: "Completed",
    },
    {
      id: 3,
      patient: "Michael Lee",
      date: "2025-11-13",
      time: "11:15 AM",
      status: "Cancelled",
    },
    {
      id: 4,
      patient: "Sara Khan",
      date: "2025-11-15",
      time: "3:00 PM",
      status: "Pending",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const updateStatus = (id, newStatus) => {
    setAppointments(prev =>
      prev.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      )
    );
  };

  const filteredAppointments = appointments.filter(app => {
    const matchStatus = filterStatus === "All" || app.status === filterStatus;
    const matchDate = !selectedDate || app.date === selectedDate;
    return matchStatus && matchDate;
  });

  return (
    <div className="doctor-appointments-page">
         {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

       <div className={`doctor-appointments-layout ${isSidebarOpen ? "" : "collapsed"}`}>
              {isSidebarOpen && <Sidebar role="Doctor" />}

        <main className="doctor-appointments-content">
          <section className="appointments-header">
            <h1>Appointments</h1>
            <p>Manage your upcoming and past appointments.</p>
          </section>

          <section className="filters-section">
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option>All</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
          </section>

          <section className="appointments-list">
            {filteredAppointments.length === 0 ? (
              <p className="no-results">No appointments found.</p>
            ) : (
              filteredAppointments.map(app => (
                <div key={app.id} className="appointment-card">
                  <h3>{app.patient}</h3>
                  <p>Date: {app.date}</p>
                  <p>Time: {app.time}</p>
                  <p>Status: <strong>{app.status}</strong></p>

                  <div className="status-buttons">
                    <button onClick={() => updateStatus(app.id, "Completed")}>Complete</button>
                    <button onClick={() => updateStatus(app.id, "Cancelled")}>Cancel</button>
                    <button onClick={() => updateStatus(app.id, "Pending")}>Reset</button>
                  </div>
                </div>
              ))
            )}
          </section>
        </main>
      </div>
    </div>
  );
}