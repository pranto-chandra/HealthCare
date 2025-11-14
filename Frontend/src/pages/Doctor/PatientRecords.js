import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "./PatientRecords.css";

export default function PatientRecords() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [patient, setPatient] = useState({
    name: "John Doe",
    age: 42,
    gender: "Male",
    contact: "john.doe@example.com",
    phone: "+880123456789",
    history: ["Type 2 Diabetes", "Hypertension", "Allergy to Penicillin"],
    prescriptions: ["Metformin 850mg - daily", "Lisinopril 10mg - daily"],
    activity: [
      "🩺 Appointment with Dr. Rahman on Nov 15",
      "💊 Prescription updated on Nov 10",
      "📊 Blood pressure logged on Nov 8",
    ],
  });

  const handleChange = (field, value) => {
    setPatient(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="patient-record-page">
      <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        ☰
      </button>

      <div className={`patient-record-layout ${isSidebarOpen ? "" : "collapsed"}`}>
        {isSidebarOpen && <Sidebar role="Doctor" />}
        <main className="patient-record-content">

          <section className="record-header">
            <h1>Patient Record</h1>
            <p>Detailed medical profile and history.</p>
            <button className="edit-toggle" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Save Changes" : "Edit"}
            </button>
          </section>

          <section className="profile-section">
            <h2>Profile</h2>
            {isEditing ? (
              <>
                <input type="text" value={patient.name} onChange={e => handleChange("name", e.target.value)} />
                <input type="number" value={patient.age} onChange={e => handleChange("age", e.target.value)} />
                <input type="text" value={patient.gender} onChange={e => handleChange("gender", e.target.value)} />
                <input type="email" value={patient.contact} onChange={e => handleChange("contact", e.target.value)} />
                <input type="tel" value={patient.phone} onChange={e => handleChange("phone", e.target.value)} />
              </>
            ) : (
              <>
                <p><strong>Name:</strong> {patient.name}</p>
                <p><strong>Age:</strong> {patient.age}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
                <p><strong>Email:</strong> {patient.contact}</p>
                <p><strong>Phone:</strong> {patient.phone}</p>
              </>
            )}
          </section>

          <section className="history-section">
            <h2>Medical History</h2>
            <ul>
              {patient.history.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </section>

          <section className="prescriptions-section">
            <h2>Active Prescriptions</h2>
            <ul>
              {patient.prescriptions.map((med, index) => <li key={index}>{med}</li>)}
            </ul>
          </section>

          <section className="activity-section">
            <h2>Recent Activity</h2>
            <ul>
              {patient.activity.map((note, index) => <li key={index}>{note}</li>)}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}