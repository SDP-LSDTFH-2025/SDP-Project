import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./Signup.css";

function Signup({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = location.pathname === "/signup";

  async function handleLogin(credentialResponse) {
    try {
      const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER ;
      const token = credentialResponse.credential;


      // Send token to backend for verification  /* this shall be changend to env*/
      const res = await fetch(`${SERVER}/api/v1/auth/google/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: token }),
      });

      const data = await res.json();

      if (data.success) {
        console.log("Signed up!");
        localStorage.setItem("user", JSON.stringify(data.data));

        setUser(data.data);
        navigate("registration");
      } else {
        alert(data.success || "Authentication failed");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      alert("Something went wrong. Please try again.");
    }
  }

  const isRegistering = location.pathname.endsWith("/registration");
  const isInterests = location.pathname.endsWith("/interests");
  const isSuccess = location.pathname.endsWith("/success");

  const isSignupRoot = location.pathname.endsWith("/signup") ||
  location.pathname === "/signup";

  if (isSignupRoot) {
    return (
      <main className="signup-page">
        <div className="signup-card">
          <h1 className="logo">StudyBuddy</h1>
          <p className="subtitle">Welcome! Create your account to get started</p>

          <form className="signup-form">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" />

            <label>Password</label>
            <input type="password" placeholder="Enter your password" />

            <button type="submit" className="signup-btn">
              Sign Up
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="google-btn">
            <GoogleLogin
              onSuccess={handleLogin}
              onError={() => alert(`Signin Failed + ${credentialResponse} `)}
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