import React, { useState, useContext, useEffect} from "react";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import appointmentApi from "../../api/appointmentApi";
import doctorApi from "../../api/doctorApi";
import patientApi from "../../api/patientApi";
import {
  getErrorMessage,
} from "../../utils/helpers";
import "./BookAppointment.css";

export default function BookAppointment() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useContext(AuthContext);
  const role = user?.role; // Patient | Doctor | Admin
  const normalizedRole = user?.role
  ? user.role.toLowerCase().charAt(0).toUpperCase() +
    user.role.toLowerCase().slice(1)
  : null;
  const navigate = useNavigate();

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
    "ONLINE",
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

        // Primary source: get all doctors from public endpoint
        const res = await doctorApi.getAllDoctors();
        const allDoctors = res?.data?.data || [];

        // Build sets for specialties and degrees for filters
        const specialitySet = new Set();
        const degreeSet = new Set();

        allDoctors.forEach((doc) => {
          if (doc.specialties && Array.isArray(doc.specialties)) {
            doc.specialties.forEach((s) => s?.name && specialitySet.add(s.name));
          }
          if (doc.degrees && Array.isArray(doc.degrees)) {
            doc.degrees.forEach((d) => d?.name && degreeSet.add(d.name));
          }
        });

        setDoctors(allDoctors);
        setFilteredDoctors(allDoctors);
        setQualifications(Array.from(degreeSet).sort());
        setSpecializations(Array.from(specialitySet).sort());
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
        const fullName = `${doc.name || ""}`.toLowerCase();
        return fullName.includes(lowerSearch);
      });
    }

    // Filter by specialization - check if any of doctor's specialties match
    if (specializationFilter) {
      filtered = filtered.filter((doc) => {
        if (!doc.specialties || !Array.isArray(doc.specialties)) return false;
        return doc.specialties.some(spec => spec.name === specializationFilter);
      });
    }

    // Filter by qualification/degree
    if (qualificationFilter) {
      filtered = filtered.filter((doc) => {
        if (!doc.degrees || !Array.isArray(doc.degrees)) return false;
        return doc.degrees.some(deg => deg.name === qualificationFilter);
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
        scheduledAt: new Date(appointmentDate).toISOString(),
        type: appointmentType,
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
    setAppointmentType("ONLINE");
    setBookingError("");
  };

  if (!user || user.role !== "PATIENT") {
    return (
      <div className="book-appointment-page">
        <div className="error-container">
          <p>Only logged in patient can book appointments.</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-appointment-page">
       {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div className={`book-layout ${isSidebarOpen ? "" : "collapsed"}`}>
        {isSidebarOpen && <Sidebar role={normalizedRole} />}

        <main className="book-content">
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
                  <h3>{`Dr. ${doctor.name}`}</h3>

                  {doctor.specialties && doctor.specialties.length > 0 && (
                    <p className="specialization">
                      {doctor.specialties.map(s => s.name).join(", ")}
                    </p>
                  )}

                  {doctor.degrees && doctor.degrees.length > 0 && (
                    <div className="qualifications">
                      <strong>Degrees:</strong>
                      <ul>
                        {doctor.degrees.map((deg, idx) => (
                          <li key={idx}>
                            {deg.name}
                            {deg.passingYear && ` (${deg.passingYear})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {doctor.experienceYears !== undefined && (
                    <p className="experience">
                      <strong>Experience:</strong> {doctor.experienceYears} years
                    </p>
                  )}

                  {doctor.consultationFee !== undefined && (
                    <p className="fee">
                      <strong>Consultation Fee:</strong> Rs.{" "}
                      {doctor.consultationFee}
                    </p>
                  )}

                  {doctor.locationDiv && (
                    <p className="location">
                      <strong>Location:</strong> {doctor.locationDiv}
                    </p>
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
              with Dr. {selectedDoctor.name}
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
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
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
        </main>
       
      </div>  
      
    </div>
  );
}
