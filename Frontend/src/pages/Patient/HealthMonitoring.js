import React, {useState} from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "./HealthMonitoring.css";

export default function HealthMonitoring() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <div className="health-monitoring-page">
       {/* Toggle Sidebar */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>
      <div
        className={`health-monitoring-layout ${
          isSidebarOpen ? "" : "collapsed"
        }`}
      >
        {isSidebarOpen && <Sidebar role="Patient" />}


        <main className="health-monitoring-content">
          <section className="monitoring-header">
            <h1>Health Monitoring</h1>
            <p>Track your latest health metrics and trends.</p>
          </section>

          <section className="metrics-section">
            <div className="metric-card">
              <h3>Heart Rate</h3>
              <p>72 bpm</p>
              <span>Last updated: 2 days ago</span>
            </div>

            <div className="metric-card">
              <h3>Blood Pressure</h3>
              <p>120/80 mmHg</p>
              <span>Last updated: 2 days ago</span>
            </div>

            <div className="metric-card">
              <h3>Glucose Level</h3>
              <p>95 mg/dL</p>
              <span>Last updated: 2 days ago</span>
            </div>
          </section>

          <section className="monitoring-notes">
            <h2>Recent Notes</h2>
            <ul>
              <li>🧠 Stress levels normal.</li>
              <li>🍽️ Diet log updated.</li>
              <li>🏃 Physical activity recorded.</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}