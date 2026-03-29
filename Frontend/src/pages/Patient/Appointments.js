import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import appointmentApi from "../../api/appointmentApi";
import patientApi from "../../api/patientApi";
import { getErrorMessage } from "../../utils/helpers";
import "./Appointments.css";

export default function Appointments() {
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patientId, setPatientId] = useState(null);

  // Fetch patient ID and appointments
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Get patient ID
        const patientRes = await patientApi.getPatientByUserId(user.id);
        const pId = patientRes?.data?.data?.id || user.id;
        setPatientId(pId);

        // Get appointments
        const appointmentRes = await appointmentApi.getAppointments(pId);
        const appointmentData = appointmentRes?.data?.data || [];

        // Sort by scheduled date descending
        appointmentData.sort(
          (a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt),
        );

        setAppointments(appointmentData);
      } catch (err) {
        setError(getErrorMessage(err));
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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

  // Get upcoming appointment (first confirmed appointment in future)
  const upcomingAppointment = appointments.find(
    (app) =>
      app.status === "CONFIRMED" && new Date(app.scheduledAt) > new Date(),
  );

  // Get status color class
  const getStatusClass = (status) => {
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

  // Get doctor name
  const getDoctorName = (doctor) => {
    if (doctor?.name) {
      return `Dr. ${doctor.name}`;
    }
    return doctor?.user?.email || "Unknown Doctor";
  };

  return (
    <div className="appointments-page">
      {/* Toggle Sidebar */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div
        className={`appointments-layout ${isSidebarOpen ? "" : "collapsed"}`}
      >
        {isSidebarOpen && <Sidebar role="Patient" />}

        {/* MAIN CONTENT */}
        <main className="appointments-content">
          <section className="appointment-header">
            <h1>Your Appointments</h1>
          </section>

          {error && <div className="error-message">{error}</div>}

          {loading && <div className="loading">Loading appointments...</div>}

          {!loading && (
            <>
              {/* --- Upcoming Card Section --- */}
              <section className="upcoming-section">
                <h2>Upcoming Appointment</h2>

                {upcomingAppointment ? (
                  <div className="upcoming-card">
                    <p>
                      <strong>Doctor:</strong>{" "}
                      {getDoctorName(upcomingAppointment.doctor)}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {formatDateTime(upcomingAppointment.scheduledAt).date}
                    </p>
                    <p>
                      <strong>Time:</strong>{" "}
                      {formatDateTime(upcomingAppointment.scheduledAt).time}
                    </p>
                    <p>
                      <strong>Type:</strong> {upcomingAppointment.type}
                    </p>
                    {upcomingAppointment.videoLink && (
                      <p>
                        <strong>Video Link:</strong>{" "}
                        <a
                          href={upcomingAppointment.videoLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Join Call
                        </a>
                      </p>
                    )}
                    <span
                      className={`status ${getStatusClass(
                        upcomingAppointment.status,
                      )}`}
                    >
                      {upcomingAppointment.status}
                    </span>
                  </div>
                ) : (
                  <p>No upcoming confirmed appointments.</p>
                )}
              </section>

              {/* --- Table of All Appointments --- */}
              <section className="table-section">
                <h2>Appointment History</h2>

                {appointments.length === 0 ? (
                  <p>No appointments found.</p>
                ) : (
                  <table className="appointments-table">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Video Link</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {appointments.map((app) => {
                        const { date, time } = formatDateTime(app.scheduledAt);
                        return (
                          <tr key={app.id}>
                            <td>{getDoctorName(app.doctor)}</td>
                            <td>{date}</td>
                            <td>{time}</td>
                            <td>{app.type}</td>
                            <td>
                              {app.status === "COMPLETED" ? (
                                "Appointment over"
                              ) : app.videoLink ? (
                                <a href={app.videoLink} target="_blank" rel="noreferrer">
                                  Join
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td>
                              <span
                                className={`status ${getStatusClass(
                                  app.status,
                                )}`}
                              >
                                {app.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
