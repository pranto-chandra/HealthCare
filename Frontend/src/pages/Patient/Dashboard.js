import React from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import "./Dashboard.css";

export default function Dashboard() {
  const departments = [
    {
      title: "Cardiac",
      text: "We've been at the forefront of heart care for 24+ years, combining advanced technology with expert treatment.",
    },
    {
      title: "Neurology",
      text: "Expert neurological treatment and brain diagnostics with cutting-edge imaging systems.",
    },
    {
      title: "Orthopedics",
      text: "Comprehensive joint and bone care from trusted specialists.",
    },
    {
      title: "Pediatrics",
      text: "Holistic healthcare for children of all ages with compassion and precision.",
    },
    {
      title: "Dental",
      text: "Modern dental care and cosmetic treatments ensuring perfect smiles.",
    },
    {
      title: "Dermatology",
      text: "Skin health and aesthetic care using the latest dermatological advances.",
    },
  ];

  return (
    <div className="dashboard">
      {/* Global Navbar */}

      <div className="dashboard-layout">
        {/* Sidebar (optional for patient view, can be hidden on mobile) */}
        <Sidebar role="Patient" />

        <main className="dashboard-content">
          {/* --- Hero Section --- */}
          <section className="hero">
            <div className="hero-content">
              <h1>Your Health, Our Priority —</h1>
              <h1>Anytime, Anywhere.</h1>
              <p className="hero-subtext">Providing trusted healthcare services since 1998.</p>

              <div className="hero-buttons">
                <button className="btn-primary">Book Appointment</button>
                <button className="btn-secondary">Learn More</button>
              </div>
            </div>
          </section>

          {/* --- Chairman Section --- */}
          <section className="chairman">
            <div className="chairman-content">
              <h2>Message from Our Chairman</h2>
              <p>
                “It gives me immense pleasure to witness how technology is transforming the healthcare sector.
                Our Healthcare Management System represents a significant step toward smarter, more accessible,
                and more reliable healthcare delivery.”
              </p>
            </div>
          </section>

          {/* --- Departments Section --- */}
          <section className="departments">
            <h2>Our Medical Departments</h2>
            <div className="dept-grid">
              {departments.map(({ title, text }, index) => (
                <div className="dept-card" key={index}>
                  <div className="dept-img" />
                  <div className="dept-text">
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* --- Footer --- */}
          <footer className="footer">
            <p>© {new Date().getFullYear()} Organic Healthcare. All rights reserved.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
