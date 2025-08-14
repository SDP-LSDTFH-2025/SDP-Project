import { Outlet, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

function Signup({ setUser }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  function handleGoogleLogin(credentialResponse){
    const token = jwtDecode(credentialResponse.credential);
    console.log(jwtDecode(credentialResponse.credential));
    const userProfile = {
      email: token.email,
      name : token.given_name,
      surname : token.family_name,
      fullName: token.name,
      picture: token.picture,
      registrationComplete: false
    };

    localStorage.setItem("user", JSON.stringify(userProfile));
    setUser(userProfile);
    setProfile(userProfile);

    // Navigate to /signup/register
    navigate("register");
  };

  const isRegistering = location.pathname.endsWith("/register");

  return (
    <main className="signup-container">
      <h1>Sign Up</h1>

      {!isRegistering && (
        <GoogleLogin onSuccess={handleGoogleLogin} onError={() => alert("Login Failed")} />
      )}

      <Outlet context={{ profile, onBack: () => navigate(-1) }} />
    </main>
  );
}

export default Signup;