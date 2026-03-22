import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import labApi from "../../api/labApi";
import patientApi from "../../api/patientApi";
import { AuthContext } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/helpers";
import "./Prescription.css";

export default function Prescriptions() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useContext(AuthContext);
  const [medications, setMedications] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("medications"); // medications or lab-tests

  // Fetch prescriptions and lab tests
  useEffect(() => {
    if (!user?.id) return;
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch prescriptions
      try {
        const rxResponse = await patientApi.getMyPrescriptions();
        setMedications(rxResponse?.data?.data || []);
      } catch (err) {
        console.warn("Could not fetch prescriptions:", err);
        setMedications([]);
      }

      // Fetch lab tests
      try {
        if (user?.patientProfile?.id) {
          const testsResponse = await labApi.getPatientTests(
            user.patientProfile.id,
          );
          setLabTests(testsResponse?.data?.data || []);
        }
      } catch (err) {
        console.warn("Could not fetch lab tests:", err);
        setLabTests([]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

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
        className={`prescription-layout  ${isSidebarOpen ? "" : "collapsed"}`}
      >
        {isSidebarOpen && <Sidebar role="Patient" />}

        <main className="prescription-content">
          <section className="prescription-header">
            <h1>💊 My Prescriptions & Lab Tests</h1>
            <p>
              Review your medications and lab test prescriptions from your
              doctors.
            </p>
          </section>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Tab Navigation */}
          <div className="prescription-tabs">
            <button
              className={`tab-btn ${activeTab === "medications" ? "active" : ""}`}
              onClick={() => setActiveTab("medications")}
            >
              💊 Medications ({medications.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "lab-tests" ? "active" : ""}`}
              onClick={() => setActiveTab("lab-tests")}
            >
              🧪 Lab Tests ({labTests.length})
            </button>
          </div>

          {/* Medications Tab */}
          {activeTab === "medications" && (
            <section className="prescription-list">
              {loading && (
                <div className="loading-text">Loading medications...</div>
              )}

              {!loading && medications.length === 0 && (
                <div className="no-data">
                  <p>📋 No prescriptions from doctors yet.</p>
                  <p>
                    Your doctor's prescriptions will appear here once they are
                    created.
                  </p>
                </div>
              )}

              {!loading &&
                medications.map((rx) => (
                  <div key={rx.id} className="prescription-card">
                    <div className="prescription-header-row">
                      <div>
                        <h3>📝 Prescription from Dr. {rx.doctor?.name}</h3>
                        <p className="prescription-date">
                          {new Date(rx.prescriptionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="prescription-details">
                      <p>
                        <strong>Diagnosis:</strong> {rx.diagnosis}
                      </p>
                      <p>
                        <strong>Clinical Notes:</strong> {rx.description}
                      </p>

                      {rx.medications && rx.medications.length > 0 && (
                        <div className="medications-section">
                          <strong>Prescribed Medications:</strong>
                          <ul className="medications-list">
                            {rx.medications.map((med, idx) => (
                              <li key={idx} className="medication-item">
                                <div className="med-name">
                                  {med.medicationName}
                                </div>
                                <div className="med-details">
                                  <span className="dosage">
                                    💉 {med.dosage}
                                  </span>
                                  <span className="frequency">
                                    ⏰ {med.frequency}
                                  </span>
                                  <span className="duration">
                                    📅 {med.duration}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </section>
          )}

          {/* Lab Tests Tab */}
          {activeTab === "lab-tests" && (
            <section className="prescription-list">
              {loading && (
                <div className="loading-text">Loading lab tests...</div>
              )}

              {!loading && labTests.length === 0 && (
                <div className="no-data">
                  <p>🧪 No lab tests prescribed yet.</p>
                </div>
              )}

              {!loading &&
                labTests.map((test) => (
                  <div
                    key={test.id}
                    className="prescription-card lab-test-card"
                  >
                    <div className="test-header">
                      <h3>{test.testName}</h3>
                      <span
                        className={`status-badge ${getStatusColor(test.status)}`}
                      >
                        {getStatusLabel(test.status)}
                      </span>
                    </div>

                    <p>
                      <strong>Prescribed by:</strong> Dr.{" "}
                      {test.doctor?.name || "Unknown"}
                    </p>

                    {test.pathologist && (
                      <p>
                        <strong>Lab:</strong>{" "}
                        {test.pathologist.labName || test.pathologist.name}
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
