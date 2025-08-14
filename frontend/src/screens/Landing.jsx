import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/styles.css";

// Utility function for class names
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Button Component
function Button({ children, onClick, type = "button", variant = "default", className = "", disabled = false }) {
  const baseClasses = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500",
    outline: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:ring-gray-500",
    ghost: "text-gray-900 hover:bg-gray-100 focus:ring-gray-500"
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseClasses, variants[variant], disabled && "opacity-50 cursor-not-allowed", className)}
    >
      {children}
    </button>
  );
}

// Main App Component
export default function App() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-8 bg-gray-50">

      <section className="flex">
        <Button onClick={handleSignIn} variant="outline" className="absolute top-0 right-0 px-8 py-3">
          Sign In
        </Button>
      </section>

      <section className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl">

        <section className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to StudyBuddy
          </h1>
          <p className="text-lg text-gray-600 max-w-lg">
            Join thousands of students connecting with their academic community. 
            Share resources, collaborate on projects, and stay updated with your institution.
          </p>
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <section className="text-center">
            <section className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </section>
            <h3 className="font-medium text-gray-900 mb-1">Academic Resources</h3>
            <p className="text-sm text-gray-600">Access study materials and course content</p>
          </section>
          
          <section className="text-center">
            <section className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </section>
            <h3 className="font-medium text-gray-900 mb-1">Connect with Peers</h3>
            <p className="text-sm text-gray-600">Find study groups and classmates</p>
          </section>
          
          <section className="text-center">
            <section className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </section>
            <h3 className="font-medium text-gray-900 mb-1">Track Progress</h3>
            <p className="text-sm text-gray-600">Monitor your academic achievements</p>
          </section>
        </section>
      </section>
      
      <section className="flex gap-4">
        <Button onClick={handleGetStarted} className="px-8 py-3">
          Get Started
        </Button>
      </section>
    </main>
  );
}