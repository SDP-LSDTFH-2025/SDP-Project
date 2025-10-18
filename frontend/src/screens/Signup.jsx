import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { manualSignup, googleAuth } from "../api/auth";
import { showError } from "../utils/toast";
import "./Signup.css";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

function Signup({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  function handleInputChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const isFormValid = formData.email && formData.password;

  // --- Manual signup ---
  async function handleSignup() {
    try {
      setLoading(true);
      const data = await manualSignup(formData.email, formData.username, formData.password);
      setUser(data);
      navigate("registration");
    } catch (error) {
      console.error("Sign up error:", error);
      showError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // --- Google signup ---
  async function handleGoogleSignup(credentialResponse) {
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
        }
      });
      client.requestAccessToken();

      navigate("registration");
    } catch (error) {
      console.error("Google signup error:", error);
      showError("Google signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isSignupRoot =
    location.pathname.endsWith("/signup") || location.pathname === "/signup";

  if (isSignupRoot) {
    return (
      <main className="signup-page">
        <div className="signup-card">
          <h1 className="logo">StudyBuddy</h1>
          <p className="subtitle">Welcome! Create your account to get started</p>

          <form
            className="signup-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignup();
            }}
          >
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />

            <label>Username</label>
            <input
              placeholder="Optional"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />

            <button
              type="submit"
              className="signup-btn"
              disabled={!isFormValid || loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="google-btn">
            <GoogleLogin
              onSuccess={handleGoogleSignup}
              onError={() => showError("Google signup failed")}
            />
          </div>

          <p className="footer-text">
            Already have an account?{" "}
            <a href="/login" className="link">
              Sign in
            </a>
          </p>
        </div>
      </main>
    );
  } else {
    return (
      <main className="signup-page">
        <Outlet context={{ setUser }} />
      </main>
    );
  }
}

export default Signup;
