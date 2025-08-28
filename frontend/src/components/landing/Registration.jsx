import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function Registration({ onComplete, onBack }) {
  const { profile } = useOutletContext() || {};

  const [formData, setFormData] = useState({
    university: "",
    faculty: "",
    course: "",
    year: "",
    surname: "",
    fullName: "",
  });

  // Prefill fullName on mount if profile exists
  useEffect(() => {
    if (profile) {
      // If fullName is not yet set in formData, set it from profile
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || profile.name || "",
        surname: prev.surname || profile.surname || "", // You can parse surname from fullName if you want
      }));
    }
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registration data:", formData);
    onComplete();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    formData.university &&
    formData.faculty &&
    formData.course &&
    formData.year &&
    formData.surname &&
    formData.fullName;

  return (
    <section className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <section className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
        <section className="text-center mb-6">
          <h1 className="text-2xl font-bold">Create Your Student Profile</h1>
          <p className="text-gray-500">
            Tell us about your academic background to connect you with the right community
          </p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name + Surname */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section>
              <label className="block text-sm font-medium mb-1" htmlFor="fullName">
                Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Enter your name"
                className="w-full border rounded-lg px-3 py-2"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </section>

            <section>
              <label className="block text-sm font-medium mb-1" htmlFor="surname">
                Surname
              </label>
              <input
                id="surname"
                type="text"
                placeholder="Enter your surname"
                className="w-full border rounded-lg px-3 py-2"
                value={formData.surname}
                onChange={(e) => handleInputChange("surname", e.target.value)}
                required
              />
            </section>
          </section>

          {/* University */}
          <section>
            <label className="block text-sm font-medium mb-1" htmlFor="university">
              University/Institution
            </label>
            <input
              id="university"
              type="text"
              placeholder="e.g., Stanford University"
              className="w-full border rounded-lg px-3 py-2"
              value={formData.university}
              onChange={(e) => handleInputChange("university", e.target.value)}
              required
            />
          </section>

          {/* Faculty + Year */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section>
              <label className="block text-sm font-medium mb-1" htmlFor="faculty">
                Faculty/School
              </label>
              <select
                id="faculty"
                className="w-full border rounded-lg px-3 py-2"
                value={formData.faculty}
                onChange={(e) => handleInputChange("faculty", e.target.value)}
                required
              >
                <option value="">Select your faculty</option>
                <option value="engineering">Engineering</option>
                <option value="medicine">Medicine</option>
                <option value="business">Business</option>
                <option value="arts">Arts & Humanities</option>
                <option value="science">Science</option>
                <option value="law">Law</option>
                <option value="education">Education</option>
                <option value="accounting">Accounting</option>
                <option value="other">Other</option>
              </select>
            </section>

            <section>
              <label className="block text-sm font-medium mb-1" htmlFor="year">
                Year of Study
              </label>
              <select
                id="year"
                className="w-full border rounded-lg px-3 py-2"
                value={formData.year}
                onChange={(e) => handleInputChange("year", e.target.value)}
                required
              >
                <option value="">Select year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="5">5th Year</option>
                <option value="graduate">Graduate Student</option>
                <option value="phd">PhD Student</option>
              </select>
            </section>
          </section>

          {/* Course */}
          <section>
            <label className="block text-sm font-medium mb-1" htmlFor="course">
              Course/Major
            </label>
            <input
              id="course"
              type="text"
              placeholder="e.g., Computer Science"
              className="w-full border rounded-lg px-3 py-2"
              value={formData.course}
              onChange={(e) => handleInputChange("course", e.target.value)}
              required
            />
          </section>

          {/* Buttons */}
          <section className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 border rounded-lg py-2 text-gray-700 hover:bg-gray-100"
            >
             
            </button>
            <button
              type="submit"
              className={`flex-1 rounded-lg py-2 text-black ${
                isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
              }`}
              disabled={!isFormValid}
            >
              Complete Registration
            </button>
          </section>
        </form>
      </section>
    </section>
  );
}
