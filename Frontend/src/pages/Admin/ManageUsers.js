import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import "./ManageUsers.css";

export default function ManageUsers() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Dummy data (replace with backend later)
  const users = [
    { id: 1, name: "Pritom Shekhar", role: "Patient", email: "pritom@gmail.com", status: "Active" },
    { id: 2, name: "Dr. Rahman", role: "Doctor", email: "rahman@hospital.com", status: "Active" },
    { id: 3, name: "Sara Ahmed", role: "Patient", email: "sara@gmail.com", status: "Inactive" },
  ];

  return (
    <div className="admin-users-page">
      {/* Sidebar Toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div className={`admin-users-layout ${isSidebarOpen ? "" : "collapsed"}`}>
        {isSidebarOpen && <Sidebar role="Admin" />}

        <main className="admin-users-content">
          <h1 className="page-title">Manage Users</h1>

          {/* --- Add User Button --- */}
          <div className="add-user-container">
            <button className="add-user-btn">+ Add New User</button>
          </div>

          {/* --- User Table --- */}
          <section className="user-table-section">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.role}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`status ${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="edit-btn">Edit</button>
                      <button className="delete-btn">Delete</button>
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
