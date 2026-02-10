import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const ok = await login(email, password); // from AuthContext
      if (ok) {
        // Get user from localStorage to check role
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const role = user?.role?.toUpperCase();
        
        // Redirect based on role
        if (role === 'PATIENT') {
          navigate('/patient/dashboard');
        } else if (role === 'DOCTOR') {
          navigate('/doctor/dashboard');
        } else if (role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/patient/dashboard'); // default fallback
        }
      } else {
        alert('Login failed: invalid credentials');
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Login failed';
      alert(`Error: ${msg}`);
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">
        <h1>
          Hi, Welcome! <span role="img" aria-label="wave">👋</span>
        </h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>Email address</label>
          <div className="input-group">
            <input
              type="email"
              placeholder="helloworld@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="icon">✔️</span>
          </div>

          <label>Password</label>
          <div className="input-group">
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="icon">👁️</span>
          </div>

          <div className="forgot">
            <Link to="/reset-password">Forgot password?</Link>
          </div>

          <button type="submit" className="login-btn">Log in</button>

          <p className="signup-text">
            Don’t have an account?{" "}
            <Link to="/register" className="signup-link">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
