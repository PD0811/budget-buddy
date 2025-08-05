import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // Placeholder handlers for navigation
  const handleExpenses = () => {
    navigate("/expenses");
  };
  const handleProduct = () => {
    navigate("/product");
  };
  const handleReports = () => {
    navigate("/reports");
  };
  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          minWidth: "320px",
          textAlign: "center",
        }}
      >
        <h1>Budget Buddy Dashboard</h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          <button onClick={handleExpenses} style={buttonStyle}>
            Expenses
          </button>
          <button onClick={handleProduct} style={buttonStyle}>
            Product
          </button>
          <button onClick={handleReports} style={buttonStyle}>
            Reports
          </button>
          <button
            onClick={handleLogout}
            style={{ ...buttonStyle, background: "#e53e3e", color: "#fff" }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: "0.75rem 1.5rem",
  fontSize: "1rem",
  borderRadius: "4px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  transition: "background 0.2s",
};

export default Dashboard;
