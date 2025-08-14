/** This will contain the routes for all screens and pages
 * It will also contain a localStorage to allow us to see if the user is known
 */
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom' ;
import { useState } from 'react';
import { Landing, Home, Login, Signup } from './screens';
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


  const handleStartRegistration = () => {
    setCurrentStep("registration");
  };

  const handleBackToWelcome = () => {
    setCurrentStep("welcome");
  };

  const handleRegistrationComplete = () => {
    setCurrentStep("interests");
  };

  const handleBackToRegistration = () => {
    setCurrentStep("registration");
  };

  const handleInterestsComplete = () => {
    setCurrentStep("success");
  };

  const handleRestart = () => {
    setCurrentStep("welcome");
  };

  switch (currentStep) {
    case "welcome":
      return <Welcome onStartRegistration={handleStartRegistration} />;
    case "registration":
      return (
        <Registration 
          onComplete={handleRegistrationComplete}
          onBack={handleBackToWelcome}
        />
      );
    case "interests":
      return (
        <Interests 
          onComplete={handleInterestsComplete}
          onBack={handleBackToRegistration}
          onSkip={handleInterestsComplete}
        />
      );
    case "success":
      return <Success onRestart={handleRestart} />;
    default:
      return <Welcome onStartRegistration={handleStartRegistration} />;
  }

  /*
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user?.email ? <Navigate to="/home" /> : <Landing />} />
        <Route path="/signup" element={user?.email && user.registrationComplete ? <Navigate to="/home" /> : <Signup setUser={setUser} />}>
          <Route 
            path="register" element={<Registration onComplete={() => window.location.replace("/home")} onBack={() => window.history.back()} />} />
        </Route>
        <Route path="/login" element={user?.email ? <Navigate to="/home" /> : <Login setUser={setUser} />} />
        <Route path="/home" element={user?.email ? <Home user={user} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
  */

}