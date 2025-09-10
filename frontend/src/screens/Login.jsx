import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";


function Login({ setUser }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
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
        console.log("logged in!");
        localStorage.setItem("user", JSON.stringify(data.data));
        localStorage.setItem("token", data.token);
        setUser(data.data);
        navigate("/home");
      } else {
        alert(data.success || "Authentication failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  }

  async function handleManualLogin(){
    try{
      const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER ;
      const res = await fetch(`${SERVER}/api/v1/auth/logIn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
          }),
      });

      const data = await res.json();

      if (data.success) {
        console.log("Signed In!");
        localStorage.setItem("user", JSON.stringify(data.data)); // not safe
        localStorage.setItem("token", data.token);

        setUser(data.data);
        navigate("/home");
      } else {
        alert(data.success || "Authentication failed");
      }

    } catch (error) {
      console.error("Sign In error:", error);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h1 className="logo">StudyBuddy</h1>
        <p className="subtitle">Welcome back! Sign in to your account</p>

        <form className="login-form" onSubmit={(e) => {e.preventDefault(); handleManualLogin();}}>
          <label>Email</label>
          <input type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => HandleInputChange("email",e.target.value)}/>

          <label>Password</label>
          <input type="password" placeholder="Enter your password" value={formData.password} onChange={(e) => HandleInputChange("password",e.target.value)}/>

          <div className="forgot">
            <Link to="/forgot">Forgot password?</Link>
          </div>

          <button type="submit" className="login-btn" disabled={!isFormValid}>
            Sign In
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
