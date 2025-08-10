/** This will contain the routes for all screens and pages
 * It will also contain a localStorage to allow us to see if the user is known
 */
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom' ;
import { useState } from 'react';
import { Landing, Home, Login, Signup } from './screens';

import { Registration } from "./components/landing" ;

function App() {
  const [user, setUser] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser && !storedUser.includes("undefined")) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
}

export default App
