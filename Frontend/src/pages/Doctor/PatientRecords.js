import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import doctorApi from "../../api/doctorApi";
import TestReports from "../../components/TestReports";
import { getErrorMessage } from "../../utils/helpers";
import "./PatientRecords.css";

export default function PatientRecords() {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const urlPatientId = searchParams.get("patientId");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [patientId, setPatientId] = useState(urlPatientId || null);

  // Search for patient by email
  const handleSearchPatient = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) {
      setSearchError("Please enter a patient email");
      return;
    }

    try {
      setLoading(true);
      setSearchError("");

      const response = await doctorApi.searchPatientByEmail(searchEmail);
      const foundPatient = response?.data?.data;

      if (foundPatient?.id) {
        setPatientId(foundPatient.id);
        setSearchEmail("");
      } else {
        setSearchError("Patient not found");
      }
    } catch (err) {
      setSearchError(getErrorMessage(err) || "Failed to search patient");
      console.error("Error searching patient:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch patient record
  useEffect(() => {
    if (!patientId) {
      return;
    }

    const fetchPatientRecord = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await doctorApi.getPatientRecord(patientId);
        const data = response?.data?.data;

        setPatient(data?.patient || null);
        setAppointments(data?.appointments || []);
        setMedicalHistory(data?.medicalHistory || []);
        setLabTests(data?.labTests || []);
        setPrescriptions(data?.prescriptions || []);
        setHealthRecords(data?.healthRecords?.slice(0, 10) || []);
      } catch (err) {
        setError(getErrorMessage(err) || "Failed to load patient record");
        console.error("Error fetching patient record:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientRecord();
  }, [patientId]);

  if (loading && patientId) {
    return (
      <div className="patient-record-page">
        <button
          className="sidebar-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          ☰
        </button>
        <div
          className={`patient-record-layout ${isSidebarOpen ? "" : "collapsed"}`}
        >
          {isSidebarOpen && <Sidebar role="Doctor" />}
          <main className="patient-record-content">
            <div className="loading">Loading patient record...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-record-page">
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div
        className={`patient-record-layout ${isSidebarOpen ? "" : "collapsed"}`}
      >
        {isSidebarOpen && <Sidebar role="Doctor" />}
        <main className="patient-record-content">
          <section className="record-header">
            <h1>📋 Patient Medical Record</h1>
            <p>Search for a patient to view their complete medical profile.</p>
          </section>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Patient Search Form */}
          {!patient && (
            <section className="search-section">
              <h2>🔍 Search Patient</h2>
              <form onSubmit={handleSearchPatient} className="search-form">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Enter patient email address"
                  disabled={loading}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Searching..." : "Search Patient"}
                </button>
              </form>
              {searchError && <div className="search-error">{searchError}</div>}
            </section>
          )}

          {patient && (
            <>
              {/* Patient Profile Card */}
              <section className="profile-section">
                <h2>👤 Patient Profile</h2>
                <div className="profile-card">
                  <div className="profile-info">
                    <p>
                      <strong>Name:</strong> {patient.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {patient.user?.email || "N/A"}
                    </p>
                    <p>
                      <strong>Phone:</strong> {patient.phone || "N/A"}
                    </p>
                    <p>
                      <strong>Date of Birth:</strong>{" "}
                      {patient.dateOfBirth
                        ? new Date(patient.dateOfBirth).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Gender:</strong> {patient.gender || "N/A"}
                    </p>
                    <p>
                      <strong>Blood Group:</strong>{" "}
                      {patient.bloodGroup || "N/A"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Appointments Section */}
              <section className="prescriptions-section">
                <h2>🩺 Appointments ({appointments.length})</h2>
                {appointments && appointments.length > 0 ? (
                  <div className="prescriptions-list">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="prescriptions-card">
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(apt.scheduledAt).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          <span className={`status status-${apt.status}`}>
                            {apt.status}
                          </span>
                        </p>
                        <p>
                          <strong>Diagnosis:</strong> {apt.diagnosis || "N/A"}
                        </p>
                        <p>
                          <strong>Symptoms:</strong> {apt.symptoms || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No appointments found.</p>
                )}
              </section>

              {/* Medical History Section */}
              <section className="history-section">
                <h2>📊 Medical History ({medicalHistory.length})</h2>
                {medicalHistory && medicalHistory.length > 0 ? (
                  <div className="history-list">
                    {medicalHistory.map((hist) => (
                      <div key={hist.id} className="history-card">
                        <p>
                          <strong>Condition:</strong> {hist.condition}
                        </p>
                        <p>
                          <strong>Status:</strong> {hist.status}
                        </p>
                        {hist.notes && (
                          <p>
                            <strong>Notes:</strong> {hist.notes}
                          </p>
                        )}
                        <p className="timestamp">
                          {new Date(hist.recordedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No medical history found.</p>
                )}
              </section>

              {/* Prescriptions Section */}
              <section className="prescriptions-section">
                <h2>💊 Prescriptions ({prescriptions.length})</h2>
                {prescriptions && prescriptions.length > 0 ? (
                  <div className="prescriptions-list">
                    {prescriptions.map((rx) => (
                      <div key={rx.id} className="prescription-card">
                        <p>
                          <strong>Diagnosis:</strong> {rx.diagnosis}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(rx.prescriptionDate).toLocaleDateString()}
                        </p>
                        {rx.medications && rx.medications.length > 0 && (
                          <div className="medications">
                            <strong>Medications:</strong>
                            <ul>
                              {rx.medications.map((med, idx) => (
                                <li key={idx}>
                                  {med.medicationName} - {med.dosage} (
                                  {med.frequency})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No prescriptions found.</p>
                )}
              </section>

              

              {/* Health Records Section */}
              <section className="prescriptions-section">
                <h2>❤️ Health Monitoring (Last 10 Records)</h2>
                {healthRecords && healthRecords.length > 0 ? (
                  <div className="prescriptions-list">
                    {healthRecords.map((record) => (
                      <div key={record.id} className="prescriptions-card">
                        {record.heartRate && (
                          <p>
                            <strong>Heart Rate:</strong> {record.heartRate} bpm
                          </p>
                        )}
                        {record.temperature && (
                          <p>
                            <strong>Temperature:</strong> {record.temperature}°C
                          </p>
                        )}
                        {record.weight && (
                          <p>
                            <strong>Weight:</strong> {record.weight} kg
                          </p>
                        )}
                        {record.bloodPressure && (
                          <p>
                            <strong>Blood Pressure:</strong>{" "}
                            {record.bloodPressure}
                          </p>
                        )}
                        <p className="timestamp">
                          {new Date(record.recordedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No health records found.</p>
                )}
              </section>

              {/* Test Reports Section */}
              {patient.id && <TestReports patientId={patient.id} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
