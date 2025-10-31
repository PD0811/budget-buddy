import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./apiUtils";
import "./modern-ui.css";

const AuthPage = () => {
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState<"password" | "email">("password");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useState<{lat: number, lng: number, city?: string, country?: string} | null>(null);
  const [, setLocationError] = useState("");
  const navigate = useNavigate();

// Get user's current location
const getCurrentLocation = (): Promise<{lat: number, lng: number, city?: string, country?: string}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Try to get city and country from reverse geocoding
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          resolve({
            lat: latitude,
            lng: longitude,
            city: data.city || data.locality || 'Unknown',
            country: data.countryName || 'Unknown'
          });
        } catch (geoError) {
          // If reverse geocoding fails, just return coordinates
          resolve({
            lat: latitude,
            lng: longitude,
            city: 'Unknown',
            country: 'Unknown'
          });
        }
      },
      (error) => {
        reject(new Error(`Location access denied: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLocationError("");
  setLoading(true);
  
  try {
    // Get user's location
    const userLocation = await getCurrentLocation();
    setLocation(userLocation);
    
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        username, 
        password, 
        role,
        location: userLocation
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem("token", data.token);
    navigate("/dashboard");
  } catch (err: any) {
    if (err.message.includes('Location access denied')) {
      setLocationError("Location access is required for security. Please allow location access and try again.");
    } else {
      setError(err.message);
    }
  } finally {
    setLoading(false);
  }
};


const handleSendEmailOTP = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLocationError("");
  setLoading(true);
  
  if (!email) {
    setError("Please enter your email address");
    setLoading(false);
    return;
  }

  try {
    // Get user's location
    const userLocation = await getCurrentLocation();
    setLocation(userLocation);
    
    const res = await fetch(`${API_BASE_URL}/api/send-email-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email, 
        role,
        location: userLocation
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setOtpSent(true);
    setError("");
  } catch (err: any) {
    if (err.message.includes('Location access denied')) {
      setLocationError("Location access is required for security. Please allow location access and try again.");
    } else {
      setError(err.message);
    }
  } finally {
    setLoading(false);
  }
};

const handleVerifyEmailOTP = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLocationError("");
  setLoading(true);
  
  if (!otp) {
    setError("Please enter the OTP");
    setLoading(false);
    return;
  }

  try {
    // Get user's location for verification
    const userLocation = await getCurrentLocation();
    setLocation(userLocation);
    
    const res = await fetch(`${API_BASE_URL}/api/verify-email-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email, 
        otp, 
        role,
        location: userLocation
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem("token", data.token);
    navigate("/dashboard");
  } catch (err: any) {
    if (err.message.includes('Location access denied')) {
      setLocationError("Location access is required for security. Please allow location access and try again.");
    } else {
      setError(err.message);
    }
  } finally {
    setLoading(false);
  }
};

const resetOTP = () => {
  setOtpSent(false);
  setOtp("");
  setEmail("");
  setError("");
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
            {authMode === "password" 
              ? "Log in with your username to continue to your dashboard."
              : "Log in with your email using OTP verification (Free)."
            }
          </p>
          {/* Auth Mode Toggle */}
          <div style={{ marginBottom: "1.2rem", display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className={`bb-btn ${authMode === "password" ? "" : "outline"}`}
              style={{ flex: 1, padding: "0.6rem" }}
              onClick={() => {
                setAuthMode("password");
                setError("");
                resetOTP();
              }}
            >
              Username
            </button>
            <button
              type="button"
              className={`bb-btn ${authMode === "email" ? "" : "outline"}`}
              style={{ flex: 1, padding: "0.6rem" }}
              onClick={() => {
                setAuthMode("email");
                setError("");
                resetOTP();
              }}
            >
              Email OTP
            </button>
          </div>

          {/* Password Authentication Form */}
          {authMode === "password" && (
          <form
            className="login-form"
            style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
            onSubmit={handleLogin}
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
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: "100%" }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%" }}
            />
            {error && (
              <div
                style={{
                  color: "var(--color-danger)",
                  fontWeight: 600,
                  marginBottom: "-0.5rem",
                }}
              >
                {error}
              </div>
            )}
              <button className="bb-btn" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>
          )}


          {/* Email OTP Authentication Form */}
          {authMode === "email" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
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

              {!otpSent ? (
                <form onSubmit={handleSendEmailOTP}>
                  <input
                    type="email"
                    placeholder="Email Address (e.g., user@example.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "1rem" }}
                  />
                  {error && (
                    <div
                      style={{
                        color: "var(--color-danger)",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                      }}
                    >
                      {error}
                    </div>
                  )}
                  <button className="bb-btn" type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Email OTP"}
            </button>
          </form>
              ) : (
                <form onSubmit={handleVerifyEmailOTP}>
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ color: "var(--color-text-dim)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                      OTP sent to {email.replace(/(.{2}).*(@.*)/, '$1***$2')}
                    </p>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                      style={{ width: "100%" }}
                    />
                  </div>
                  {error && (
                    <div
                      style={{
                        color: "var(--color-danger)",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                      }}
                    >
                      {error}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="bb-btn" type="submit" disabled={loading} style={{ flex: 1 }}>
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                    <button
                      type="button"
                      className="bb-btn outline"
                      onClick={resetOTP}
                      style={{ padding: "0.6rem 1rem" }}
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

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
