import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import appointmentApi from "../../api/appointmentApi";
import doctorApi from "../../api/doctorApi";
import patientApi from "../../api/patientApi";
import {
  getErrorMessage,
  parseQualifications,
  parseAvailableDays,
} from "../../utils/helpers";
import "./BookAppointment.css";

export default function BookAppointment() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [qualificationFilter, setQualificationFilter] = useState("");

  // State for data
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [patientId, setPatientId] = useState(null);

  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");

  // State for booking
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentType, setAppointmentType] = useState(
    "General Consultation",
  );
  const [isBooking, setIsBooking] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Only allow patients to book appointments
    if (user.role !== "PATIENT") {
      setError("Only patients can book appointments");
      return;
    }

    // Fetch patient ID using user ID
    const fetchPatientId = async () => {
      try {
        const res = await patientApi.getPatientByUserId(user.id);
        if (res?.data?.data?.id) {
          setPatientId(res.data.data.id);
        } else {
          setPatientId(user.id); // Fallback
        }
      } catch (err) {
        console.log("Using user ID as fallback:", user.id);
        setPatientId(user.id); // Fallback to user ID
      }
    };

    fetchPatientId();
  }, [user, navigate]);

  // Fetch all doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch all doctors from the public endpoint (available per specialization)
        const specializations = [
          "Cardiology",
          "Neurosurgery",
          "Orthopaedics",
          "Pediatrics",
          "Dentistry",
          "Dermatology and Venerology",
          "Skin-V.D-Allergy-Dermato-Laser-Dermato-Surgery and Cosmetic Dermatology",
          "Skin & Venereal Diseases",
          "ENT",
          "Gynaecology & Obstetrics",
          "Oncology",
          "Nephrology",
          "Urology",
          "Psychiatry",
          "Hepatology",
          "Rheumatology",
          "Respiratory Medicine",
          "General Surgery",
          "Burn & Plastic Surgery",
          "Colorectal Surgery",
          "Laparoscopic Surgery",
          "Endocrinology",
          "Physical Medicine",
          "Surgical Oncology",
        ];

        let allDoctors = [];
        const qualSet = new Set();

        for (const spec of specializations) {
          try {
            const res = await doctorApi.getDoctorsBySpecialization(spec);
            if (res?.data?.data) {
              const docsWithSpec = res.data.data.map((doc) => ({
                ...doc,
                specialization: spec,
              }));
              allDoctors = [...allDoctors, ...docsWithSpec];

              // Extract qualifications
              if (res.data.data.length > 0) {
                res.data.data.forEach((doc) => {
                  if (doc.qualifications) {
                    const quals = parseQualifications(doc.qualifications);
                    quals.forEach((q) => qualSet.add(q));
                  }
                });
              }
            }
          } catch (err) {
            // Continue with next specialization if one fails
          }
        }

        // Remove duplicates based on userId
        const uniqueDoctors = [];
        const seenUserIds = new Set();
        allDoctors.forEach((doc) => {
          if (!seenUserIds.has(doc.userId)) {
            uniqueDoctors.push(doc);
            seenUserIds.add(doc.userId);
          }
        });

        setDoctors(uniqueDoctors);
        setFilteredDoctors(uniqueDoctors);
        setQualifications(Array.from(qualSet).sort());

        // Extract unique specializations
        const uniqueSpecs = [
          ...new Set(uniqueDoctors.map((d) => d.specialization)),
        ].sort();
        setSpecializations(uniqueSpecs);
      } catch (err) {
        setError(getErrorMessage(err));
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = doctors;

    // Filter by search term (doctor name)
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((doc) => {
        const fullName =
          `${doc.firstName || ""} ${doc.lastName || ""}`.toLowerCase();
        return fullName.includes(lowerSearch);
      });
    }

    // Filter by specialization
    if (specializationFilter) {
      filtered = filtered.filter(
        (doc) => doc.specialization === specializationFilter,
      );
    }

    // Filter by qualification
    if (qualificationFilter) {
      filtered = filtered.filter((doc) => {
        const quals = parseQualifications(doc.qualifications);
        return quals.includes(qualificationFilter);
      });
    }

    setFilteredDoctors(filtered);
  }, [searchTerm, specializationFilter, qualificationFilter, doctors]);

  // Handle booking appointment
  const handleBookAppointment = async (doctor) => {
    if (!appointmentDate) {
      setBookingError("Please select an appointment date");
      return;
    }

    try {
      setIsBooking(true);
      setBookingError("");

      const appointmentData = {
        doctorId: doctor.id,
        appointmentDate: new Date(appointmentDate).toISOString(),
        appointmentType: appointmentType,
        status: "PENDING",
      };

      await appointmentApi.createAppointment(patientId, appointmentData);

      // Success - navigate to appointments page
      navigate("/patient/appointments");
    } catch (err) {
      setBookingError(getErrorMessage(err));
      console.error("Error booking appointment:", err);
    } finally {
      setIsBooking(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setSelectedDoctor(null);
    setAppointmentDate("");
    setAppointmentType("General Consultation");
    setBookingError("");
  };

  if (!user || user.role !== "PATIENT") {
    return (
      <div className="book-appointment-page">
        <div className="error-container">
          <p>Please log in as a patient to book an appointment.</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-appointment-page">
      {/* Header */}
      <div className="ba-header">
        <h1>Book an Appointment</h1>
        <p>Find and book an appointment with our healthcare professionals</p>
      </div>

      {/* Filters Section */}
      <div className="ba-filters flex justify-between items-center flex-wrap gap-4">
        <div className="filter-group">
          <label htmlFor="search"></label>
          <input
            id="search"
            type="text"
            placeholder="Enter doctor's name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group p-3 w-full md:w-auto">
          <label htmlFor="specialization"></label>
          <select
            id="specialization"
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="filter-select p-3 w-full h-12 border-6"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="qualification"></label>
          <select
            id="qualification"
            value={qualificationFilter}
            onChange={(e) => setQualificationFilter(e.target.value)}
            className="filter-select h-12 border-6"
          >
            <option value="">All Qualifications</option>
            {qualifications.map((qual) => (
              <option key={qual} value={qual}>
                {qual}
              </option>
            ))}
          </select>
        </div>

        <button
          className="reset-btn h-12 flex items-center justify-center"
          onClick={() => {
            setSearchTerm("");
            setSpecializationFilter("");
            setQualificationFilter("");
          }}
        >
          Reset Filters
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <p>Loading doctors...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && filteredDoctors.length === 0 && (
        <div className="no-results">
          <p>
            No doctors found matching your criteria. Try adjusting your filters.
          </p>
        </div>
      )}

      {/* Doctors Grid */}
      {!loading && !error && filteredDoctors.length > 0 && (
        <div className="doctors-container">
          <p className="results-count">
            Found {filteredDoctors.length} doctor
            {filteredDoctors.length !== 1 ? "s" : ""}
          </p>
          <div className="doctors-grid">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-info">
                  <h3>{`Dr. ${doctor.firstName} ${doctor.lastName}`}</h3>
                  <p className="specialization">{doctor.specialization}</p>

                  {doctor.qualifications && (
                    <div className="qualifications">
                      <strong>Qualifications:</strong>
                      <ul>
                        {parseQualifications(doctor.qualifications).map(
                          (qual, idx) => (
                            <li key={idx}>{qual}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                  {doctor.experience && (
                    <p className="experience">
                      <strong>Experience:</strong> {doctor.experience} years
                    </p>
                  )}

                  <p className="fee">
                    <strong>Consultation Fee:</strong> Rs.{" "}
                    {doctor.consultationFee}
                  </p>

                  {doctor.availableDays && (
                    <div className="available-days">
                      <strong>Available:</strong>
                      <p>
                        {parseAvailableDays(doctor.availableDays).join(", ")}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  className="book-btn"
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>
              ×
            </button>

            <h2>Book Appointment</h2>
            <p>
              with Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
            </p>

            {bookingError && (
              <div className="error-message">{bookingError}</div>
            )}

            <div className="form-group">
              <label htmlFor="date">Appointment Date</label>
              <input
                id="date"
                type="datetime-local"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Appointment Type</label>
              <select
                id="type"
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="form-select"
              >
                <option value="General Consultation">
                  General Consultation
                </option>
                <option value="Follow-up">Follow-up</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div className="modal-actions">
              <button
                className="book-submit-btn"
                onClick={() => handleBookAppointment(selectedDoctor)}
                disabled={isBooking}
              >
                {isBooking ? "Booking..." : "Confirm Booking"}
              </button>
              <button
                className="cancel-btn"
                onClick={closeModal}
                disabled={isBooking}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
