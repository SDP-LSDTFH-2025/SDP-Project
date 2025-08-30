import { Button } from "./ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.jsx";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Success.css";

export function Success({ setUser }) {
const navigate = useNavigate();

useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const userData = JSON.parse(storedUser);
    setUser(userData);
    // Redirect automatically after 1.5 seconds
    const timer = setTimeout(() => navigate("/home"), 1500);
    return () => clearTimeout(timer);
  } else {
    console.error("No user data found in localStorage");
    navigate("/signup"); // Redirect to signup if no user data
  }
}, [setUser, navigate]);

  return (
    <div className="success-container">
      <div className="success-card">
        <header className="success-header">
          <div className="success-icon" aria-hidden="true">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="success-icon-svg"
              aria-hidden="true"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="success-title">Welcome to StudyBuddy!</h1>
          <p className="success-description">
            Your account has been created successfully. You're now part of our academic community.
          </p>
        </header>

        <section className="success-content">
          <div className="success-features" role="list">
            <p className="success-feature" role="listitem">🎓 Access to study materials</p>
            <p className="success-feature" role="listitem">👥 Connect with classmates</p>
            <p className="success-feature" role="listitem">📚 Join study groups</p>
            <p className="success-feature" role="listitem">📊 Track your progress</p>
          </div>

          <div className="success-actions">
            <button
              type="button"
              className="success-button success-button-primary"
              onClick={() => navigate('/home')}
            >
              Go to Dashboard
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}