import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {
  const navigate = useNavigate();

   async function handleLogin(credentialResponse){
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

        setUser(data.data);
        navigate("/home");
      } else {
        alert(data.success || "Authentication failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <section className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md transform transition-all duration-300 hover:scale-[1.02]">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="mt-2 text-gray-500 text-sm">Login to continue</p>
        </header>
        <section className="space-y-6">
          <section className="flex justify-center">
            <GoogleLogin
              onSuccess={handleLogin}
              onError={() => console.log("Login failed")}
              theme="filled_blue"
              size="large"
              text="continue_with"
              width="300"
            />
          </section>
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 font-medium hover:underline transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}

export default Login;
