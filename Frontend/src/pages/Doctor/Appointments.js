import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import doctorApi from "../../api/doctorApi";
import RecommendTest from "./RecommendTest";
import { getErrorMessage } from "../../utils/helpers";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import "./Appointments.css";
import Button from "@mui/material/Button";

export default function Appointments() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Per-appointment error state for confirmation
  const [confirmErrors, setConfirmErrors] = useState({});
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [appointmentTimes, setAppointmentTimes] = useState({}); // Track time for each appointment
  const [videoLinks, setVideoLinks] = useState({}); // Track video links for each appointment
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
    const appointment = appointments.find((app) => app.id === appointmentId);
    const videoLink = videoLinks[appointmentId]?.trim();

    // For CONFIRMED status, time is required
    if (status === "CONFIRMED" && !appointmentTimes[appointmentId]) {
      setConfirmErrors((prev) => ({
        ...prev,
        [appointmentId]:
          "Please select a time before confirming the appointment.",
      }));
      return;
    }

    // For online appointments, require a video link when confirming
    if (
      status === "CONFIRMED" &&
      appointment?.type === "ONLINE" &&
      !videoLink
    ) {
      setConfirmErrors((prev) => ({
        ...prev,
        [appointmentId]:
          "Please provide a video link before confirming the online appointment.",
      }));
      return;
    }

    setConfirmErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[appointmentId];
      return newErrors;
    });

    try {
      setConfirmingId(appointmentId);
      const confirmData = { status };

      if (status === "CONFIRMED") {
        confirmData.time = appointmentTimes[appointmentId];
      }

      if (status === "CONFIRMED" && videoLink) {
        confirmData.videoLink = videoLink;
      }

      await doctorApi.confirmAppointment(
        appointmentId,
        confirmData.status,
        confirmData.time,
        confirmData.videoLink,
      );

      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId
            ? {
                ...app,
                status,
                scheduledAt: app.scheduledAt,
                videoLink: confirmData.videoLink || app.videoLink,
              }
            : app,
        ),
      );

      setAppointmentTimes((prev) => {
        const newTimes = { ...prev };
        delete newTimes[appointmentId];
        return newTimes;
      });

      if (videoLink) {
        setVideoLinks((prev) => {
          const newLinks = { ...prev };
          delete newLinks[appointmentId];
          return newLinks;
        });
      }
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
          app.id === appointmentId
            ? { ...app, status: "COMPLETED", videoLink: null }
            : app,
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

          {/* Global error (not per-appointment) */}
          {error && (
            <Stack sx={{ width: "100%" }} spacing={2}>
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            </Stack>
          )}

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
                      <h3>Patient: {app.patient?.name}</h3>
                      <p>
                        <strong>Date:</strong> {date}
                      </p>
                      <p>
                        <strong>Time:</strong> {time}
                      </p>
                      <p>
                        <strong>Type:</strong> {app.type}
                      </p>
                      {app.status === "COMPLETED" ? (
                        <p>
                          <strong>Note:</strong> Appointment is over.
                        </p>
                      ) : app.videoLink ? (
                        <p>
                          <strong>Video link:</strong>{" "}
                          <a href={app.videoLink?.startsWith('http') ? app.videoLink : `https://${app.videoLink}`} target="_blank" rel="noreferrer">
                            Join call
                          </a>
                        </p>
                      ) : null}
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
                          {app.type === "ONLINE" && (
                            <div className="video-link-input-group">
                              <label htmlFor={`videoLink-${app.id}`}>
                                Video call link:
                              </label>
                              <input
                                id={`videoLink-${app.id}`}
                                type="url"
                                placeholder="https://meet.example.com/..."
                                value={videoLinks[app.id] || app.videoLink || ""}
                                onChange={(e) =>
                                  setVideoLinks((prev) => ({
                                    ...prev,
                                    [app.id]: e.target.value,
                                  }))
                                }
                                className="video-link-input"
                              />
                            </div>
                          )}
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
                          {/* Per-appointment error message */}
                          {confirmErrors[app.id] && (
                            <Stack
                              sx={{ width: "100%", marginTop: 1 }}
                              spacing={1}
                            >
                              <Alert
                                severity="error"
                                onClose={() =>
                                  setConfirmErrors((prev) => {
                                    const n = { ...prev };
                                    delete n[app.id];
                                    return n;
                                  })
                                }
                              >
                                {confirmErrors[app.id]}
                              </Alert>
                            </Stack>
                          )}
                        </div>
                      )}

                      {app.status === "CONFIRMED" && (
                        <div className="confirmed-actions">
                          {app.type === "ONLINE" && app.videoLink && (
                            <div className="confirmed-video-link">
                              <strong>Video link:</strong>{" "}
                              <a
                                href={app.videoLink?.startsWith('http') ? app.videoLink : `https://${app.videoLink}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Button variant="outlined" color="primary">
                                  Join call
                                </Button>
                              </a>
                            </div>
                          )}
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
                          <p className="appointment-over-text">
                            Appointment is over.
                          </p>
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
                              : a,
                          ),
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
