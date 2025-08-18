import { Outlet, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

function Signup({ setUser }) {
  const navigate = useNavigate();


   async function handleLogin(credentialResponse){
    try {
      const token = credentialResponse.credential;

      // Send token to backend for verification  /* this shall be changend to env*/
      const res = await fetch("http://localhost:3000/api/v1/auth/google/verify", {
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
  };

  const isRegistering = location.pathname.endsWith("/registration");
  const isInterests = location.pathname.endsWith("/interests");
  const isSuccess = location.pathname.endsWith("/success");
  return (
    <main className="signup-container">
      {!isRegistering && !isSuccess && !isInterests && (
        <>
          <h1>Sign Up</h1>
          <GoogleLogin onSuccess={handleLogin} onError={() => alert("Signin Failed")} />
        </>
      )}

      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">

        <Outlet context={{ setUser }}/>
      </div>
    </main>
  );
}

export default Signup;