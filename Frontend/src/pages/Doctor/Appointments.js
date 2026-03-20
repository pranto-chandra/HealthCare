import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import doctorApi from "../../api/doctorApi";
import RecommendTest from "./RecommendTest";
import { getErrorMessage } from "../../utils/helpers";
import "./Appointments.css";

export default function Appointments() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [appointmentTimes, setAppointmentTimes] = useState({}); // Track time for each appointment
  const [completingId, setCompletingId] = useState(null); // Track which appointment is being completed
  const [showTestForm, setShowTestForm] = useState(null); // Track which appointment to recommend test for

  // Get doctorId from user's doctorProfile
  const doctorId = user?.doctorProfile?.id;

  // Fetch doctor appointments
  useEffect(() => {
    if (!user) return;

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await doctorApi.getMyAppointments();
        const appointmentData = res?.data?.data || [];
        setAppointments(appointmentData);
      } catch (err) {
        setError(getErrorMessage(err));
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  // Handle appointment confirmation
  const handleConfirmAppointment = async (appointmentId, status) => {
    // For CONFIRMED status, time is required
    if (status === "CONFIRMED" && !appointmentTimes[appointmentId]) {
      alert("Please select a time for this appointment");
      return;
    }

    try {
      setConfirmingId(appointmentId);
      const confirmData = { status };

      // Add time if confirming
      if (status === "CONFIRMED") {
        confirmData.time = appointmentTimes[appointmentId];
      }

      await doctorApi.confirmAppointment(
        appointmentId,
        confirmData.status,
        confirmData.time,
      );

      // Update local state
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId ? { ...app, status } : app,
        ),
      );

      // Clear the time input for this appointment
      setAppointmentTimes((prev) => {
        const newTimes = { ...prev };
        delete newTimes[appointmentId];
        return newTimes;
      });
    } catch (err) {
      alert(getErrorMessage(err));
      console.error("Error confirming appointment:", err);
    } finally {
      setConfirmingId(null);
    }
  };

  // Handle appointment completion
  const handleCompleteAppointment = async (appointmentId) => {
    if (!window.confirm("Mark this appointment as completed?")) {
      return;
    }

    try {
      setCompletingId(appointmentId);
      await doctorApi.completeAppointment(appointmentId);

      // Update local state
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId ? { ...app, status: "COMPLETED" } : app,
        ),
      );
    } catch (err) {
      alert(getErrorMessage(err));
      console.error("Error completing appointment:", err);
    } finally {
      setCompletingId(null);
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((app) => {
    const matchStatus = filterStatus === "All" || app.status === filterStatus;
    const matchDate =
      !selectedDate ||
      new Date(app.scheduledAt).toISOString().split("T")[0] === selectedDate;
    return matchStatus && matchDate;
  });

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "pending";
      case "CONFIRMED":
        return "confirmed";
      case "COMPLETED":
        return "completed";
      case "CANCELLED":
        return "cancelled";
      default:
        return "pending";
    }
  };

  return (
    <div className="doctor-appointments-page">
      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div
        className={`doctor-appointments-layout ${
          isSidebarOpen ? "" : "collapsed"
        }`}
      >
        {isSidebarOpen && <Sidebar role="Doctor" />}

        <main className="doctor-appointments-content">
          <section className="appointments-header">
            <h1>Appointments</h1>
            <p>Manage your upcoming and past appointments.</p>
          </section>

          <section className="filters-section">
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option>All</option>
                <option value="PENDING">Pending Confirmation</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </section>

          {error && <div className="error-message">{error}</div>}

          {loading && <div className="loading">Loading appointments...</div>}

          {!loading && filteredAppointments.length === 0 && (
            <div className="no-appointments">
              <p>No appointments found.</p>
            </div>
          )}

          <section className="appointments-list">
            {filteredAppointments.map((app) => {
              const { date, time } = formatDateTime(app.scheduledAt);
              return (
                <div key={app.id} className="appointment-card">
                  <div className="appointment-info">
                    <div className="patient-info">
                      <h3>Patient: {app.patient?.user?.email}</h3>
                      <p>
                        <strong>Date:</strong> {date}
                      </p>
                      <p>
                        <strong>Time:</strong> {time}
                      </p>
                      <p>
                        <strong>Type:</strong> {app.type}
                      </p>
                      {app.symptoms && (
                        <p>
                          <strong>Symptoms:</strong> {app.symptoms}
                        </p>
                      )}
                    </div>
                    <div className="status-section">
                      <span
                        className={`status-badge ${getStatusColor(app.status)}`}
                      >
                        {app.status}
                      </span>

                      {app.status === "PENDING" && (
                        <div>
                          <div className="time-input-group">
                            <label htmlFor={`time-${app.id}`}>
                              Select Time:
                            </label>
                            <input
                              id={`time-${app.id}`}
                              type="time"
                              value={appointmentTimes[app.id] || "10:00"}
                              onChange={(e) =>
                                setAppointmentTimes((prev) => ({
                                  ...prev,
                                  [app.id]: e.target.value,
                                }))
                              }
                              className="time-input"
                            />
                          </div>
                          <div className="action-buttons">
                            <button
                              className="confirm-btn"
                              onClick={() =>
                                handleConfirmAppointment(app.id, "CONFIRMED")
                              }
                              disabled={confirmingId === app.id}
                            >
                              {confirmingId === app.id
                                ? "Confirming..."
                                : "Confirm"}
                            </button>
                            <button
                              className="reject-btn"
                              onClick={() =>
                                handleConfirmAppointment(app.id, "CANCELLED")
                              }
                              disabled={confirmingId === app.id}
                            >
                              {confirmingId === app.id
                                ? "Rejecting..."
                                : "Reject"}
                            </button>
                          </div>
                        </div>
                      )}

                      {app.status === "CONFIRMED" && (
                        <div className="confirmed-actions">
                          <button
                            className="complete-btn"
                            onClick={() => handleCompleteAppointment(app.id)}
                            disabled={completingId === app.id}
                          >
                            {completingId === app.id
                              ? "Completing..."
                              : "✓ Mark Complete"}
                          </button>
                        </div>
                      )}

                      {app.status === "COMPLETED" && (
                        <div className="completed-actions">
                          <button
                            className="prescribe-test-btn"
                            onClick={() => setShowTestForm(app.id)}
                          >
                            📋 Prescribe Test
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Test Recommendation Form */}
                  {showTestForm === app.id && doctorId && (
                    <RecommendTest
                      appointmentId={app.id}
                      patientId={app.patientId}
                      doctorId={doctorId}
                      onTestRecommended={() => {
                        setShowTestForm(null);
                        setAppointments((prev) =>
                          prev.map((a) =>
                            a.id === app.id
                              ? { ...a, testRecommended: true }
                              : a
                          )
                        );
                      }}
                      onCancel={() => setShowTestForm(null)}
                    />
                  )}
                </div>
              );
            })}
          </section>
        </main>
      </div>
    </div>
  );
}
