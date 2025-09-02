import React from "react";
import "./modern-ui.css";

const ReportPrediction: React.FC = () => (
  <div
    className="card page-card"
    style={{ textAlign: "center", maxWidth: 560 }}
  >
    <h2 className="page-heading" style={{ fontSize: "1.55rem" }}>
      Automatic Purchase Prediction
    </h2>
    <p style={{ color: "#8b96a5", fontSize: ".9rem", margin: "0 0 1.4rem" }}>
      Leverage patterns to anticipate future purchases.
    </p>
    <button className="bb-btn" style={{ fontSize: ".8rem" }}>
      Predict Purchases
    </button>
    <p style={{ marginTop: 24, color: "#8b96a5", fontSize: ".8rem" }}>
      Prediction functionality coming soon.
    </p>
  </div>
);

export default ReportPrediction;
