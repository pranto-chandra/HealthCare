import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ role, isOpen }) {
  const links = {
    Patient: [
      { path: "/patient", label: "Dashboard" },
      { path: "/patient/appointments", label: "Appointments" },
      { path: "/patient/prescriptions", label: "Prescriptions" },
      { path: "/patient/health", label: "Health Monitoring" },
      { path: "/patient/editprofile", label: "Edit Profile" },
    ],
    Doctor: [
      { path: "/doctor/dashboard", label: "Dashboard" },
      { path: "/doctor/appointments", label: "Appointments" },
      { path: "/doctor/patients", label: "Patient Records" },
      { path: "/doctor/prescriptions", label: "Prescriptions" },
      { path: "/doctor/editprofile", label: "Edit Profile" }, 
    ],
    Admin: [
      { path: "/admin", label: "Dashboard" },
      { path: "/admin/manage", label: "Manage Users" },
      { path: "/admin/reports", label: "Reports" },
      { path: "/admin/clinics", label: "Clinics" },
      { path: "/admin/editprofile", label: "Edit Profile" },
    ],
  };

  const roleLinks = links[role] || [];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <h3 className="sidebar-title">{role} Menu</h3>

      <nav >
        <ul className="sidebar-list">
          {roleLinks.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className="sidebar-link">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        
      </nav>
    </aside>
  );
}
