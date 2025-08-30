import { Button } from "./ui/button.jsx";
import './styles/Welcome.css';
import {gsap} from "gsap";
import {ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import img1 from "../assets/rhodes.png";
import img2 from "../assets/stel.png";
import img3 from "../assets/uct.png";
import img4 from "../assets/uj.png";
import img5 from "../assets/up.png";
import img6 from "../assets/uwc.png";
import img7 from "../assets/wit.png";
import img8 from "../assets/ukzn.png";
import img9 from "../assets/nwu.png";
import img10 from "../assets/unisa.png";
import img11 from "../assets/TUT.png";
import img12 from "../assets/cput.png";
import img13 from "../assets/VUT.png";
import img14 from "../assets/msa.png";
import logo from "../assets/logo.svg";
gsap.registerPlugin(ScrollTrigger);
const cardData = [
  {
    title: "STUDY RESOURCES",
    subtitle: "Find shared notes, guides, and practice tests"
  },
  {
    title: "COLLABORATIVE PROJECT HUB",
    subtitle: "Meet partners for research and assignments"
  },
  {
    title: "ASK & ANSWER SECTION",
    subtitle: "Get your questions answered by the community"
  }
];

export function Welcome({ onStartRegistration }) {
  const navigate= useNavigate();
  
  const headingRef = useRef(null);
  const h3Ref = useRef(null);
  const fullText = "You're already juggling a lot.";
  const [displayedText, setDisplayedText] = useState("");
  const [hasTyped, setHasTyped] = useState(false);

  useEffect(() => {
    function onScroll() {
      if (!headingRef.current || !h3Ref.current) return;

      const rect = headingRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Calculate how visible the heading is (between 0 and 1)
      let visibleRatio = 0;
      if (rect.top < windowHeight && rect.bottom > 0) {
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        visibleRatio = visibleHeight / rect.height;
        visibleRatio = Math.min(Math.max(visibleRatio, 0), 1);
      }

      // Set h3 opacity based on visibleRatio
      h3Ref.current.style.opacity = visibleRatio;

      // Trigger typewriter once when at least half visible
      if (!hasTyped && visibleRatio > 0.5) {
        let index = 0;
        function type() {
          if (index <= fullText.length) {
            setDisplayedText(fullText.slice(0, index));
            index++;
            setTimeout(type, 100);
          }
        }
        type();
        setHasTyped(true);
      }
    }

    window.addEventListener("scroll", onScroll);
    onScroll(); // check on mount too

    return () => window.removeEventListener("scroll", onScroll);
  }, [hasTyped, fullText]);
  return (
    
    <div className="welcome-container">
      <nav className="navbar">
      <div className="nav-left">
        <img src={logo} alt="StudyBuddy Logo" className="logo" />
        <span className="nav-brand">StudyBuddy</span>
      </div>
      <div className="nav-right">
        <button className="nav-btn-outline" onClick={()=> navigate("/login")}>Log In</button>
        <button className="nav-btn-filled" /*onClick={onStartRegistration}*/ onClick={()=> navigate("/signup")}>
          Sign Up
        </button>
        
      </div>
    </nav>
        <section className="Hero">
            <h2>Why just study, when you can <span className="gradient-text">StudyBuddy ?</span></h2>
            <h3>Create a community, chat and discuss learning material, study, ace that test. Don't buffer, study smarter.</h3>
            <button className="welcome-button" /*onClick={onStartRegistration}*/ onClick={()=> navigate("/signup")}>
                Get Started →
            </button>
            <section className="university-marquee">
              <div className="marquee-content">
                <img src={img1} alt="Rhodes University" />
                <img src={img2} alt="Stellenbosch University" />
                <img src={img3} alt="University of Cape Town" />
                <img src={img4} alt="University of Johannesburg" />
                <img src={img5} alt="University of Pretoria" />
                <img src={img6} alt="University of the Western Cape" />
                <img src={img7} alt="University of the Witwatersrand" />
                <img src={img8} alt="UKZN" />
                <img src={img9} alt="nwu" />
                <img src={img10} alt="unisa" />
                <img src={img11} alt="tut" />
                <img src={img12} alt="cput" />
                <img src={img13} alt="vut" />
                <img src={img14} alt="msa" />
                <img src={img1} alt="Rhodes University" />
                <img src={img2} alt="Stellenbosch University" />
                <img src={img3} alt="University of Cape Town" />
                <img src={img4} alt="University of Johannesburg" />
                <img src={img5} alt="University of Pretoria" />
                <img src={img6} alt="University of the Western Cape" />
                <img src={img7} alt="University of the Witwater"/>
                <img src={img8} alt="UKZN" />
                <img src={img9} alt="nwu" />
                <img src={img10} alt="unisa" />
                <img src={img11} alt="tut" />
                <img src={img12} alt="cput" />
                <img src={img13} alt="vut" />
                <img src={img14} alt="msa" />
                </div>
                </section>

        </section>
        <section className="midsection">
        <section className="heading" ref={headingRef}>
                <h1>{displayedText}</h1>
                <h3 ref={h3Ref} style={{ opacity: 0, transition: "opacity 0.3s ease" }}>
                  StudyBuddy lets you cook!
                </h3>
            </section>
        <div className="mac-window">
          <div className="mac-top-bar">
            <span className="mac-btn red"></span>
            <span className="mac-btn yellow"></span>
            <span className="mac-btn green"></span>
          </div>
          <pre className="code-block">
        {`function Pressure() {
          console.log("What Pressure!");
        }`}
          </pre>
        </div>
        </section>
        <section className="Description">
              <h1>Work together,<section>achieve more.</section></h1>
              <h3>At StudyBuddy we believe in collaboration, you don't have to be stuck-just ask. <section>Learning is better when you don't have to do it alone, so why not do it with a buddy?</section></h3>
              <div className="cards-section">
                  <div className="cards-container">
                    {cardData.map((card, index) => (
                      <div className="card" key={index}>
                        <div className="card-top">
                          
                          <div className="card-arrow">→</div>
                        </div>
                        <div className="card-bottom">
                          <h4>{card.title}</h4>
                          <p>{card.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </section>
      <section className="welcome-content">
        <div className="welcome-header">
          <h1 className="welcome-title">Join the StudyBuddy Community</h1>
          <p className="welcome-description">
            Join thousands of students connecting with their academic community. 
            Share resources, collaborate on projects, and stay updated with your institution.
          </p>
        </div>
        <div className="welcome-features">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Academic Resources</h3>
              <p className="feature-description">
                Access study materials and course content
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Connect with Peers</h3>
              <p className="feature-description">
                Find study groups and classmates
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Track Progress</h3>
              <p className="feature-description">
                Monitor your academic achievements
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="welcome-cta">
        <button className="welcome-button" /*onClick={onStartRegistration}*/ onClick={()=> navigate("/signup")}>
          Get Started
        </button>
      </div>
    </div>
  );
}
