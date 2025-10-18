import { useState, useEffect } from "react";
import { Button } from "./ui/button.jsx";
import { useNavigate } from "react-router-dom";
import { showError } from "../utils/toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./ui/card.jsx";
import "./styles/Interest.css";
import { registerInterests } from "../api/auth";

const academicInterests = [
  "Mathematics", "Computer Science", "Physics", "Chemistry", "Biology",
  "Psychology", "Economics", "Business", "Engineering", "Medicine",
  "Law", "Literature", "History", "Philosophy", "Art & Design",
  "Music", "Languages", "Geography", "Political Science", "Sociology",
  "Architecture", "Environmental Science", "Data Science", "AI & Machine Learning",
  "Web Development", "Mobile Development", "Research", "Statistics"
];

const studyPreferences = [
  "Group Study", "Individual Study", "Online Learning", "Library Study",
  "Project-Based Learning", "Discussion Groups", "Peer Tutoring",
  "Study Groups", "Research Projects", "Practical Labs", "Case Studies",
  "Problem Solving", "Creative Projects", "Field Work"
];

export function Interests({ user }) {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [currentUser, setCurrentUser] = useState(user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    }
  }, [currentUser]);

  if (!currentUser) return <p>Loading user info...</p>;

  const handleInterestToggle = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handlePreferenceToggle = (preference) => {
    setSelectedPreferences((prev) =>
      prev.includes(preference)
        ? prev.filter((p) => p !== preference)
        : [...prev, preference]
    );
  };

  const handleInterests = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const registrationData = JSON.parse(localStorage.getItem("registrationData")) || {};
      const userty = JSON.parse(localStorage.getItem("user"));

      const payload = {
        user_id: userty.id,
        course: registrationData.course || "",
        year_of_study: registrationData.year || "",
        academic_interests: selectedInterests.join(", "),
        study_preferences: selectedPreferences.join(", "),
        institution: registrationData.university || "",
        school: registrationData.faculty || ""
      };

      const data = await registerInterests(payload);

      localStorage.setItem("payload", JSON.stringify(data));
      localStorage.removeItem("registrationData");
      navigate("../success");
    } catch (error) {
      console.error("Capturing interests error:", error);
      showError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSkip = () => navigate("../success");

  return (
    <div className="interests-container">
      <Card className="interests-card">
        <CardHeader className="interests-header">
          <CardTitle className="interests-title">Tell Us About Your Interests</CardTitle>
          <CardDescription className="interests-description">
            Select your academic interests and study preferences to help us connect you with relevant content and study partners
          </CardDescription>
        </CardHeader>

        <CardContent className="interests-content">
          <form className="interests-form" onSubmit={handleInterests}>
            <div className="interests-sections">
              {/* Academic Interests */}
              <section className="interest-section">
                <h3 className="section-title">Academic Interests</h3>
                <p className="section-description">
                  Select subjects and topics you're interested in or studying
                </p>
                <div className="badge-container">
                  {academicInterests.map((interest) => (
                    <span
                      key={interest}
                      className={`interest-badge ${selectedInterests.includes(interest) ? "selected" : ""}`}
                      onClick={() => handleInterestToggle(interest)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleInterestToggle(interest);
                        }
                      }}
                      aria-pressed={selectedInterests.includes(interest)}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </section>

              {/* Study Preferences */}
              <section className="interest-section">
                <h3 className="section-title">Study Preferences</h3>
                <p className="section-description">
                  Select your preferred ways of learning and studying
                </p>
                <div className="badge-container">
                  {studyPreferences.map((pref) => (
                    <span
                      key={pref}
                      className={`interest-badge ${selectedPreferences.includes(pref) ? "selected" : ""}`}
                      onClick={() => handlePreferenceToggle(pref)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handlePreferenceToggle(pref);
                        }
                      }}
                      aria-pressed={selectedPreferences.includes(pref)}
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {(selectedInterests.length > 0 || selectedPreferences.length > 0) && (
              <div className="selections-summary">
                <h4 className="summary-title">Your Selections:</h4>
                {selectedInterests.length > 0 && (
                  <div className="summary-section">
                    <p className="summary-label">Academic Interests ({selectedInterests.length}):</p>
                    <div className="summary-badges">
                      {selectedInterests.map((i) => (
                        <span key={i} className="summary-badge">{i}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedPreferences.length > 0 && (
                  <div className="summary-section">
                    <p className="summary-label">Study Preferences ({selectedPreferences.length}):</p>
                    <div className="summary-badges">
                      {selectedPreferences.map((p) => (
                        <span key={p} className="summary-badge">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="interests-actions">
              <Button
                type="button"
                className="action-button action-button-outline"
                onClick={() => navigate("../registration")}
              >
                Back
              </Button>
              <Button
                type="button"
                className="action-button action-button-ghost"
                onClick={onSkip}
              >
                Skip for now
              </Button>
              <Button
                type="submit"
                className="action-button action-button-primary"
                disabled={!(selectedInterests.length > 0 || selectedPreferences.length > 0) || loading}
              >
                {loading ? "Saving..." : "Continue"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
