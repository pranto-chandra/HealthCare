import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import labApi from "../../api/labApi";
import { getErrorMessage } from "../../utils/helpers";
import "./TestResults.css";

export default function TestResults() {
  const { user } = useContext(AuthContext);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, recommended, pending, completed
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const doctorId = user?.doctorProfile?.id;

  // Fetch doctor's recommended tests
  useEffect(() => {
    if (!doctorId) return;

    const fetchTests = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await labApi.getDoctorRecommendedTests(doctorId);
        setTests(response?.data?.data || []);
      } catch (err) {
        setError(getErrorMessage(err));
        console.error("Error fetching test results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [doctorId]);

  // Filter tests
  const getFilteredTests = () => {
    if (filterStatus === "all") {
      return tests;
    }
    return tests.filter((t) => t.status === filterStatus.toUpperCase());
  };

  const getStatusBadge = (status) => {
    const badges = {
      RECOMMENDED: {
        className: "badge-warning",
        label: "Recommended",
        icon: "📋",
      },
      PENDING: { className: "badge-info", label: "Processing", icon: "⏳" },
      REPORT_ADDED: {
        className: "badge-success",
        label: "Report Ready",
        icon: "✅",
      },
    };
    const badge = badges[status] || {
      className: "badge-secondary",
      label: status,
      icon: "•",
    };
    return (
      <span className={`badge ${badge.className}`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  const getStatusStats = () => {
    return {
      all: tests.length,
      recommended: tests.filter((t) => t.status === "RECOMMENDED").length,
      pending: tests.filter((t) => t.status === "PENDING").length,
      completed: tests.filter((t) => t.status === "REPORT_ADDED").length,
    };
  };

  const stats = getStatusStats();
  const filtered = getFilteredTests();

  return (
    <div className="doctor-test-results-page">
      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div
        className={`doctor-test-results-layout ${
          isSidebarOpen ? "" : "collapsed"
        }`}
      >
        {isSidebarOpen && <Sidebar role="Doctor" />}

        <main className="test-results-content">
          <section className="results-header">
            <h1>📊 Lab Test Results & Status</h1>
            <p>Track the progress of tests you've recommended to patients.</p>
          </section>

          {/* Stats Section */}
          <section className="results-stats">
            <div className="stat-card">
              <h3>Total Tests</h3>
              <p className="stat-number">{stats.all}</p>
            </div>
            <div className="stat-card">
              <h3>Recommended</h3>
              <p className="stat-number pending">{stats.recommended}</p>
            </div>
            <div className="stat-card">
              <h3>In Progress</h3>
              <p className="stat-number processing">{stats.pending}</p>
            </div>
            <div className="stat-card">
              <h3>Results Ready</h3>
              <p className="stat-number completed">{stats.completed}</p>
            </div>
          </section>

          {/* Filter Section */}
          <section className="filter-section">
            <div className="filter-group">
              <label>Filter by Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Tests ({stats.all})</option>
                <option value="recommended">
                  Recommended ({stats.recommended})
                </option>
                <option value="pending">Processing ({stats.pending})</option>
                <option value="completed">Completed ({stats.completed})</option>
              </select>
            </div>
          </section>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Loading State */}
          {loading && <div className="loading">Loading test results...</div>}

          {/* No Results */}
          {!loading && filtered.length === 0 && (
            <div className="no-results">
              <p>No tests found in this category.</p>
            </div>
          )}

          {/* Results List */}
          <section className="results-list">
            {filtered.map((test) => (
              <div
                key={test.id}
                className={`result-card status-${test.status?.toLowerCase()}`}
              >
                <div className="result-card-header">
                  <div className="result-info">
                    <h3>{test.testName}</h3>
                    <p className="patient-name">
                      Patient: <strong>{test.patient?.user?.email}</strong>
                    </p>
                  </div>
                  {getStatusBadge(test.status)}
                </div>

                <div className="result-card-body">
                  {test.pathologist && (
                    <p>
                      <strong>Lab/Pathologist:</strong>{" "}
                      {test.pathologist.labName || test.pathologist.name}
                    </p>
                  )}

                  {test.description && (
                    <p>
                      <strong>Test Description:</strong> {test.description}
                    </p>
                  )}

                  {test.appointment?.diagnosis && (
                    <p>
                      <strong>Diagnosis:</strong> {test.appointment.diagnosis}
                    </p>
                  )}

                  <div className="result-meta">
                    <p>
                      <strong>Recommended:</strong>{" "}
                      {new Date(test.recommendedAt).toLocaleDateString()}
                    </p>
                    {test.completedAt && (
                      <p>
                        <strong>Completed:</strong>{" "}
                        {new Date(test.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {test.reportNotes && (
                    <div className="report-notes">
                      <p>
                        <strong>Lab Notes:</strong> {test.reportNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="result-card-actions">
                  {test.status === "REPORT_ADDED" && test.resultFile && (
                    <a
                      href={`/${test.resultFile}`}
                      className="btn btn-download"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📄 View Report
                    </a>
                  )}

                  {test.status === "RECOMMENDED" && (
                    <span className="status-info">
                      ⏳ Waiting for pathologist to accept test...
                    </span>
                  )}

                  {test.status === "PENDING" && (
                    <span className="status-info">
                      🔄 Pathologist is processing the test...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
