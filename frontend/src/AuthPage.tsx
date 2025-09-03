import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./modern-ui.css";

const AuthPage = () => {
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [step, setStep] = useState<1 | 2>(1);
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (contact.trim()) {
      setStep(2);
      // Simulate sending OTP
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate OTP verification
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
            Welcome
          </h1>
          <p
            className="subheading"
            style={{ color: "var(--color-text-dim)", marginBottom: "1.2rem" }}
          >
            Log in to continue to your dashboard.
          </p>
          <form
            className="login-form"
            style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
            onSubmit={step === 1 ? handleSendOtp : handleLogin}
          >
            <label style={{ color: "var(--color-text-dim)", fontWeight: 600 }}>
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
            {step === 1 ? (
              <>
                <input
                  type="text"
                  placeholder="Phone Number or Email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
                <button className="bb-btn" type="submit">
                  Send OTP
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
                <button className="bb-btn" type="submit">
                  Log In
                </button>
              </>
            )}
          </form>
          <p style={{ marginTop: "1.2rem", color: "var(--color-text-dim)" }}>
            Don't have an account?{" "}
            <button
              className="bb-btn outline"
              style={{
                padding: "0.4rem 1.1rem",
                fontSize: "0.9rem",
                marginLeft: 4,
              }}
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
