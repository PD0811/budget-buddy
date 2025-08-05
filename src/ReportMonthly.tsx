import React from "react";

const ReportMonthly: React.FC = () => (
  <div style={pageStyle}>
    <h2>Monthly Expense Report</h2>
    <p>
      This will display a detailed report of all expenses for the selected
      month.
    </p>
    {/* Placeholder for future monthly report table/graph */}
    <div style={{ marginTop: 32, color: "#888" }}>
      Monthly report coming soon.
    </div>
  </div>
);

const pageStyle: React.CSSProperties = {
  maxWidth: 700,
  margin: "2rem auto",
  background: "#fff",
  padding: "2rem",
  borderRadius: 8,
  boxShadow: "0 0 10px rgba(0,0,0,0.07)",
  textAlign: "center",
};

export default ReportMonthly;
