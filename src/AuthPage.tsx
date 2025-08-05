import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

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
    <div className="auth-container">
      <div className="auth-box">
        <h1>Welcome</h1>
        <p className="subheading">Log in to continue to your dashboard.</p>
        <form
          className="login-form"
          onSubmit={step === 1 ? handleSendOtp : handleLogin}
        >
          <h2>Log In</h2>
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
          {step === 1 ? (
            <>
              <input
                type="text"
                placeholder="Phone Number or Email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
              <button className="send-otp" type="submit">
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
              />
              <button type="submit">Log In</button>
            </>
          )}
        </form>
        <p className="signup-text">
          Don’t have an account?{" "}
          <button className="signup-button" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
