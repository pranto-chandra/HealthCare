import React from "react";
import Navbar from "../../components/Navbar";
import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* --- Hero Section --- */}
      <section className="hero">
        <div className="hero-content">
          <h1>Your Health, Our Priority —</h1>
          <h1>Anytime, Anywhere.</h1>
          <p>I am looking for</p>

          <div className="hero-buttons">
            <button>Yours More</button>
            <button>Lorem Ipsum Simp Do!</button>
          </div>
        </div>
      </section>

      {/* --- Chairman Section --- */}
      <section className="chairman">
        <div className="chairman-content">
          <h2>MESSAGE FROM OUR CHAIRMAN</h2>
          <p>
            It gives me immense pleasure to witness how technology is
            transforming the healthcare sector. Our Medical Management System
            represents a significant step toward smarter, more accessible, and
            more reliable healthcare delivery.
          </p>
        </div>
      </section>

      {/* --- Departments Section --- */}
      <section className="departments">
        <h2>Our Medical Departments</h2>
        <div className="dept-grid">
          {[
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
          ].map((item, i) => (
            <div className="dept-card" key={i}>
              <div className="dept-img"></div>
              <div className="dept-text">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Footer Section --- */}
      <footer className="footer">
        <p>© 2025 Organic Healthcare. All rights reserved.</p>
      </footer>
    </div>
  );
}
