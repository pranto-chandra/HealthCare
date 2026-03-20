import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authApi from "../../api/authApi";
import { getErrorMessage } from "../../utils/helpers";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.forgotPassword(email);

      if (response?.data?.success) {
        setSuccess(true);
        setResetSent(true);
        setEmail("");

        // Show the reset token for development/testing
        if (response?.data?.resetToken) {
          console.log("Reset Token:", response.data.resetToken);
          console.log("Reset Link:", response.data.resetLink);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password?</h2>
        <p className="subtitle">
          Enter your email address and we'll send you instructions to reset your
          password.
        </p>

        {resetSent && (
          <div className="success-message">
            <h3>✓ Email Sent Successfully!</h3>
            <p>
              Check your email for password reset instructions. If you don't see
              it, check your spam folder.
            </p>
            <p className="small-text">The link will expire in 1 hour.</p>
            <button className="btn-primary" onClick={() => navigate("/login")}>
              Back to Login
            </button>
          </div>
        )}

        {!resetSent && (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="form-footer">
              <p>
                Remember your password?{" "}
                <Link to="/login" className="link">
                  Back to Login
                </Link>
              </p>
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="link">
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
