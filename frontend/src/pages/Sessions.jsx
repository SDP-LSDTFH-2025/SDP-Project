import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  User,
  Plus,
  Search,
} from "lucide-react";
import "./Sessions.css";

const dummySessions = [
  {
    id: 1,
    title: "Math Study Group",
    description: "Reviewing calculus and linear algebra for the upcoming test.",
    subject: "Mathematics",
    status: "upcoming",
    date: "2025-09-20",
    time: "14:00",
    duration: "2h",
    participants: 3,
    maxParticipants: 6,
    organizer: "Alice",
  },
  {
    id: 2,
    title: "AI & ML Crash Course",
    description: "Quick walkthrough of neural networks and deep learning.",
    subject: "AI",
    status: "upcoming",
    date: "2025-09-22",
    time: "16:00",
    duration: "1.5h",
    participants: 5,
    maxParticipants: 5,
    organizer: "Bob",
  },
  {
    id: 3,
    title: "Physics Problem Solving",
    description: "Group work on quantum mechanics exercises.",
    subject: "Physics",
    status: "completed",
    date: "2025-09-10",
    time: "10:00",
    duration: "3h",
    participants: 4,
    maxParticipants: 8,
    organizer: "Eve",
  },
];

export default function PlanSessions() {
  const [sessionSearch, setSessionSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [showCreateSession, setShowCreateSession] = useState(false);

  const subjects = ["All", "Mathematics", "AI", "Physics"];
  

  const filteredSessions = dummySessions.filter(
    (session) =>
      (selectedSubject === "All" || session.subject === selectedSubject) &&
      (session.title.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        session.subject.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        session.organizer.toLowerCase().includes(sessionSearch.toLowerCase()))
  );

  const handleJoinSession = (id) => {
    alert(`Joined session ${id}`);
  };

  const handleViewSessionDetails = (session) => {
    alert(`Viewing details for: ${session.title}`);
  };

  return (
    <div className="plan-sessions">
      {/* Header */}
      <div className="header">
        <div>
          <h2>Plan Sessions</h2>
          <p>Schedule and manage your study sessions</p>
        </div>
        <button
          className="create-btn"
          onClick={() => setShowCreateSession(true)}
        >
          <Plus size={16} /> Create Session
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-card">
        <div className="search-input">
          <Search size={16} className="search-icon" />
          <input
            placeholder="Search sessions by title, subject, or organizer..."
            value={sessionSearch}
            onChange={(e) => setSessionSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        {subjects.map((subj) => (
          <button
            key={subj}
            className={`filter-btn ${
              selectedSubject === subj ? "active" : ""
            }`}
            onClick={() => setSelectedSubject(subj)}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* Sessions Grid */}
      <div className="sessions-grid">
        {filteredSessions.map((session) => (
          <div key={session.id} className="session-card">
            <div className="session-badges">
              <span
                className={`badge ${
                  session.status === "upcoming" ? "badge-blue" : "badge-gray"
                }`}
              >
                {session.status}
              </span>
              <span className="badge badge-outline">{session.subject}</span>
            </div>

            <h3>{session.title}</h3>
            <p className="description">{session.description}</p>

            <div className="details">
              <div>
                <Calendar size={14} />{" "}
                {new Date(session.date).toLocaleDateString()}
              </div>
              <div>
                <Clock size={14} /> {session.time} ({session.duration})
              </div>
              <div>
                <Users size={14} />{" "}
                {session.participants}/{session.maxParticipants} participants
              </div>
              <div>
                <User size={14} /> Organized by {session.organizer}
              </div>
            </div>

            <div className="card-actions">
              <button
                className="outline-btn"
                onClick={() => handleViewSessionDetails(session)}
              >
                View
              </button>
              {session.status === "upcoming" && (
                <button
                  className="blue-btn"
                  onClick={() => handleJoinSession(session.id)}
                  disabled={
                    session.participants >= session.maxParticipants
                  }
                >
                  {session.participants >= session.maxParticipants
                    ? "Full"
                    : "Join"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="empty-card">
          <Calendar size={48} className="empty-icon" />
          <h3>No sessions found</h3>
          <p>
            {sessionSearch
              ? "Try adjusting your search terms"
              : "No study sessions available"}
          </p>
          <button
            className="blue-btn"
            onClick={() => setShowCreateSession(true)}
          >
            <Plus size={16} /> Create Session
          </button>
        </div>
      )}

      {/* Modal */}
      {showCreateSession && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Session</h3>
            <label>
              Title
              <input type="text" placeholder="Enter session title" />
            </label>
            <label>
              Subject
              <input type="text" placeholder="Enter subject" />
            </label>
            <label>
              Description
              <textarea placeholder="Enter description" />
            </label>
            <label>
              Date
              <input type="date" />
            </label>
            <label>
              Time
              <input type="time" />
            </label>
            <label>
              Max Participants
              <input type="number" placeholder="e.g. 10" />
            </label>

            <div className="modal-actions">
              <button
                className="outline-btn"
                onClick={() => setShowCreateSession(false)}
              >
                Cancel
              </button>
              <button
                className="blue-btn"
                onClick={() => {
                  alert("Session created!");
                  setShowCreateSession(false);
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
