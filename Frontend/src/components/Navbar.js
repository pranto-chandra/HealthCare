import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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
        {user ? (
          <button className="login-link" onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login" className="login-link">Login</Link>
        )}
      </nav>

      <button className="navbar__button">Book Appointment</button>
    </header>
  );
}
