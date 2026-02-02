import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import "./Clinics.css";

export default function Clinics() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Dummy clinic data (replace with backend API later)
  const clinics = [
    {
      id: 1,
      name: "Central Medical Clinic",
      location: "Dhaka",
      doctors: 25,
      status: "Active",
    },
    {
      id: 2,
      name: "Green Valley Hospital",
      location: "Chittagong",
      doctors: 18,
      status: "Active",
    },
    {
      id: 3,
      name: "Sunrise Health Center",
      location: "Sylhet",
      doctors: 10,
      status: "Inactive",
    },
  ];

  return (
    <div className="admin-clinics-page">
      {/* Sidebar Toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div className={`admin-clinics-layout ${isSidebarOpen ? "" : "collapsed"}`}>
        {isSidebarOpen && <Sidebar role="Admin" />}

        <main className="admin-clinics-content">
          <h1 className="page-title">Clinics & Hospitals</h1>

          {/* Add Clinic Button */}
          <div className="add-clinic-container">
            <button className="add-clinic-btn">+ Add New Clinic</button>
          </div>

          {/* Clinics Table */}
          <section className="clinics-table-section">
            <table className="clinics-table">
              <thead>
                <tr>
                  <th>Clinic Name</th>
                  <th>Location</th>
                  <th>Doctors</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clinics.map((clinic) => (
                  <tr key={clinic.id}>
                    <td>{clinic.name}</td>
                    <td>{clinic.location}</td>
                    <td>{clinic.doctors}</td>
                    <td>
                      <span
                        className={`status ${clinic.status.toLowerCase()}`}
                      >
                        {clinic.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="edit-btn">Edit</button>
                      <button className="delete-btn">Remove</button>
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
