import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import doctorApi from "../../api/doctorApi";
import { getErrorMessage } from "../../utils/helpers";
import "./Prescriptions.css";

export default function DoctorPrescriptions() {
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Search state
  const [searchEmail, setSearchEmail] = useState("");
  const [searchedPatient, setSearchedPatient] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Prescription form state
  const [newPrescription, setNewPrescription] = useState({
    diagnosis: "",
    description: "",
    medications: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Prescriptions list state
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
  const [prescriptionsError, setPrescriptionsError] = useState("");

  // Fetch doctor's prescriptions
  useEffect(() => {
    if (!user?.id) return;
    fetchPrescriptions();
  }, [user?.id]);

  const fetchPrescriptions = async () => {
    try {
      setLoadingPrescriptions(true);
      setPrescriptionsError("");
      const response = await doctorApi.getMyPrescriptions();
      setPrescriptions(response?.data?.data || []);
    } catch (err) {
      setPrescriptionsError(getErrorMessage(err));
      console.error("Error fetching prescriptions:", err);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  // Search for patient by email
  const handleSearchPatient = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) {
      setSearchError("Please enter a patient email");
      return;
    }

    try {
      setSearching(true);
      setSearchError("");
      setSearchedPatient(null);

      const response = await doctorApi.searchPatientByEmail(searchEmail);
      setSearchedPatient(response?.data?.data);
    } catch (err) {
      setSearchError(getErrorMessage(err) || "Patient not found");
      setSearchedPatient(null);
    } finally {
      setSearching(false);
    }
  };

  // Handle prescription form changes
  const handlePrescriptionChange = (field, value) => {
    setNewPrescription((prev) => ({ ...prev, [field]: value }));
  };

  // Handle medication changes
  const handleMedicationChange = (index, field, value) => {
    const updatedMeds = [...newPrescription.medications];
    updatedMeds[index][field] = value;
    setNewPrescription((prev) => ({ ...prev, medications: updatedMeds }));
  };

  // Add medication field
  const handleAddMedication = () => {
    setNewPrescription((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        { medicationName: "", dosage: "", frequency: "", duration: "" },
      ],
    }));
  };

  // Remove medication field
  const handleRemoveMedication = (index) => {
    setNewPrescription((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  // Submit prescription
  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (!searchedPatient) {
      setSubmitError("Please select a patient first");
      return;
    }

    if (!newPrescription.diagnosis || !newPrescription.description) {
      setSubmitError("Please fill in diagnosis and description");
      return;
    }

    if (
      newPrescription.medications.some(
        (m) => !m.medicationName || !m.dosage || !m.frequency || !m.duration,
      )
    ) {
      setSubmitError("Please fill in all medication details");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const prescriptionData = {
        patientId: searchedPatient.id,
        diagnosis: newPrescription.diagnosis,
        description: newPrescription.description,
        medications: newPrescription.medications,
      };

      await doctorApi.createPrescription(prescriptionData);

      // Reset form and fetch updated prescriptions
      setNewPrescription({
        diagnosis: "",
        description: "",
        medications: [
          { medicationName: "", dosage: "", frequency: "", duration: "" },
        ],
      });
      setSearchedPatient(null);
      setSearchEmail("");
      setSubmitSuccess("Prescription created successfully!");

      // Fetch updated prescriptions
      fetchPrescriptions();

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(""), 3000);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      console.error("Error creating prescription:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="prescription-page">
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div
        className={`prescription-layout ${isSidebarOpen ? "" : "collapsed"}`}
      >
        {isSidebarOpen && <Sidebar role="Doctor" />}
        <main className="prescription-content">
          <section className="prescription-header">
            <h1>💊 Manage Prescriptions</h1>
            <p>Search patients and create prescriptions with medications.</p>
          </section>

          {/* Search Patient Section */}
          <section className="search-patient-section mb-10 flex flex-col justify-center items-center">
            <form onSubmit={handleSearchPatient} className="search-form">
              <div className="search-input-group">
                <input
                  type="email"
                  placeholder="Enter patient email address..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="search-input"
                  disabled={searching}
                />
                <button
                  type="submit"
                  className="search-btn"
                  disabled={searching}
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>
              {searchError && (
                <div className="alert alert-danger">{searchError}</div>
              )}
            </form>

            {searchedPatient && (
              <div className="patient-info-card flex flex-col items-center justify-center w-full max-w-2xl mt-2">
                <h1>Patient Information</h1>
                <div className="patient-info mt-2">
                  <p>
                    <strong>Name:</strong> {searchedPatient.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {searchedPatient.user?.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {searchedPatient.phone}
                  </p>
                  <p>
                    <strong>DOB:</strong>{" "}
                    {new Date(searchedPatient.dateOfBirth).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Gender:</strong> {searchedPatient.gender}
                  </p>
                  <p>
                    <strong>Blood Group:</strong> {searchedPatient.bloodGroup}
                  </p>
                </div>
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => {
                    setSearchedPatient(null);
                    setSearchEmail("");
                  }}
                >
                  Select Different Patient
                </button>
              </div>
            )}
          </section>

          {/* Prescription Form Section */}
          {searchedPatient && (
            <section className="prescription-form-section">
              
              <form
                onSubmit={handleSubmitPrescription}
                className="prescription-form"
              >
                {submitError && (
                  <div className="alert alert-danger">{submitError}</div>
                )}
                {submitSuccess && (
                  <div className="alert alert-success">{submitSuccess}</div>
                )}

                <div className="form-group">
                  <label htmlFor="diagnosis">Diagnosis *</label>
                  <input
                    id="diagnosis"
                    type="text"
                    placeholder="Diagnosis for the patient..."
                    value={newPrescription.diagnosis}
                    onChange={(e) =>
                      handlePrescriptionChange("diagnosis", e.target.value)
                    }
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Clinical Notes *</label>
                  <textarea
                    id="description"
                    placeholder="Detailed clinical notes and observations..."
                    value={newPrescription.description}
                    onChange={(e) =>
                      handlePrescriptionChange("description", e.target.value)
                    }
                    className="form-textarea"
                    rows="4"
                    required
                  />
                </div>

                {/* Medications Section */}
                <div className="medications-section">
                  <h3>Medications</h3>
                  {newPrescription.medications.map((med, index) => (
                    <div key={index} className="medication-form">
                      <div className="medication-fields">
                        <div className="form-group">
                          <label htmlFor={`medication-${index}`}>
                            Medication Name *
                          </label>
                          <input
                            id={`medication-${index}`}
                            type="text"
                            placeholder="e.g., Metformin"
                            value={med.medicationName}
                            onChange={(e) =>
                              handleMedicationChange(
                                index,
                                "medicationName",
                                e.target.value,
                              )
                            }
                            className="form-input"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`dosage-${index}`}>Dosage *</label>
                          <input
                            id={`dosage-${index}`}
                            type="text"
                            placeholder="e.g., 500mg"
                            value={med.dosage}
                            onChange={(e) =>
                              handleMedicationChange(
                                index,
                                "dosage",
                                e.target.value,
                              )
                            }
                            className="form-input"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`frequency-${index}`}>
                            Frequency *
                          </label>
                          <select
                            id={`frequency-${index}`}
                            value={med.frequency}
                            onChange={(e) =>
                              handleMedicationChange(
                                index,
                                "frequency",
                                e.target.value,
                              )
                            }
                            className="form-input"
                            required
                          >
                            <option value="">Select frequency</option>
                            <option value="Once daily">Once daily</option>
                            <option value="Twice daily">Twice daily</option>
                            <option value="Thrice daily">Thrice daily</option>
                            <option value="Every 6 hours">Every 6 hours</option>
                            <option value="Every 8 hours">Every 8 hours</option>
                            <option value="Every 12 hours">
                              Every 12 hours
                            </option>
                            <option value="As needed">As needed</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor={`duration-${index}`}>
                            Duration *
                          </label>
                          <input
                            id={`duration-${index}`}
                            type="text"
                            placeholder="e.g., 30 days"
                            value={med.duration}
                            onChange={(e) =>
                              handleMedicationChange(
                                index,
                                "duration",
                                e.target.value,
                              )
                            }
                            className="form-input"
                            required
                          />
                        </div>
                      </div>

                      {newPrescription.medications.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(index)}
                          className="btn-remove"
                        >
                          Remove Medication
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="btn-add-medication"
                  >
                    + Add Another Medication
                  </button>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Creating Prescription..."
                      : "Create Prescription"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (newPrescription.medications.length === 0) {
                        // 👉 No medication → clear diagnosis section only
                        setNewPrescription((prev) => ({
                          ...prev,
                          diagnosis: "",
                          description: "",
                        }));
                      } else {
                        // 👉 Medication exists → clear medication fields only (KEEP forms)
                        const clearedMeds = newPrescription.medications.map(
                          () => ({
                            medicationName: "",
                            dosage: "",
                            frequency: "",
                            duration: "",
                          }),
                        );

                        setNewPrescription((prev) => ({
                          ...prev,
                          diagnosis: "",
                          description: "",
                          medications: clearedMeds,
                        }));
                      }
                    }}
                    className="btn-reset"
                  >
                    Clear Form
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Prescriptions List Section */}
          <section className="prescriptions-list-section">
            <h2>My Recent Prescriptions</h2>
            {loadingPrescriptions ? (
              <div className="loading">Loading prescriptions...</div>
            ) : prescriptionsError ? (
              <div className="alert alert-danger">{prescriptionsError}</div>
            ) : prescriptions.length === 0 ? (
              <div className="no-data">
                No prescriptions created yet. Start by searching for a patient
                above.
              </div>
            ) : (
              <div className="prescriptions-grid">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="prescription-card">
                    <div className="card-header">
                      <h3>Patient: {prescription.patient?.name}</h3>
                      <span className="card-date">
                        {new Date(
                          prescription.prescriptionDate,
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="card-body">
                      <p>
                        <strong>Diagnosis:</strong> {prescription.diagnosis}
                      </p>
                      <p>
                        <strong>Notes:</strong> {prescription.description}
                      </p>

                      {prescription.medications &&
                        prescription.medications.length > 0 && (
                          <div className="medications-list">
                            <strong>Medications:</strong>
                            <ul>
                              {prescription.medications.map((med, idx) => (
                                <li key={idx}>
                                  {med.medicationName} - {med.dosage} (
                                  {med.frequency})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
