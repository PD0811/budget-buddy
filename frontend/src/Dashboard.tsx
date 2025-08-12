import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: 700,
          marginBottom: "1rem",
          color: "#23232a",
        }}
      >
        Welcome to BudgetBuddy !
      </h1>
      <p style={{ fontSize: "1.2rem", color: "#666" }}>
        Your very own personalised expense tracker
      </p>
    </div>
  );
};

export default Dashboard;
