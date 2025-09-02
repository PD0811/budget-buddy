import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="card" style={{ maxWidth: 820, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "2.4rem",
          margin: "0 0 .6rem",
          background: "linear-gradient(90deg,#fff,#c7d2fe 50%,#f0abfc)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Welcome to BudgetBuddy
      </h1>
      <p style={{ fontSize: "1.05rem", color: "#9aa4b4", marginTop: 0 }}>
        Your personalised intelligent expense companion.
      </p>
    </div>
  );
};

export default Dashboard;
