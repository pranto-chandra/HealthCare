import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import DashboardCards from "../../components/DashboardCards";

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext);

  const cards = [
    { title: "Today’s Appointments", description: "5 appointments scheduled today." },
    { title: "Pending Prescriptions", description: "2 prescriptions awaiting approval." },
    { title: "Patients Monitored", description: "8 active patients this month." },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role={user?.role} />
      <main style={{ marginLeft: "240px", padding: "20px", flexGrow: 1 }}>
        <h2>Welcome, Dr. {user?.email}</h2>
        <p>Manage your patients and appointments efficiently.</p>
        <DashboardCards cards={cards} />
      </main>
    </div>
  );
}
