import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import doctorApi from "../api/doctorApi";
import { getErrorMessage } from "../utils/helpers";
import "./DoctorsBySpecialization.css";

export default function DoctorsBySpecialization() {
  const { specialization } = useParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await doctorApi.getDoctorsBySpecialization(specialization);
        if (res?.data?.data) {
          setDoctors(res.data.data);
        } else {
          setError("No doctors found for this specialization");
        }
      } catch (err) {
        setError(getErrorMessage(err));
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    if (specialization) {
      fetchDoctors();
    }
  }, [specialization]);

  const parseQualifications = (qualificationsStr) => {
    if (!qualificationsStr) return [];

    try {
      if (typeof qualificationsStr === "string") {
        // Try parsing as JSON first
        const parsed = JSON.parse(qualificationsStr);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      // Not valid JSON, treat as comma-separated string
      if (typeof qualificationsStr === "string") {
        return qualificationsStr
          .split(",")
          .map((q) => q.trim())
          .filter((q) => q.length > 0);
      }
    }

    return qualificationsStr && Array.isArray(qualificationsStr)
      ? qualificationsStr
      : [];
  };

  const parseAvailableDays = (daysStr) => {
    if (!daysStr) return [];

    try {
      if (typeof daysStr === "string") {
        // Try parsing as JSON first
        const parsed = JSON.parse(daysStr);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      // Not valid JSON, treat as comma-separated string
      if (typeof daysStr === "string") {
        return daysStr
          .split(",")
          .map((d) => d.trim())
          .filter((d) => d.length > 0);
      }
    }

    return daysStr && Array.isArray(daysStr) ? daysStr : [];
  };

  return (
    <div className="doctors-by-specialization-page">
      {/* Header */}
      <div className="dbs-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <h1>{specialization}</h1>
        <p className="doctors-count">
          {doctors.length} {doctors.length === 1 ? "Doctor" : "Doctors"}{" "}
          Available
        </p>
      </div>

      {/* Content */}
      <div className="dbs-container">
        {loading && (
          <div className="loading">
            <p>Loading doctors...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {!loading && doctors.length === 0 && !error && (
          <div className="no-doctors">
            <p>No doctors found for this specialization.</p>
          </div>
        )}

        {!loading && doctors.length > 0 && (
          <div className="doctors-grid">
            {doctors.map((doctor, index) => (
              <div key={index} className="doctor-card">
                {/* Image Placeholder */}
                <div className="doctor-image-placeholder">
                  <div className="image-placeholder">
                    <p>Image</p>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="doctor-info">
                  <div className="name-section">
                    <h2 className="doctor-name">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h2>
                  </div>

                  <div className="specialization-badge">
                    {doctor.specialization}
                  </div>

                  <div className="info-group">
                    <label>License Number:</label>
                    <p>{doctor.licenseNumber}</p>
                  </div>

                  <div className="info-group">
                    <label>Qualifications:</label>
                    <div className="qualifications-list">
                      {parseQualifications(doctor.qualifications).length > 0 ? (
                        parseQualifications(doctor.qualifications).map(
                          (qual, idx) => (
                            <span key={idx} className="qualification-badge">
                              {qual}
                            </span>
                          ),
                        )
                      ) : (
                        <p className="no-data">Not specified</p>
                      )}
                    </div>
                  </div>

                  <div className="info-group">
                    <label>Experience:</label>
                    <p className="experience">
                      {doctor.experience
                        ? `${doctor.experience} Years`
                        : "Not specified"}
                    </p>
                  </div>

                  <div className="info-group">
                    <label>Contact Number:</label>
                    <p className="contact">{doctor.phone}</p>
                  </div>

                  <div className="info-group">
                    <label>Email:</label>
                    <p className="email">{doctor.email}</p>
                  </div>

                  <div className="info-group">
                    <label>Consultation Fee:</label>
                    <p className="consultation-fee">
                      ৳{doctor.consultationFee}
                    </p>
                  </div>

                  <div className="info-group">
                    <label>Available Days:</label>
                    <div className="available-days">
                      {parseAvailableDays(doctor.availableDays).length > 0 ? (
                        parseAvailableDays(doctor.availableDays).map(
                          (day, idx) => (
                            <span key={idx} className="day-badge">
                              {day}
                            </span>
                          ),
                        )
                      ) : (
                        <p className="no-data">Not specified</p>
                      )}
                    </div>
                  </div>

                  <button className="book-appointment-btn">
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
