import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Home, Login, Signup ,Forgot} from "./screens";
import { Welcome } from "./components/Welcome.jsx";
import { Registration } from "./components/Registration.jsx";
import { Interests } from "./components/Interests.jsx";
import { Success } from "./components/Success.jsx";
import { CallProvider } from "./components/CallProvider.jsx";
import Messages from "./pages/Messages.jsx";

// ProtectedRoute wrapper to guard private routes
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Restore user from localStorage on app mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Invalidate queries when user changes (login/logout)
  useEffect(() => {
    if (user) {
      // User logged in - invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } else {
      // User logged out - clear all caches
      queryClient.clear();
    }
  }, [user, queryClient]);

  if (loading) return <p>Loading...</p>; // Prevent route rendering before state restoration

  return (
    <CallProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
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

        {/* Messages route - only for logged-in users */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute user={user}>
              <Messages />
            </ProtectedRoute>
          }
        />

        {/* Welcome page (registration entry) */}
        <Route path="/welcome" element={<Welcome />} />
        </Routes>
      </BrowserRouter>
    </CallProvider>
  );
}
