import React from "react";

const ReportPrediction: React.FC = () => (
  <div style={pageStyle}>
    <h2>Automatic Purchase Prediction</h2>
    <button
      style={{
        padding: "0.75rem 1.5rem",
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        fontSize: "1rem",
      }}
    >
      Predict Purchases
    </button>
    <p style={{ marginTop: 24, color: "#888" }}>
      Prediction functionality coming soon.
    </p>
  </div>
);

const pageStyle: React.CSSProperties = {
  maxWidth: 500,
  margin: "2rem auto",
  background: "#fff",
  padding: "2rem",
  borderRadius: 8,
  boxShadow: "0 0 10px rgba(0,0,0,0.07)",
  textAlign: "center",
};

export default ReportPrediction;
