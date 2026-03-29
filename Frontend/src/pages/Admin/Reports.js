import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { getAnalytics } from "../../api/adminApi";
import "./Reports.css";

export default function Reports() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dateRange, setDateRange] = useState("month"); // month, quarter, year
  const [reportType, setReportType] = useState("all"); // all, appointments, users, doctors, financial

  // State for real data
  const [analytics, setAnalytics] = useState(null);

  // Statistics state
  const [stats, setStats] = useState([
    { title: "Total Users", value: 0, icon: "👥", change: "+0%" },
    { title: "Active Doctors", value: 0, icon: "👨‍⚕️", change: "+0%" },
    { title: "Total Patients", value: 0, icon: "🏥", change: "+0%" },
    {
      title: "This Month Appointments",
      value: 0,
      icon: "📅",
      change: "+0%",
    },
    { title: "Pathologists", value: 0, icon: "🔬", change: "+0%" },
    { title: "Lab Tests Completed", value: 0, icon: "✓", change: "+0%" },
  ]);
   
  const [doctorSpecialties, setDoctorSpecialties] = useState([]);

  // Reports data
  const [reports, setReports] = useState([
    {
      id: 1,
      name: "Monthly Appointments Report",
      date: "2026-03-01",
      type: "appointments",
      downloads: 12,
      size: "2.4 MB",
    },
    {
      id: 2,
      name: "User Activity Summary",
      date: "2026-02-01",
      type: "users",
      downloads: 8,
      size: "1.8 MB",
    },
    {
      id: 3,
      name: "Doctor Performance Report",
      date: "2026-02-15",
      type: "doctors",
      downloads: 15,
      size: "3.1 MB",
    },
    {
      id: 4,
      name: "Financial Summary",
      date: "2026-03-01",
      type: "financial",
      downloads: 5,
      size: "1.5 MB",
    },
    {
      id: 5,
      name: "Lab Test Analytics",
      date: "2026-02-28",
      type: "lab",
      downloads: 10,
      size: "2.8 MB",
    },
  ]);

  // Monthly appointment data
  const appointmentTrend = [
    { month: "Jan", count: 95, completed: 88 },
    { month: "Feb", count: 112, completed: 105 },
    { month: "Mar", count: 128, completed: 120 },
  ];

  // Load reports on mount
  useEffect(() => {
    loadReports();
  }, [dateRange, reportType]);

  const loadReports = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch analytics data from backend
      const analyticsRes = await getAnalytics();
      const analyticsData = analyticsRes.data?.data;

      setAnalytics(analyticsData);

      // Update stats with real data from analytics
      setStats([
        {
          title: "Total Users",
          value: analyticsData?.counts?.users || 0,
          icon: "👥",
          change: "+0%",
        },
        {
          title: "Active Doctors",
          value: analyticsData?.counts?.doctors || 0,
          icon: "👨‍⚕️",
          change: "+0%",
        },
        {
          title: "Total Patients",
          value: analyticsData?.counts?.patients || 0,
          icon: "🏥",
          change: "+0%",
        },
        {
          title: "Total Appointments",
          value: analyticsData?.counts?.appointments || 0,
          icon: "📅",
          change: "+0%",
        },
        {
          title: "Pathologists",
          value: analyticsData?.counts?.pathologists || 0,
          icon: "🔬",
          change: "+0%",
        },
        {
          title: "Lab Tests Completed",
          value: analyticsData?.counts?.labTestsCompleted || 0,
          icon: "✓",
          change: "+0%",
        },
      ]);

      // Transform backend data to frontend format
      if (analyticsData?.doctorsBySpecialty) {
        const specialties = analyticsData.doctorsBySpecialty.map((spec) => ({
          specialty: spec.name,
          count: spec._count.doctors,
          patients: 0, // Backend doesn't provide this, so default to 0
        }));
        setDoctorSpecialties(specialties);
      }

      setError("");
    } catch (err) {
      setError("Failed to load reports data. Please try again.");
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = (reportId) => {
    setSuccess("");
    try {
      // TODO: Replace with actual API call
      // await adminApi.downloadReport(reportId);

      setSuccess("Report downloaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to download report");
    }
  };

  const handleGenerateReport = async (type) => {
    setLoading(true);
    setError("");
    try {
      // TODO: Replace with actual API call
      // const response = await adminApi.generateReport(type, dateRange);

      setSuccess(`${type} report generated successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    if (reportType === "all") return true;
    return report.type === reportType;
  });

  return (
    <div className="admin-reports-page">
      {/* Sidebar Toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div
        className={`admin-reports-layout ${isSidebarOpen ? "" : "collapsed"}`}
      >
        {isSidebarOpen && <Sidebar role="Admin" />}

        <main className="admin-reports-content">
          <h1 className="page-title">📊 System Reports & Analytics</h1>

          {/* Alerts */}
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Filter Controls */}
          <div className="filter-bar">
            <div className="filter-group">
              <label>Date Range:</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                disabled={loading}
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Report Type:</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                disabled={loading}
              >
                <option value="all">All Reports</option>
                <option value="appointments">Appointments</option>
                <option value="users">Users</option>
                <option value="doctors">Doctors</option>
                <option value="financial">Financial</option>
                <option value="lab">Lab Tests</option>
              </select>
            </div>
          </div>

          {/* Statistics Cards */}
          <section className="stats-section">
            {stats.map((item, index) => (
              <div className="stat-card" key={index}>
                <div className="stat-icon">{item.icon}</div>
                <div className="stat-content">
                  <h3>{item.value.toLocaleString()}</h3>
                  <p>{item.title}</p>
                  <span className="stat-change">{item.change}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Quick Generate Reports */}
          <section className="quick-actions">
            <h2>Generate New Report</h2>
            <div className="action-buttons">
              <button
                className="action-btn"
                onClick={() => handleGenerateReport("appointments")}
                disabled={loading}
              >
                📅 Appointments
              </button>
              <button
                className="action-btn"
                onClick={() => handleGenerateReport("users")}
                disabled={loading}
              >
                👥 Users
              </button>
              <button
                className="action-btn"
                onClick={() => handleGenerateReport("doctors")}
                disabled={loading}
              >
                👨‍⚕️ Doctors
              </button>
              <button
                className="action-btn"
                onClick={() => handleGenerateReport("financial")}
                disabled={loading}
              >
                💰 Financial
              </button>
              <button
                className="action-btn"
                onClick={() => handleGenerateReport("lab")}
                disabled={loading}
              >
                🔬 Lab Tests
              </button>
            </div>
          </section>

          {/* Appointment Trend */}
          <section className="analytics-section">
            <h2>Appointment Trend</h2>
            <div className="trend-chart">
              {appointmentTrend.map((item, idx) => (
                <div key={idx} className="trend-item">
                  <div className="trend-bars">
                    <div className="bar-group">
                      <div
                        className="bar total"
                        style={{ height: `${(item.count / 150) * 100}%` }}
                        title={`Total: ${item.count}`}
                      ></div>
                      <label>{item.month}</label>
                    </div>
                    <div className="legend-entry">
                      <span className="dot total"></span> Total: {item.count}
                    </div>
                    <div className="legend-entry">
                      <span className="dot completed"></span> Completed:{" "}
                      {item.completed}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Doctor Specialization */}
          <section className="analytics-section">
            <h2>Doctor Distribution by Specialty</h2>
            <div className="specialties-grid">
              {doctorSpecialties.map((spec, idx) => (
                <div key={idx} className="specialty-card">
                  <h4>{spec.specialty}</h4>
                  <div className="specialty-stats">
                    <div className="stat-row">
                      <span>Doctors:</span>
                      <strong>{spec.count}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Patients:</span>
                      <strong>{spec.patients}</strong>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(spec.count / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reports List */}
          <section className="reports-section">
            <h2>Generated Reports</h2>
            {loading ? (
              <div className="loading">Loading reports...</div>
            ) : filteredReports.length > 0 ? (
              <div className="reports-table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Report Name</th>
                      <th>Date Generated</th>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Downloads</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.name}</td>
                        <td>{new Date(report.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge badge-${report.type}`}>
                            {report.type}
                          </span>
                        </td>
                        <td>{report.size}</td>
                        <td>{report.downloads}</td>
                        <td className="actions">
                          <button
                            className="download-btn"
                            onClick={() => handleDownloadReport(report.id)}
                            disabled={loading}
                          >
                            ⬇️ Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data">
                No reports found for selected filters
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
