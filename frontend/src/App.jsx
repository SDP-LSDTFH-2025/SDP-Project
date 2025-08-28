/** This will contain the routes for all screens and pages
 * It will also contain a localStorage to allow us to see if the user is known
 */

import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home, Login, Signup ,Forgot} from "./screens";
import { Welcome } from "./components/Welcome.jsx";
import { Registration } from "./components/Registration.jsx";
import { Interests } from "./components/Interests.jsx";
import { Success } from "./components/Success.jsx";
// import { Registration } from "./components/landing" ;

export default function App() {

  const [user, setUser] = useState({});
  const [currentStep, setCurrentStep] = useState("welcome");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser && !storedUser.includes("undefined")) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  
  return (
    <BrowserRouter>
      <Routes>
        /* Landing page: if logged in, go to home, else stay */
        <Route
          path="/"
          element={user?.google_id ? <Navigate to="/home" /> : <Welcome />}
        />

        /* Signup route */
        <Route
          path="/signup"
          element={<Signup setUser={setUser} />}
        >
          <Route path="registration" element={<Registration user={user} />} />
          <Route path="interests" element={<Interests user={user} />} />
          <Route path="success" element={<Success setUser={setUser} />} />
        </Route>

        /* Login route with Google Auth verification */
        <Route
          path="/login"
          element={
            user?.google_id
              ? <Navigate to="/home" />
              : <Login setUser={setUser} />
          }
        />
       
       <Route path="/forgot" element={<Forgot />} />
        /* Home route - only for logged-in users */
        <Route
          path="/home"
          element={user?.google_id ? <Home user={user} /> : <Navigate to="/login" />}
        />

        /* Registration steps */
        <Route
          path="/welcome"
          element={<Welcome onStartRegistration={() => {}} />}
        />

      </Routes>
    </BrowserRouter>
  );


}