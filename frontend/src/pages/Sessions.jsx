import React, { useState } from "react";
import {
  Calendar,
  Users,
  User,
  Plus
} from "lucide-react";
import GroupChat from "./GroupChat";
import "./Sessions.css";

const dummySessions = [
  {
    id: 1,
    title: "Math Study Group",
    description: "Reviewing calculus and linear algebra for the upcoming test.",
    subject: "Mathematics",
    date: "2025-09-20",
    participants: 3,
    organizer: "Alice",
    joined: true,
  },
  {
    id: 2,
    title: "AI & ML Crash Course",
    description: "Quick walkthrough of neural networks and deep learning.",
    subject: "AI",
    date: "2025-09-22",
    participants: 1,
    organizer: "Bob",
    joined: false,
  },
  {
    id: 3,
    title: "Physics Problem Solving",
    description: "Group work on quantum mechanics exercises.",
    subject: "Physics",
    date: "2025-09-10",
    participants: 4,
    organizer: "Eve",
    joined: false,
  },
];

export default function PlanSessions() {
  const [sessionSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Discover groups");
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [sessions, setSessions] = useState(dummySessions);

  const subjects = ["My groups", "Discover groups"];

  const filteredSessions = sessions.filter((session) => {
    if (selectedSubject === "My groups" && !session.joined) return false;
    if (selectedSubject === "Discover groups" && session.joined) return false;
    
    return (
      session.title.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      session.subject.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      session.organizer.toLowerCase().includes(sessionSearch.toLowerCase())
    );
  });

  const handleJoinSession = (id) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, joined: true, participants: s.participants + 1 } : s
      )
    );
  };

  const handleViewSessionDetails = (session) => {
    setActiveGroup(session);
  };

  if (activeGroup) {
    return <GroupChat group={activeGroup} onBack={() => setActiveGroup(null)} />;
  }

  return (
    <div className="plan-sessions">
      {/* Header */}
      <div className="header">
        <div>
          <h2>Study Groups</h2>
          <p>Join collaborative study groups and learn together</p>
        </div>
        <button
          className="create-btn"
          onClick={() => setShowCreateSession(true)}
        >
          <Plus size={16} /> Create Group
        </button>
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
                <Users size={14} />{" "}
                {session.participants} participants
              </div>
              <div>
                <User size={14} /> Created by {session.organizer}
              </div>
            </div>

            <div className="card-actions">
              {session.joined ? (
                <button
                  className="outline-btn"
                  onClick={() => handleViewSessionDetails(session)}
                >
                  View
                </button>
              ) : (
                <button
                  className="blue-btn"
                  onClick={() => handleJoinSession(session.id)}
                > Join
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="empty-card">
          <Calendar size={48} className="empty-icon" />
          <h3> No groups found </h3>
          <p> No study groups available </p>
        </div>
      )}

      {/* Modal */}
      {showCreateSession && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Group</h3>
            <label>
              Title
              <input type="text" placeholder="Enter session title" />
            </label>
            <label>
              Subject
              <input placeholder="Enter subject" />
            </label>
            <label>
              Description
              <textarea placeholder="Enter description" />
            </label>
            <label>
              Date
              <input type="date" />
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
