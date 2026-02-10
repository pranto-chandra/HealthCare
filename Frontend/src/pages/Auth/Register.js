import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import { register } from "../../api/authApi";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PATIENT");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register({ email, password, role });
      setLoading(false);
      if (res && res.status === 201) {
        alert("Registration successful. Please login.");
        navigate("/login");
      } else {
        alert("Registration submitted. Check backend response.");
      }
    } catch (err) {
      setLoading(false);
      const data = err?.response?.data || {};
      const msg =
        data?.error || data?.message || err.message || "Registration failed";
      alert(`Error: ${msg}`);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="
            px-4 py-2
            rounded-lg
            border border-gray-300
            bg-white
            text-gray-700
            focus:outline-none
            focus:ring-2 focus:ring-purple-500
            focus:border-purple-500
            transition
            duration-200
            cursor-pointer
            padding-2
            flex
            justify-center items-center
            hover:bg-purple-100
            w-4/12
            font-semibold
        "
          >
            <option value="PATIENT">Patient</option>
            <option value="DOCTOR">Doctor</option>
            <option value="ADMIN">Admin</option>
          </select>

          <br />
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
