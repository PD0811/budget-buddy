import React from "react";

const ReportCalendar: React.FC = () => (
  <div style={pageStyle}>
    <h2>Calendar View of Expenses</h2>
    <p>This will show a graphic calendar with daily expenses.</p>
    {/* Placeholder for future calendar view */}
    <div style={{ marginTop: 32, color: "#888" }}>
      Calendar view coming soon.
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

export default ReportCalendar;
