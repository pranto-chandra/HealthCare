import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import DashboardCards from "../../components/DashboardCards";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);

  const cards = [
    { title: "Registered Users", description: "Total 132 users in the system." },
    { title: "Active Doctors", description: "24 active doctors." },
    { title: "Reports Generated", description: "5 reports in the last week." },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar role={user?.role} />
      <main style={{ marginLeft: "240px", padding: "20px", flexGrow: 1 }}>
        <h2>Welcome, {user?.email}</h2>
        <p>Administrative control panel overview.</p>
        <DashboardCards cards={cards} />
      </main>
    </div>
  );
}
