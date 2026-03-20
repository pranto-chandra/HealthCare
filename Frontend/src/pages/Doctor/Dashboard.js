import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import labApi from "../../api/labApi";
import { getErrorMessage } from "../../utils/helpers";
import "./Dashboard.css";

export default function DoctorDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useContext(AuthContext);
  const [testStats, setTestStats] = useState({
    recommended: 0,
    pending: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  const getDoctorName = () => {
    if (user?.doctorProfile?.name) {
      return `Dr. ${user.doctorProfile.name}`;
    }
    return "Doctor";
  };

  // Fetch test statistics
  useEffect(() => {
    if (!user?.doctorProfile?.id) return;

    const fetchTestStats = async () => {
      try {
        setLoading(true);
        const response = await labApi.getDoctorRecommendedTests(
          user.doctorProfile.id,
        );
        const tests = response?.data?.data || [];

        const stats = {
          recommended: tests.filter((t) => t.status === "RECOMMENDED").length,
          pending: tests.filter((t) => t.status === "PENDING").length,
          completed: tests.filter((t) => t.status === "REPORT_ADDED").length,
        };
        setTestStats(stats);
      } catch (err) {
        console.error("Error fetching test stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestStats();
  }, [user?.doctorProfile?.id]);

  return (
    <div className="doctor-dashboard">
      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div className={`dashboard-layout ${isSidebarOpen ? "" : "collapsed"}`}>
        {isSidebarOpen && <Sidebar role="Doctor" />}

        <main className="dashboard-content">
          <section className="welcome-section">
            <h1>Welcome, {getDoctorName()} 👨‍⚕️</h1>
            <p>Your patients are waiting for expert care today.</p>
          </section>

          <section className="cards-section">
            <div className="info-card">
              <h3>Today's Appointments</h3>
              <p>12 scheduled</p>
            </div>

            <div className="info-card">
              <h3>Pending Prescriptions</h3>
              <p>5 to review</p>
            </div>

            <div className="info-card">
              <h3>New Patient Records</h3>
              <p>3 updated</p>
            </div>
          </section>

          <section className="cards-section">
            <div className="info-card">
              <h3>📋 Test Recommendations</h3>
              <p>{testStats.recommended} recommended</p>
            </div>

            <div className="info-card">
              <h3>⏳ Tests in Progress</h3>
              <p>{testStats.pending} pending</p>
            </div>

            <div className="info-card">
              <h3>✅ Test Results Ready</h3>
              <p>{testStats.completed} completed</p>
            </div>
          </section>

          <section className="reports-section">
            <h2>Recent Activities</h2>
            <ul>
              <li>
                ✅ Appointment with <b>Mr. Ahmed</b> completed.
              </li>
              <li>
                💊 Prescription updated for <b>Ms. Nabila</b>.
              </li>
              <li>
                🩺 Health report submitted for <b>Mr. Karim</b>.
              </li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
