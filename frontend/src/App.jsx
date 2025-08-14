import { useState } from "react";
import { Welcome } from "./components/Welcome.jsx";
import { Registration } from "./components/Registration.jsx";
import { Interests } from "./components/Interests.jsx";
import { Success } from "./components/Success.jsx";

export default function App() {
  const [currentStep, setCurrentStep] = useState("welcome");

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
}