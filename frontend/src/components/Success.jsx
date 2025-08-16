import { Button } from "./ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "./styles/Success.css";

export function Success({ setUser }) {
const navigate = useNavigate();

    useEffect(() => {
    async function submitRegistration() {
      const token = JSON.parse(localStorage.getItem("Token") || '""');
      const registrationData = JSON.parse(localStorage.getItem("registrationData") || "{}");
      const interestData = JSON.parse(localStorage.getItem("interestData") || "[]");
      const preferenceData = JSON.parse(localStorage.getItem("preferenceData") || "[]");

      if (!token) {
        console.error("No token found in localStorage");
        navigate("/login");
        return;
      }
      const { sub: google_id } = jwtDecode(token);
      const payload = {
        google_id,
        course: registrationData.course || "",
        year_of_study: registrationData.year || "",
        academic_interests: interestData.join(", "),
        study_preferences: preferenceData.join(", "),
        institution: registrationData.university || "",
        school: registrationData.faculty || ""
      };

      try {
        const res = await fetch("http://localhost:3000/api/v1/users/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
          console.log("Registration success");
          setUser(jwtDecode(token));
          localStorage.setItem("user", JSON.stringify(jwtDecode(token)));
          localStorage.removeItem("registrationData");
          localStorage.removeItem("interestData");
          localStorage.removeItem("preferenceData");

          navigate("/home");
        } else {
          const err = await res.json();
          console.error("Registration failed:", err);
        }
      } catch (error) {
        console.error("Error submitting registration:", error);
      }
    }

    submitRegistration();
  }, [navigate]);

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
              onClick={() => navigate("/home")}
            >
              Go to Dashboard
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}