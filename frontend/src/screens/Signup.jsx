import { Outlet, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

function Signup() {
  const navigate = useNavigate();


  function handleGoogleLogin(credentialResponse){
    const token = credentialResponse.credential;
    localStorage.setItem("Token", JSON.stringify(token));

    // Navigate to /signup/register
    navigate("registration");
  };

  const isRegistering = location.pathname.endsWith("/registration");
  const isInterests = location.pathname.endsWith("/interests");
  const isSuccess = location.pathname.endsWith("/success");
  return (
    <main className="signup-container">
      {!isRegistering || !isSuccess || !isInterests && (
        <>
          <h1>Sign Up</h1>
          <GoogleLogin onSuccess={handleGoogleLogin} onError={() => alert("Login Failed")} />
        </>
      )}
            <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">

        <Outlet />
      </div>
    </main>
  );
}

export default Signup;