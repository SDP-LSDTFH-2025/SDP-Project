import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import "./Signup.css";

function Signup({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  //const isRoot = location.pathname === "/signup";

  const [formData, setFormData] = useState({
    email: "",
    username:"",
    password:""
  });

  function HandleInputChange(field, value){
    setFormData((prev) => ({...prev, [field]: value }));
  }

  const isFormValid = formData.email && formData.password;

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
        localStorage.setItem("token", data.token);

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

  // this will call Huli's api(hopefully);
  async function handleSignup(){
    try{
      const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER ;
      console.log("handle sign up");
      const res = await fetch(`${SERVER}/api/v1/auth/signIn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email || "usermail@gmail.com",
          username: formData.username || "user123",
          password: formData.password || "password1"
         }),
      });

      const data = await res.json();

      if (res.ok) {
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

  /*const isRegistering = location.pathname.endsWith("/registration");
  const isInterests = location.pathname.endsWith("/interests");
  const isSuccess = location.pathname.endsWith("/success");*/

  const isSignupRoot = location.pathname.endsWith("/signup") ||
  location.pathname === "/signup";

  if (isSignupRoot) {
    return (
      <main className="signup-page">
        <div className="signup-card">
          <h1 className="logo">StudyBuddy</h1>
          <p className="subtitle">Welcome! Create your account to get started</p>

          <form className="signup-form" onSubmit={ (e) => {e.preventDefault(); handleSignup(); } }>
            <label>Email</label>
            <input type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => HandleInputChange("email",e.target.value)}/>

            <label>Username</label>
            <input placeholder="Optional" value={formData.username} onChange={(e) => HandleInputChange("username",e.target.value)}/>

            <label>Password</label>
            <input type="password" placeholder="Enter your password" value={formData.password} onChange={(e) => HandleInputChange("password",e.target.value)}/>

            <button type="submit" className="signup-btn" disabled={!isFormValid}>
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