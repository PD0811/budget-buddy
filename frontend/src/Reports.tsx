import React from "react";
import { useNavigate } from "react-router-dom";
import "./modern-ui.css";

const Reports: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="card page-card"
      style={{ textAlign: "center", maxWidth: 520 }}
    >
      <h2 className="page-heading" style={{ fontSize: "1.6rem" }}>
        Reports & Analytics
      </h2>
      <p style={{ color: "#8b96a5", margin: "0 0 1.8rem", fontSize: ".9rem" }}>
        Analyse your spending and extract insights.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: ".85rem" }}>
        <button
          onClick={() => navigate("/reports/prediction")}
          className="bb-btn"
          style={{ width: "100%" }}
        >
          Automatic Purchase Prediction
        </button>
        <button
          onClick={() => navigate("/reports/monthly")}
          className="bb-btn outline"
          style={{ width: "100%" }}
        >
          Monthly Expense Report
        </button>
        <button
          onClick={() => navigate("/reports/calendar")}
          className="bb-btn outline"
          style={{ width: "100%" }}
        >
          Calendar View of Expenses
        </button>
        <button
          onClick={() => navigate("/reports/export")}
          className="bb-btn outline"
          style={{ width: "100%" }}
        >
          Export Expenses to Excel
        </button>
      </div>
    </div>
  );
};
export default Reports;
