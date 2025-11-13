import React from "react";

export default function DashboardCards({ cards }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            backgroundColor: "#e0f2f1",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "#00695c", margin: "0 0 10px 0" }}>
            {card.title}
          </h3>
          <p style={{ margin: 0 }}>{card.description}</p>
        </div>
      ))}
    </div>
  );
}
