import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getAnalytics } from "../../api/adminApi";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "./Dashboard.css";

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState({
    counts: {
      users: 0,
      patients: 0,
      doctors: 0,
      appointments: 0,
    },
    appointmentStats: [],
    recentAppointments: [],
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAnalytics();
      if (response.data?.data) {
        setAnalytics(response.data.data);
      }
    } catch (err) {
      setError("Failed to load analytics data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAdminName = () => {
    if (user && user.adminProfile && user.adminProfile.name) {
      return user.adminProfile.name;
    }
    return "Admin";
  };

  const getAppointmentStats = () => {
    const stats = {};
    analytics.appointmentStats.forEach((stat) => {
      stats[stat.status] = stat._count;
    });
    return stats;
  };

  const appointmentStats = getAppointmentStats();

  return (
    <div className="admin-dashboard">
      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>
      <div className={`dashboard-layout ${isSidebarOpen ? "" : "collapsed"}`}>
        {isSidebarOpen && <Sidebar role="Admin" />}

        <main className="dashboard-content">
          <section className="welcome-section">
            <h1>Welcome, {getAdminName()} 🏥</h1>
            <p>Monitor system performance and manage platform resources.</p>
          </section>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading">Loading analytics data...</div>
          ) : (
            <>
              {/* Main Statistics Cards */}
              <section className="cards-section">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <h3>{analytics.counts.users}</h3>
                    <p>Total Users</p>
                    <span className="stat-desc">Active on platform</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">👨‍⚕️</div>
                  <div className="stat-content">
                    <h3>{analytics.counts.doctors}</h3>
                    <p>Registered Doctors</p>
                    <span className="stat-desc">
                      Available for appointments
                    </span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🏥</div>
                  <div className="stat-content">
                    <h3>{analytics.counts.patients}</h3>
                    <p>Total Patients</p>
                    <span className="stat-desc">Using the platform</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <h3>{analytics.counts.appointments}</h3>
                    <p>Total Appointments</p>
                    <span className="stat-desc">Scheduled on platform</span>
                  </div>
                </div>
              </section>

              {/* Appointment Status Breakdown */}
              <section className="appointment-status-section">
                <h2>Appointment Status Breakdown</h2>
                <div className="status-cards">
                  <div className="status-card status-confirmed">
                    <div className="status-value">
                      {appointmentStats["CONFIRMED"] || 0}
                    </div>
                    <div className="status-label">Confirmed</div>
                  </div>
                  <div className="status-card status-pending">
                    <div className="status-value">
                      {appointmentStats["PENDING"] || 0}
                    </div>
                    <div className="status-label">Pending</div>
                  </div>
                  <div className="status-card status-completed">
                    <div className="status-value">
                      {appointmentStats["COMPLETED"] || 0}
                    </div>
                    <div className="status-label">Completed</div>
                  </div>
                  <div className="status-card status-cancelled">
                    <div className="status-value">
                      {appointmentStats["CANCELLED"] || 0}
                    </div>
                    <div className="status-label">Cancelled</div>
                  </div>
                </div>
              </section>

              {/* Recent Appointments */}
              <section className="recent-appointments-section">
                <h2>Recent Appointments</h2>
                {analytics.recentAppointments &&
                analytics.recentAppointments.length > 0 ? (
                  <div className="appointments-table-wrapper">
                    <table className="appointments-table">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Doctor</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recentAppointments.map((apt) => (
                          <tr key={apt.id}>
                            <td>{apt.patient?.name || "N/A"}</td>
                            <td>{apt.doctor?.name || "N/A"}</td>
                            <td>
                              <span className={`status-badge ${apt.status}`}>
                                {apt.status}
                              </span>
                            </td>
                            <td>
                              {new Date(apt.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-data">No recent appointments</div>
                )}
              </section>

              {/* System Analytics */}
              <section className="reports-section">
                <h2>System Insights</h2>
                <ul className="insights-list">
                  <li>
                    📈 <strong>{analytics.counts.doctors}</strong> doctors are
                    available on the platform
                  </li>
                  <li>
                    👥 <strong>{analytics.counts.patients}</strong> patients are
                    registered
                  </li>
                  <li>
                    📅 <strong>{appointmentStats["COMPLETED"] || 0}</strong>{" "}
                    appointments completed
                  </li>
                  <li>
                    ⏳ <strong>{appointmentStats["PENDING"] || 0}</strong>{" "}
                    appointments pending
                  </li>
                </ul>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
