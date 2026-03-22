import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Register.css"; // Reuse styling
import { verifyOtp } from "../../api/authApi";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Redirect to register if no email in state
  if (!email) {
    navigate("/register");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp });
      setLoading(false);
      if (res && res.status === 200) {
        alert("✅ Email verified successfully! You can now login.");
        navigate("/login");
      }
    } catch (err) {
      setLoading(false);
      const data = err?.response?.data || {};
      const msg =
        data?.error || data?.message || err.message || "Verification failed";
      alert(`Error: ${msg}`);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Verify Your Email</h1>
        <p style={{ marginBottom: "20px", color: "#666" }}>
          We sent a 6-digit verification code to <strong>{email}</strong>
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center"
        >
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            maxLength="6"
            required
            style={{
              fontSize: "24px",
              letterSpacing: "8px",
              textAlign: "center",
              fontWeight: "bold",
              padding: "12px",
            }}
          />
          <br />
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Code"}
          </button>
          <p style={{ marginTop: "20px", fontSize: "14px", color: "#999" }}>
            Check your email (including spam folder) for the code
          </p>
        </form>
      </div>
    </div>
  );
}
