import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home, Login, Signup } from "./screens";
import { Welcome } from "./components/Welcome.jsx";
import { Registration } from "./components/Registration.jsx";
import { Interests } from "./components/Interests.jsx";
import { Success } from "./components/Success.jsx";

export default function App() {
  const [user, setUser, haveToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && !storedUser.includes("undefined")) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page: if logged in → go to home */}
        <Route
          path="/"
          element={user?.email ? <Navigate to="/home" /> : <Welcome />}
        />

        {/* Signup route */}
        <Route
          path="/signup"
          element={
            user?.email && user.registrationComplete
              ? <Navigate to="/home" />
              : <Signup/>
          }
        >
          <Route path="registration" element={<Registration />} />
          <Route path="interests" element={<Interests />} />
          <Route path="success" element={<Success setUser={setUser}/>} />
        </Route>

        {/* Login route with Google Auth verification */}
        <Route
          path="/login"
          element={
            user?.email
              ? <Navigate to="/home" />
              : <Login setUser={setUser} Token ={haveToken} />
          }
        />

        {/* Home route - only for logged-in users */}
        <Route
          path="/home"
          element={user?.email ? <Home user={user} /> : <Navigate to="/" />}
        />

        {/* Registration steps */}
        <Route
          path="/welcome"
          element={<Welcome onStartRegistration={() => {}} />}
        />

      </Routes>
    </BrowserRouter>
  );
}
