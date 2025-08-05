import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

const AuthPage = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      setOtpSent(true);
      // Here you'd call backend API to send OTP
      console.log(`Sending OTP to ${phone}`);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you'd verify OTP etc.
    console.log(`Logging in with ${phone} and OTP: ${otp}`);
  };

  return (
    <div className={`auth-container${darkMode ? ' dark' : ''}`}>
      <button
        className="dark-toggle"
        onClick={() => setDarkMode((prev) => !prev)}
      >
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      <div className="auth-box">
        <h1>Welcome</h1>
        <p className="subheading">Log in to continue to your dashboard.</p>
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Log In</h2>
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {!otpSent ? (
            <button className="send-otp" onClick={handleSendOtp}>
              Send OTP
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button type="submit">Log In</button>
            </>
          )}
        </form>
        <p className="signup-text">
          Don’t have an account?{' '}
          <button className="signup-button" onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
