import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.heading}>404</h1>
        <h2 style={styles.subheading}>Page Not Found</h2>
        <p style={styles.message}>
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link to="/" style={styles.link}>
          Go back to Home
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    backgroundColor: "#f5f5f5",
  },
  content: {
    textAlign: "center",
    padding: "40px 20px",
  },
  heading: {
    fontSize: "80px",
    fontWeight: "bold",
    color: "#333",
    margin: "0",
  },
  subheading: {
    fontSize: "28px",
    color: "#666",
    marginTop: "10px",
  },
  message: {
    fontSize: "16px",
    color: "#999",
    marginTop: "15px",
  },
  link: {
    display: "inline-block",
    marginTop: "20px",
    padding: "10px 30px",
    backgroundColor: "#007bff",
    color: "white",
    textDecoration: "none",
    borderRadius: "5px",
    fontSize: "16px",
  },
};
