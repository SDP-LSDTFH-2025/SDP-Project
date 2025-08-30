import { useState } from "react";
import "./styles/Registration.css";
import { useNavigate } from "react-router-dom";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "./ui/select";
export function Registration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    university: "",
    faculty: "",
    course: "",
    year: "",
  });
  
  const handleNext = (e) => {
    e.preventDefault();
    // Save step data to localStorage
    localStorage.setItem("registrationData", JSON.stringify(formData));
    navigate("../interests");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    formData.university &&
    formData.faculty &&
    formData.course &&
    formData.year;

  return (
    <div className="registration-container">
      <div className="registration-card">
        <header className="registration-header">
          <h2 className="registration-title">Create Your Student Profile</h2>
          <p className="registration-description">
            Tell us about your academic background to connect you with the right community
          </p>
        </header>

        <main className="registration-content">
          <form onSubmit={handleNext} className="registration-form">
            

            <div className="form-field">
              <label htmlFor="university" className="form-label">University/Institution</label>
              <input
                id="university"
                type="text"
                placeholder="e.g., Stanford University, MIT, University of Oxford"
                className="form-input"
                value={formData.university}
                onChange={(e) => handleInputChange("university", e.target.value)}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="faculty" className="form-label">Faculty/School</label>
                <Select
                  onValueChange={(value) =>
                    handleInputChange("faculty", value)
                  }
                >
                  <SelectTrigger className="select-trigger">
                    <SelectValue placeholder="Select your faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">
                      Engineering
                    </SelectItem>
                    <SelectItem value="medicine">
                      Medicine
                    </SelectItem>
                    <SelectItem value="business">
                      Business
                    </SelectItem>
                    <SelectItem value="arts">
                      Arts & Humanities
                    </SelectItem>
                    <SelectItem value="science">
                      Science
                    </SelectItem>
                    <SelectItem value="law">Law</SelectItem>
                    <SelectItem value="education">
                      Education
                    </SelectItem>
                    <SelectItem value="Accounting">
                      Accounting
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="form-field">
                <label htmlFor="year" className="form-label">Year of Study</label>
                <Select
                  onValueChange={(value) =>
                    handleInputChange("year", value)
                  }
                >
                  <SelectTrigger className="select-trigger">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                    <SelectItem value="5">5th Year</SelectItem>
                    <SelectItem value="graduate">
                      Graduate Student
                    </SelectItem>
                    <SelectItem value="phd">
                      PhD Student
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="course" className="form-label">Course/Major</label>
              <input
                id="course"
                type="text"
                placeholder="e.g., Computer Science, Mechanical Engineering, Psychology"
                className="form-input"
                value={formData.course}
                onChange={(e) => handleInputChange("course", e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"

                className="back"
                onClick={() => navigate("..")}

              >
                Back
              </button>
              <button
                type="submit"
                className="form-button form-button-primary"
                disabled={!isFormValid}
              >
                Complete Registration
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
