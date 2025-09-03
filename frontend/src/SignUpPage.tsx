import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./modern-ui.css";

const SignUpPage = () => {
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div
      className="app-shell"
      style={{ minHeight: "100vh", background: "var(--color-bg)" }}
    >
      <main
        className="app-main"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: 0,
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: 400,
            width: "100%",
            margin: "0 auto",
            padding: "2.2rem 2rem",
            borderRadius: "18px",
            boxShadow: "var(--shadow-elev)",
          }}
        >
          <h1
            className="page-heading"
            style={{ marginBottom: "0.5rem", fontSize: "2rem" }}
          >
            Sign Up
          </h1>
          {step === 1 ? (
            <form
              onSubmit={handleSendOtp}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.1rem",
              }}
            >
              <label
                style={{ color: "var(--color-text-dim)", fontWeight: 600 }}
              >
                I am a:
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "customer" | "vendor")
                  }
                  style={{ marginLeft: 8 }}
                >
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                </select>
              </label>
              <label
                style={{ color: "var(--color-text-dim)", fontWeight: 600 }}
              >
                Name:
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
              </label>
              <label
                style={{ color: "var(--color-text-dim)", fontWeight: 600 }}
              >
                Phone or Email:
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
              </label>
              <button className="bb-btn" type="submit">
                Send OTP
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleVerifyOtp}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.1rem",
              }}
            >
              <label
                style={{ color: "var(--color-text-dim)", fontWeight: 600 }}
              >
                Enter OTP sent to your{" "}
                {contact.includes("@") ? "email" : "phone"}:
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
              </label>
              <button className="bb-btn" type="submit">
                Verify & Sign Up
              </button>
            </form>
          )}
          <p style={{ marginTop: "1.2rem", color: "var(--color-text-dim)" }}>
            Already have an account?{" "}
            <button
              className="bb-btn outline"
              style={{
                padding: "0.4rem 1.1rem",
                fontSize: "0.9rem",
                marginLeft: 4,
              }}
              onClick={() => navigate("/")}
            >
              Log In
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;
