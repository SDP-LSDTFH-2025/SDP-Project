import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home, Login, Signup ,Forgot,Message} from "./screens";
import { Welcome } from "./components/Welcome.jsx";
import { Registration } from "./components/Registration.jsx";
import { Interests } from "./components/Interests.jsx";
import { Success } from "./components/Success.jsx";

// ProtectedRoute wrapper to guard private routes
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage on app mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return <p>Loading...</p>; // Prevent route rendering before state restoration

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route
          path="/"
          element={user ? <Navigate to="/home" replace /> : <Welcome />}
        />

        {/* Signup flow */}
        <Route path="/signup" element={<Signup setUser={setUser} />}>
          <Route path="registration" element={<Registration user={user} />} />
          <Route path="interests" element={<Interests user={user} />} />
          <Route path="success" element={<Success setUser={setUser} />} />
        </Route>

        {/* Login page */}
        <Route
          path="/login"
          element={user ? <Navigate to="/home" replace /> : <Login setUser={setUser} />}
        />
       <Route path="/messages" element={<Message />} />
       <Route path="/forgot" element={<Forgot />} />
        /* Home route - only for logged-in users */
        <Route
          path="/home"
          element={
            <ProtectedRoute user={user}>
              <Home user={user} />
            </ProtectedRoute>
          }
        />

        {/* Welcome page (registration entry) */}
        <Route path="/welcome" element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  );
}
