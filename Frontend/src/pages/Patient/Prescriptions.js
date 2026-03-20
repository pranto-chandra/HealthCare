import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import labApi from "../../api/labApi";
import { AuthContext } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/helpers";
import "./Prescription.css";

export default function Prescriptions() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useContext(AuthContext);
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("medications"); // medications or lab-tests

  // Fetch lab tests
  useEffect(() => {
    if (!user?.patientProfile?.id) return;

    const fetchLabTests = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await labApi.getPatientTests(user.patientProfile.id);
        setLabTests(response?.data?.data || []);
      } catch (err) {
        setError(getErrorMessage(err));
        console.error("Error fetching lab tests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLabTests();
  }, [user?.patientProfile?.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "RECOMMENDED":
        return "status-warning";
      case "PENDING":
        return "status-info";
      case "REPORT_ADDED":
        return "status-success";
      default:
        return "status-secondary";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      RECOMMENDED: "Recommended",
      PENDING: "Processing",
      REPORT_ADDED: "Report Ready",
    };
    return labels[status] || status;
  };

  return (
    <div className="prescription-page">
      {/* Toggle Sidebar */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>
      <div
        className={`prescription-layout  ${
          isSidebarOpen ? "" : "collapsed"
        }`}
      >
        {isSidebarOpen && <Sidebar role="Patient" />}

        <main className="prescription-content">
          <section className="prescription-header">
            <h1>My Prescriptions & Test Orders</h1>
            <p>Review your medications and lab test prescriptions.</p>
          </section>

          {/* Tab Navigation */}
          <div className="prescription-tabs">
            <button
              className={`tab-btn ${activeTab === "medications" ? "active" : ""}`}
              onClick={() => setActiveTab("medications")}
            >
              💊 Medications
            </button>
            <button
              className={`tab-btn ${activeTab === "lab-tests" ? "active" : ""}`}
              onClick={() => setActiveTab("lab-tests")}
            >
              🧪 Lab Tests
            </button>
          </div>

          {/* Medications Tab */}
          {activeTab === "medications" && (
            <section className="prescription-list">
              <div className="prescription-card">
                <h3>Amoxicillin</h3>
                <p>Dosage: 500mg, twice daily</p>
                <p>Prescribed by: Dr. Rahman</p>
                <p>Start Date: Nov 10, 2025</p>
                <p>Status: Active</p>
              </div>

              <div className="prescription-card">
                <h3>Metformin</h3>
                <p>Dosage: 850mg, once daily</p>
                <p>Prescribed by: Dr. Karim</p>
                <p>Start Date: Oct 5, 2025</p>
                <p>Status: Active</p>
              </div>

              <div className="prescription-card">
                <h3>Ibuprofen</h3>
                <p>Dosage: 400mg, as needed</p>
                <p>Prescribed by: Dr. Nahar</p>
                <p>Start Date: Sep 20, 2025</p>
                <p>Status: Completed</p>
              </div>
            </section>
          )}

          {/* Lab Tests Tab */}
          {activeTab === "lab-tests" && (
            <section className="prescription-list">
              {loading && <div className="loading-text">Loading lab tests...</div>}
              {error && <div className="error-message">{error}</div>}
              
              {!loading && labTests.length === 0 && (
                <div className="no-data">
                  <p>No lab tests prescribed yet.</p>
                </div>
              )}

              {!loading &&
                labTests.map((test) => (
                  <div key={test.id} className="prescription-card lab-test-card">
                    <div className="test-header">
                      <h3>{test.testName}</h3>
                      <span className={`status-badge ${getStatusColor(test.status)}`}>
                        {getStatusLabel(test.status)}
                      </span>
                    </div>

                    <p>
                      <strong>Prescribed by:</strong> Dr. {test.doctor?.name || "Unknown"}
                    </p>

                    {test.pathologist && (
                      <p>
                        <strong>Lab:</strong> {test.pathologist.labName || test.pathologist.name}
                      </p>
                    )}

                    {test.description && (
                      <p>
                        <strong>Description:</strong> {test.description}
                      </p>
                    )}

                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(test.recommendedAt).toLocaleDateString()}
                    </p>

                    {test.reportNotes && (
                      <p>
                        <strong>Notes:</strong> {test.reportNotes}
                      </p>
                    )}

                    {test.status === "REPORT_ADDED" && test.resultFile && (
                      <div className="test-actions">
                        <a
                          href={`/${test.resultFile}`}
                          className="download-btn"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📄 Download Report
                        </a>
                      </div>
                    )}
                  </div>
                ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}