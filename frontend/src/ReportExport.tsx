import React from "react";
import "./modern-ui.css";

const ReportExport: React.FC = () => (
  <div
    className="card page-card"
    style={{ textAlign: "center", maxWidth: 560 }}
  >
    <h2 className="page-heading" style={{ fontSize: "1.55rem" }}>
      Export Expenses to Excel
    </h2>
    <p style={{ color: "#8b96a5", fontSize: ".9rem", margin: "0 0 1.4rem" }}>
      Download your expenses for offline records or analysis.
    </p>
    <button className="bb-btn" style={{ fontSize: ".8rem" }}>
      Export to Excel
    </button>
    <p style={{ marginTop: 24, color: "#8b96a5", fontSize: ".8rem" }}>
      Export functionality coming soon.
    </p>
  </div>
);

export default ReportExport;
