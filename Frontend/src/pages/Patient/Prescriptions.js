import React, {useState} from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "./Prescription.css";

export default function Prescriptions() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
            <h1>My Prescriptions</h1>
            <p>Review your active and past medications.</p>
          </section>

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
        </main>
      </div>
    </div>
  );
}