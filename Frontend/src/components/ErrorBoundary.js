import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Frontend crashed during render", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetSession = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background:
            "linear-gradient(135deg, rgba(241,245,249,1) 0%, rgba(224,242,254,1) 100%)",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "640px",
            background: "#ffffff",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
            color: "#0f172a",
          }}
        >
          <p
            style={{
              margin: "0 0 12px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#0f766e",
            }}
          >
            Frontend Recovery
          </p>
          <h1 style={{ margin: "0 0 12px", fontSize: "32px", lineHeight: 1.1 }}>
            The app hit a client-side error.
          </h1>
          <p style={{ margin: "0 0 20px", color: "#475569", lineHeight: 1.6 }}>
            We caught the crash so the page does not stay blank. This is often
            caused by stale browser storage after an app update.
          </p>
          {this.state.error?.message ? (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "16px",
                margin: "0 0 20px",
                color: "#b91c1c",
                overflowX: "auto",
              }}
            >
              {this.state.error.message}
            </pre>
          ) : null}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                border: 0,
                borderRadius: "999px",
                padding: "12px 18px",
                background: "#0f766e",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reload
            </button>
            <button
              type="button"
              onClick={this.handleResetSession}
              style={{
                borderRadius: "999px",
                padding: "12px 18px",
                background: "transparent",
                color: "#0f172a",
                fontWeight: 700,
                border: "1px solid #cbd5e1",
                cursor: "pointer",
              }}
            >
              Clear Local Session
            </button>
          </div>
        </section>
      </main>
    );
  }
}
