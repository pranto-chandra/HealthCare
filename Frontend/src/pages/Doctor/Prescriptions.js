import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "./Prescriptions.css";

export default function Prescriptions() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patient: "John Doe",
      medication: "Metformin 850mg",
      dosage: "Once daily",
      notes: "Take after breakfast",
    },
    {
      id: 2,
      patient: "Sara Khan",
      medication: "Lisinopril 10mg",
      dosage: "Once daily",
      notes: "Monitor blood pressure weekly",
    },
  ]);

  const [newPrescription, setNewPrescription] = useState({
    patient: "",
    medication: "",
    dosage: "",
    notes: "",
  });

  const handleChange = (field, value) => {
    setNewPrescription(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPrescription = () => {
    if (newPrescription.patient && newPrescription.medication) {
      setPrescriptions(prev => [
        ...prev,
        { id: Date.now(), ...newPrescription },
      ]);
      setNewPrescription({ patient: "", medication: "", dosage: "", notes: "" });
    }
  };

  return (
    <div className="prescription-page">
      <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        ☰
      </button>

      <div className={`prescription-layout ${isSidebarOpen ? "" : "collapsed"}`}>
        {isSidebarOpen && <Sidebar role="Doctor" />}
        <main className="prescription-content">

          <section className="prescription-header">
            <h1>Prescriptions</h1>
            <p>Manage and review patient medications.</p>
          </section>

          <section className="prescription-form">
            <h2>Add Prescription</h2>
            <input
              type="text"
              placeholder="Patient Name"
              value={newPrescription.patient}
              onChange={e => handleChange("patient", e.target.value)}
            />
            <input
              type="text"
              placeholder="Medication"
              value={newPrescription.medication}
              onChange={e => handleChange("medication", e.target.value)}
            />
            <input
              type="text"
              placeholder="Dosage"
              value={newPrescription.dosage}
              onChange={e => handleChange("dosage", e.target.value)}
            />
            <textarea
              placeholder="Notes"
              value={newPrescription.notes}
              onChange={e => handleChange("notes", e.target.value)}
            />
            <button onClick={handleAddPrescription}>Add</button>
          </section>

          <section className="prescription-list">
            <h2>Prescription Records</h2>
            {prescriptions.map(p => (
              <div key={p.id} className="prescription-card">
                <p><strong>Patient:</strong> {p.patient}</p>
                <p><strong>Medication:</strong> {p.medication}</p>
                <p><strong>Dosage:</strong> {p.dosage}</p>
                <p><strong>Notes:</strong> {p.notes}</p>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}