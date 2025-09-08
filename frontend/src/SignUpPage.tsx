import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number, city?: string, country?: string} | null>(null);
  const [locationError, setLocationError] = useState("");
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

const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLocationError("");
  
  try {
    // Get user's location
    const userLocation = await getCurrentLocation();
    setLocation(userLocation);
    
    const res = await fetch("http://localhost:3001/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        username, 
        name, 
        contact, 
        password, 
        role,
        location: userLocation,
        pincode
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
  }
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
          <form
            onSubmit={handleSignUp}
            style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
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
            <label style={{ color: "var(--color-text-dim)", fontWeight: 600 }}>
              Username:
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Choose a unique username"
                style={{ width: "100%" }}
              />
            </label>
            <label style={{ color: "var(--color-text-dim)", fontWeight: 600 }}>
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </label>
            <label style={{ color: "var(--color-text-dim)", fontWeight: 600 }}>
              Phone or Email:
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </label>
            <label style={{ color: "var(--color-text-dim)", fontWeight: 600 }}>
              Password:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </label>
            <label style={{ color: "var(--color-text-dim)", fontWeight: 600 }}>
              Pincode:
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter your pincode/zip code"
                style={{ width: "100%" }}
              />
            </label>
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
            <button className="bb-btn" type="submit">
              Sign Up
            </button>
          </form>
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
// ...existing code...
