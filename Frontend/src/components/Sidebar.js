import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar({ role }) {
  const links = {
    Patient: [
      { path: "/patient/dashboard", label: "Dashboard" },
      { path: "/patient/appointments", label: "Appointments" },
      { path: "/patient/prescriptions", label: "Prescriptions" },
      { path: "/patient/health", label: "Health Monitoring" },
    ],
    Doctor: [
      { path: "/doctor/dashboard", label: "Dashboard" },
      { path: "/doctor/appointments", label: "Appointments" },
      { path: "/doctor/patients", label: "Patient Records" },
      { path: "/doctor/prescriptions", label: "Prescriptions" },
    ],
    Admin: [
      { path: "/admin/dashboard", label: "Dashboard" },
      { path: "/admin/users", label: "Manage Users" },
      { path: "/admin/reports", label: "Reports" },
      { path: "/admin/clinics", label: "Clinics" },
    ],
  };

  const roleLinks = links[role] || [];

  return (
    <aside
      style={{
        width: "150px",
        backgroundColor: "#004d40",
        color: "white",
        height: "100vh",
        padding: "20px",
        position: "fixed",
      }}
    >
      <h3 style={{ color: "#80cbc4", marginBottom: "20px" }}>
        {role} Menu
      </h3>
      <nav>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {roleLinks.map((item) => (
            <li key={item.path} style={{ marginBottom: "12px" }}>
              <Link
                to={item.path}
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "15px",
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
