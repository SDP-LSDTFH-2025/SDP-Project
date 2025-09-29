import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { manualLogin, googleAuth } from "../api/auth";
import "./Login.css";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

function Login({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const isFormValid = formData.email && formData.password;

  function handleInputChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  // --- Manual login ---
  async function handleManualLogin() {
    try {
      setLoading(true);
      const data = await manualLogin(formData.email, formData.password);
      setUser(data);
      navigate("/home");
    } catch (error) {
      console.error("Sign In error:", error);
      alert("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // --- Google login ---
  async function handleGoogleLogin(credentialResponse) {
    try {
      setLoading(true);
      const data = await googleAuth(credentialResponse.credential);
      setUser(data);

      // Request Google Calendar token
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_CLIENT_ID,
        scope: CALENDAR_SCOPE,
        callback: (resp) => {
          if (resp.access_token) {
            localStorage.setItem("calendar_token", resp.access_token);
            console.log("Calendar token acquired:", resp.access_token);
          }
        },
      });
      client.requestAccessToken();

      navigate("/home");
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h1 className="logo">StudyBuddy</h1>
        <p className="subtitle">Welcome back! Sign in to your account</p>

        <form
          className="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleManualLogin();
          }}
        >
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />

          <div className="forgot">
            <Link to="/forgot">Forgot password?</Link>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={!isFormValid || loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="google-btn">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => alert("Google login failed")}
          />
        </div>

        <p className="footer-text">
          Don’t have an account?{" "}
          <Link to="/signup" className="link">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
