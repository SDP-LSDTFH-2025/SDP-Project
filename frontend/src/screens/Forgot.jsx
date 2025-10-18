import { useState } from "react";
import { Link } from "react-router-dom";
import { showSuccess } from "../utils/toast";
import "./Forgot.css";

function Forgot() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Password reset requested for:", email);

    // Call your backend API here
    showSuccess("If this email exists, you'll receive a reset link.");
  };

  return (
    <main className="forgot-page">
      <div className="forgot-card">
        <h1 className="logo">StudyBuddy</h1>
        <p className="subtitle">Reset your password</p>

        <form onSubmit={handleSubmit} className="forgot-form">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p className="subtitle">We'll send you a link to reset your password</p>
          <button type="submit" className="forgot-btn">
            Reset Password
          </button>
        </form>

        <p className="footer-text">
          
          <Link to="/login" className="link">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Forgot;
