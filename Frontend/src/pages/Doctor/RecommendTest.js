import React, { useState } from "react";
import labApi from "../../api/labApi";
import { getErrorMessage } from "../../utils/helpers";
import "./RecommendTest.css";

export default function RecommendTest({ appointmentId, patientId, doctorId, onTestRecommended, onCancel }) {
  const [testName, setTestName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const commonTests = [
    "Blood Test (CBC)",
    "Blood Test (Lipid Panel)",
    "Blood Test (Glucose)",
    "Blood Test (Liver Function)",
    "Blood Test (Kidney Function)",
    "Urinalysis",
    "Thyroid Function Test (TSH, T3, T4)",
    "ECG",
    "X-Ray",
    "Ultrasound",
    "CT Scan",
    "MRI Scan",
    "ECHO (Echocardiogram)",
    "Stress Test",
    "Endoscopy",
  ];

  const handleRecommendTest = async (e) => {
    e.preventDefault();
    
    if (!testName.trim() || !description.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await labApi.recommendTest(doctorId, {
        appointmentId,
        patientId,
        testName,
        description,
      });

      setSuccess(`Test "${testName}" recommended successfully!`);
      setTestName("");
      setDescription("");
      
      // Call the callback to update parent component
      if (onTestRecommended) {
        onTestRecommended();
      }

      // Auto-close after 2 seconds
      setTimeout(() => {
        setSuccess("");
        if (onCancel) {
          onCancel();
        }
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error("Error recommending test:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommend-test-container">
      <div className="recommend-test-header">
        <h3>Recommend Lab Test</h3>
        {onCancel && (
          <button className="close-btn" onClick={onCancel}>
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleRecommendTest} className="recommend-test-form">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-group">
          <label htmlFor="testName">Test Name *</label>
          <input
            type="text"
            id="testName"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="form-control"
            placeholder="Enter test name or select from suggestions"
            disabled={loading}
          />
          <div className="common-tests">
            {commonTests.map((test) => (
              <button
                key={test}
                type="button"
                className="test-suggestion"
                onClick={() => setTestName(test)}
              >
                {test}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-control"
            placeholder="Why is this test being recommended? What symptoms/findings led to this recommendation?"
            rows="4"
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !testName.trim() || !description.trim()}
          >
            {loading ? "Recommending..." : "Recommend Test"}
          </button>
        </div>
      </form>
    </div>
  );
}
