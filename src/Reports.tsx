import React from "react";
import { useNavigate } from "react-router-dom";

const Reports: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        background: "#fff",
        padding: "2rem",
        borderRadius: 8,
        boxShadow: "0 0 10px rgba(0,0,0,0.07)",
        textAlign: "center",
      }}
    >
      <h2>Reports & Analytics</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <button
          onClick={() => navigate("/reports/prediction")}
          style={btnStyle}
        >
          Automatic Purchase Prediction
        </button>
        <button onClick={() => navigate("/reports/monthly")} style={btnStyle}>
          Monthly Expense Report
        </button>
        <button onClick={() => navigate("/reports/calendar")} style={btnStyle}>
          Calendar View of Expenses
        </button>
        <button onClick={() => navigate("/reports/export")} style={btnStyle}>
          Export Expenses to Excel
        </button>
      </div>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  padding: "0.75rem 1.5rem",
  fontSize: "1rem",
  borderRadius: "4px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  transition: "background 0.2s",
};

export default Reports;
