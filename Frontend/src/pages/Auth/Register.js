import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import { register } from "../../api/authApi";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenError, setTokenError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 6) errors.push("Password must be at least 6 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("Must contain an uppercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("Must contain a number");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(". "));
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await register({ email, password });
      setLoading(false);
      if (res && res.status === 200) {
        setSuccess(true);
        alert("✅ Verification code sent to your email!");
        navigate("/verify-email", { state: { email } });
      } else {
        alert("Registration submitted. Check backend response.");
      }
    } catch (err) {
      setLoading(false);
      const data = err?.response?.data || {};
      const msg =
        data?.error || data?.message || err.message || "Registration failed";
      setError(`Error: ${msg}`);
      alert(`Error: ${msg}`);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Create Account</h1>
        <p className="register-subtitle">
          Sign up for a new account and start booking appointments today.
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            Registration successful! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
              </button>
            </div>
            <div className="password-hints">
              <p>Password must contain:</p>
              <ul>
                <li className={password.length >= 6 ? "valid" : ""}>
                  At least 6 characters
                </li>
                <li className={/[A-Z]/.test(password) ? "valid" : ""}>
                  One uppercase letter
                </li>
                <li className={/[0-9]/.test(password) ? "valid" : ""}>
                  One number
                </li>
              </ul>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
              </button>
            </div>
            {confirmPassword && password === confirmPassword && (
              <p className="match-indicator valid">✓ Passwords match</p>
            )}
            {confirmPassword && password !== confirmPassword && (
              <p className="match-indicator invalid">
                ✗ Passwords do not match
              </p>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
