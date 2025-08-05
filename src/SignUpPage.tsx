import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending OTP
    setStep(2);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate OTP verification
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: 400,
        margin: "2rem auto",
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 0 10px rgba(0,0,0,0.07)",
      }}
    >
      <h1>Sign Up</h1>
      {step === 1 ? (
        <form
          onSubmit={handleSendOtp}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <label>
            I am a:
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "customer" | "vendor")}
              style={{ marginLeft: 8 }}
            >
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
            </select>
          </label>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </label>
          <label>
            Phone or Email:
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </label>
          <button type="submit" style={btnStyle}>
            Send OTP
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleVerifyOtp}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <label>
            Enter OTP sent to your {contact.includes("@") ? "email" : "phone"}:
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </label>
          <button type="submit" style={btnStyle}>
            Verify & Sign Up
          </button>
        </form>
      )}
      <p style={{ marginTop: 16 }}>
        Already have an account?{" "}
        <button
          style={{
            background: "none",
            border: "none",
            color: "#2563eb",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          Log In
        </button>
      </p>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  padding: "0.5rem 1.5rem",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  fontSize: "1rem",
};

export default SignUpPage;
