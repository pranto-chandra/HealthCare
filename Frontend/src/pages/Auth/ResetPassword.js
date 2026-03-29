import React, { useState, useContext } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import authApi from "../../api/authApi";
import { getErrorMessage } from "../../utils/helpers";
import "./ResetPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenError, setTokenError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if token is present
  if (!token) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="error-box">
            <h2>Invalid Reset Link</h2>
            <p>
              The password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <Link to="/forgot-password" className="btn-primary">
              Request New Reset Link
            </Link>
            <Link to="/login" className="btn-secondary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 6) errors.push("Password must be at least 6 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("Must contain an uppercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("Must contain a number");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
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

    try {
      setLoading(true);
      const response = await authApi.confirmPasswordReset(token, password);

      if (response?.data?.success) {
        setSuccess(true);
        try {
          await logout();
        } catch (logoutError) {
          // Ignore logout errors, just clear client state
        }
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      if (errorMsg.includes("Invalid") || errorMsg.includes("expired")) {
        setTokenError(true);
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="error-box">
            <h2>Reset Link Expired</h2>
            <p>
              This password reset link has expired or is invalid. Please request
              a new one.
            </p>
            <Link to="/forgot-password" className="btn-primary">
              Request New Reset Link
            </Link>
            <Link to="/login" className="btn-secondary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Reset Your Password</h2>
        <p className="subtitle">
          Enter a new password for your account. Make sure it's strong and
          secure.
        </p>

        {success && (
          <div className="success-message">
            <h3>✓ Password Reset Successfully!</h3>
            <p>Your password has been changed. Redirecting to login...</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="reset-password-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
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
                  placeholder="Re-enter password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
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

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || password !== confirmPassword}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="form-footer">
              <Link to="/login" className="link">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
