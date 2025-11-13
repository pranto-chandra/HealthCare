import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__logo">
        <h2>ORGANIC<span> HEALTHCARE</span></h2>
      </div>

      <nav className="navbar__links">
        <Link to="/">About Us</Link>
        <Link to="/">Location</Link>
        <Link to="/">Blogs</Link>
        <Link to="/">Contact</Link>
        <Link to="/login" className="login-link">Login</Link>
      </nav>

      <button className="navbar__button">Book Appointment</button>
    </header>
  );
}
