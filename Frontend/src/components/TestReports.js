import React, { useState, useEffect } from "react";
import labApi from "../api/labApi";
import { getErrorMessage } from "../utils/helpers";
import "./TestReports.css";

export default function TestReports({ patientId }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, recommended, completed

  useEffect(() => {
    fetchTests();
  }, [patientId]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await labApi.getPatientTests(patientId);
      setTests(response?.data?.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error("Error fetching tests:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTests = () => {
    if (filter === "recommended") {
      return tests.filter((t) => t.status === "RECOMMENDED");
    } else if (filter === "completed") {
      return tests.filter((t) => t.status === "REPORT_ADDED");
    }
    return tests;
  };

  const getStatusBadge = (status) => {
    const badges = {
      RECOMMENDED: { className: "badge-warning", label: "Recommended" },
      PENDING: { className: "badge-info", label: "Pending" },
      COMPLETED: { className: "badge-primary", label: "Processing" },
      REPORT_ADDED: { className: "badge-success", label: "Report Ready" },
    };
    const badge = badges[status] || { className: "badge-secondary", label: status };
    return (
      <span className={`badge ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const filteredTests = getFilteredTests();

  if (loading) {
    return <div className="loading">Loading test reports...</div>;
  }

  return (
    <div className="test-reports-container">
      <h2 className="section-title">Lab Test Reports & Recommendations</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {tests.length === 0 ? (
        <div className="no-data">
          <p>No lab tests or recommendations yet.</p>
        </div>
      ) : (
        <>
          <div className="filter-tabs">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Tests ({tests.length})
            </button>
            <button
              className={`filter-btn ${filter === "recommended" ? "active" : ""}`}
              onClick={() => setFilter("recommended")}
            >
              Recommended ({tests.filter((t) => t.status === "RECOMMENDED").length})
            </button>
            <button
              className={`filter-btn ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Completed ({tests.filter((t) => t.status === "REPORT_ADDED").length})
            </button>
          </div>

          {filteredTests.length === 0 ? (
            <div className="no-data">No tests found in this category.</div>
          ) : (
            <div className="tests-grid">
              {filteredTests.map((test) => (
                <div key={test.id} className="test-item">
                  <div className="test-item-header">
                    <h3>{test.testName}</h3>
                    {getStatusBadge(test.status)}
                  </div>

                  <div className="test-item-details">
                    {test.doctor && (
                      <p>
                        <strong>Recommended by:</strong> Dr. {test.doctor.name}
                      </p>
                    )}
                    {test.pathologist && (
                      <p>
                        <strong>Lab:</strong> {test.pathologist.labName || test.pathologist.name}
                      </p>
                    )}
                    <p>
                      <strong>Description:</strong> {test.description}
                    </p>
                    {test.appointment && test.appointment.diagnosis && (
                      <p>
                        <strong>Diagnosis:</strong> {test.appointment.diagnosis}
                      </p>
                    )}
                    {test.reportNotes && (
                      <p>
                        <strong>Notes:</strong> {test.reportNotes}
                      </p>
                    )}
                  </div>

                  <div className="test-item-meta">
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

                  {test.status === "REPORT_ADDED" && test.resultFile && (
                    <div className="test-item-actions">
                      <a
                        href={`/${test.resultFile}`}
                        className="btn btn-download"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📄 Download Report
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
