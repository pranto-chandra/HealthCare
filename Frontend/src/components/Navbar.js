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
    <header className="navbar font-semibold">
      <div className="navbar__logo">
        <h2>
          ORGANIC<span> HEALTHCARE</span>
        </h2>
      </div>

      <nav className="navbar__links hover:no-underline">
        <Link to="/" className="hover:no-underline">
          Home
        </Link>
        <Link to="/about" className="hover:no-underline">
          About Us
        </Link>
        <Link to="/location" className="hover:no-underline">
          Location
        </Link>
        <Link to="/blogs" className="hover:no-underline">
          Blogs
        </Link>
        <Link to="/contact" className="hover:no-underline">
          Contact
        </Link>
        {user ? (
          <button
            className="login-link hover:no-underline"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="login-link hover:no-underline">
            Login
          </Link>
        )}
      </nav>

      <Link
        to="/book-appointment"
        className="navbar__button font-semibold hover:no-underline"
      >
        Book Appointment
      </Link>
    </header>
  );
}
