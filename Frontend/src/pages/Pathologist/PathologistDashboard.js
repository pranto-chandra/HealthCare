import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import labApi from "../../api/labApi";
import { getErrorMessage } from "../../utils/helpers";
import "./PathologistDashboard.css";

export default function PathologistDashboard() {
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("recommended");
  const [selectedTest, setSelectedTest] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportNotes, setReportNotes] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch tests
  useEffect(() => {
    if (!user) return;
    fetchTests();
  }, [user, activeTab]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError("");

      let response;
      if (activeTab === "recommended") {
        // Get all unassigned tests with RECOMMENDED status
        response = await labApi.getRecommendedTests("RECOMMENDED");
      } else if (activeTab === "pending") {
        // Get all tests assigned to this pathologist (any status)
        response = await labApi.getMyTests();
      } else if (activeTab === "completed") {
        // Get all tests assigned to this pathologist with REPORT_ADDED status
        response = await labApi.getMyTests();
        // Filter client-side to only show completed tests
        const allTests = response?.data?.data || [];
        response.data.data = allTests.filter(
          (t) => t.status === "REPORT_ADDED",
        );
      }

      setTests(response?.data?.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error("Error fetching tests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTest = async (testId) => {
    try {
      setSubmitting(true);
      await labApi.acceptTest(testId);
      setError("");
      // Refresh tests
      fetchTests();
    } catch (err) {
      setError(getErrorMessage(err));
      console.error("Error accepting test:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportFile) {
      setError("Please select a file to upload");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("reportFile", reportFile);
      formData.append("reportNotes", reportNotes);

      await labApi.addTestReport(selectedTest.id, formData);
      setError("");
      setShowReportModal(false);
      setReportNotes("");
      setReportFile(null);
      fetchTests();
    } catch (err) {
      setError(getErrorMessage(err));
      console.error("Error submitting report:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "RECOMMENDED":
        return "badge-warning";
      case "PENDING":
        return "badge-info";
      case "COMPLETED":
        return "badge-primary";
      case "REPORT_ADDED":
        return "badge-success";
      default:
        return "badge-secondary";
    }
  };

  return (
    <div className="pathologist-dashboard">
      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div className={`dashboard-layout ${isSidebarOpen ? "" : "collapsed"}`}>
        {isSidebarOpen && <Sidebar role="Pathologist" />}

        <main className="dashboard-content">
          <section className="welcome-section">
            <h1>Pathologist Dashboard 🔬</h1>
            <p>Review and process lab test results</p>
          </section>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === "recommended" ? "active" : ""}`}
              onClick={() => setActiveTab("recommended")}
            >
              Recommended (
              {tests.filter((t) => t.status === "RECOMMENDED").length})
            </button>
            <button
              className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              My Tests ({tests.filter((t) => t.status === "PENDING").length})
            </button>
            <button
              className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
              onClick={() => setActiveTab("completed")}
            >
              Completed (
              {tests.filter((t) => t.status === "REPORT_ADDED").length})
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading tests...</div>
          ) : tests.length === 0 ? (
            <div className="no-data">No tests found</div>
          ) : (
            <div className="tests-container">
              {tests.map((test) => (
                <div key={test.id} className="test-card">
                  <div className="test-header">
                    <div className="test-info">
                      <h3>{test.testName}</h3>
                      <p className="test-patient">
                        Patient: {test.patient.name}
                      </p>
                      <p className="test-doctor">Doctor: {test.doctor.name}</p>
                    </div>
                    <span
                      className={`badge ${getStatusBadgeColor(test.status)}`}
                    >
                      {test.status}
                    </span>
                  </div>

                  <div className="test-details">
                    <p>
                      <strong>Description:</strong> {test.description}
                    </p>
                    {test.appointment && (
                      <p>
                        <strong>Diagnosis:</strong>{" "}
                        {test.appointment.diagnosis || "N/A"}
                      </p>
                    )}
                    {test.reportNotes && (
                      <p>
                        <strong>Report Notes:</strong> {test.reportNotes}
                      </p>
                    )}
                  </div>

                  <div className="test-actions">
                    {test.status === "RECOMMENDED" && (
                      <button
                        onClick={() => handleAcceptTest(test.id)}
                        className="btn btn-primary"
                        disabled={submitting}
                      >
                        {submitting ? "Accepting..." : "Accept Test"}
                      </button>
                    )}
                    {test.status === "PENDING" && (
                      <button
                        onClick={() => {
                          setSelectedTest(test);
                          setShowReportModal(true);
                        }}
                        className="btn btn-success"
                      >
                        Add Report
                      </button>
                    )}
                    {test.status === "REPORT_ADDED" && test.resultFile && (
                      <a
                        href={`/${test.resultFile}`}
                        className="btn btn-info"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download Report
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Report Modal */}
          {showReportModal && selectedTest && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h2>Add Test Report</h2>
                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      setReportNotes("");
                      setReportFile(null);
                    }}
                    className="close-btn"
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-body">
                  <p>
                    <strong>Test:</strong> {selectedTest.testName}
                  </p>
                  <p>
                    <strong>Patient:</strong> {selectedTest.patient.name}
                  </p>

                  <div className="form-group">
                    <label htmlFor="reportFile">Report File (PDF/Image):</label>
                    <input
                      type="file"
                      id="reportFile"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setReportFile(e.target.files[0])}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reportNotes">Notes:</label>
                    <textarea
                      id="reportNotes"
                      value={reportNotes}
                      onChange={(e) => setReportNotes(e.target.value)}
                      placeholder="Add any additional notes about the test results"
                      className="form-control"
                      rows="4"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      setReportNotes("");
                      setReportFile(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    className="btn btn-success"
                    disabled={submitting || !reportFile}
                  >
                    {submitting ? "Submitting..." : "Submit Report"}
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
