// Progress.jsx
import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import "./Progress.css";

const Progress = () => {
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [viewAll, setViewAll] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [joining, setJoining] = useState(false);

  // Dummy data
  const [progressData] = useState({
    studyStreak: 7,
    activeCourses: 3,
    studyHours: 12,
    groupSessions: 2,
    courses: [
      {
        id: 1,
        name: "Mathematics",
        progress: 65,
        topics: [
          { id: 101, title: "Derivatives", completed: true },
          { id: 102, title: "Integrals", completed: false },
        ],
      },
      {
        id: 2,
        name: "Physics",
        progress: 42,
        topics: [
          { id: 201, title: "Kinematics", completed: false },
          { id: 202, title: "Dynamics", completed: false },
        ],
      },
      {
        id: 3,
        name: "Computer Science",
        progress: 88,
        topics: [
          { id: 301, title: "Data Structures", completed: true },
          { id: 302, title: "Algorithms", completed: true },
        ],
      },
    ],
    upcomingSessions: [
      {
        id: 1,
        title: "Calculus Study Group",
        description: "Review calculus problems together.",
        location: "Library Room 101",
        category: "Mathematics",
        eventPlanner: "Alice",
        capacity: 10,
        theme: "Derivatives",
        date: "2025-09-30",
        startTime: "15:00",
        endTime: "16:00",
      },
      {
        id: 2,
        title: "Physics Problem Solving",
        description: "Work on mechanics exercises.",
        location: "Physics Lab 2",
        category: "Physics",
        eventPlanner: "Bob",
        capacity: 12,
        theme: "Forces & Motion",
        date: "2025-10-01",
        startTime: "16:30",
        endTime: "18:00",
      },
    ],
  });

  const toggleExpand = (id) => {
    setExpandedCourse(expandedCourse === id ? null : id);
  };

  const handleAddTopic = (courseId) => {
    if (!newTopic.trim()) return;
    const courseIndex = progressData.courses.findIndex((c) => c.id === courseId);
    if (courseIndex !== -1) {
      progressData.courses[courseIndex].topics.push({
        id: Date.now(),
        title: newTopic,
        completed: false,
      });
      setNewTopic("");
    }
  };

  const toggleTopicCompletion = (courseId, topicId) => {
    const course = progressData.courses.find((c) => c.id === courseId);
    if (course) {
      const topic = course.topics.find((t) => t.id === topicId);
      if (topic) {
        topic.completed = !topic.completed;
      }
    }
  };

  const displayedCourses = viewAll
    ? progressData.courses
    : progressData.courses.slice(0, 4);

  const SERVER =
    import.meta.env.VITE_PROD_SERVER ||
    import.meta.env.VITE_DEV_SERVER ||
    "http://localhost:3000";
  const token = localStorage.getItem("user");
  const userId = JSON.parse(localStorage.getItem("user") || "{}").id;

  const handleJoinSession = async (session) => {
    setJoining(true);
    try {
      const res = await fetch(`${SERVER}/api/v1/sessions/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session.id,
          userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to join session");

      alert("You joined the session successfully!");
      setSelectedSession(null);
    } catch (err) {
      console.error(err);
      alert("Error joining session: " + err.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h2>Study Dashboard</h2>
      </div>

      <div className="progress-grid">
        {/* Study Streak */}
        <div className="progress-card">
          <h3>Study Streak</h3>
          <div className="progress-value">{progressData.studyStreak}</div>
          <div className="progress-label">days in a row</div>
        </div>

        {/* Courses */}
        <div className="progress-card">
          <h3>Courses</h3>
          <div className="progress-value">{progressData.activeCourses}</div>
          <div className="progress-label">active</div>
        </div>

        {/* Course Progress */}
        <div className="progress-card full-width">
          <div className="card-header">
            <h3>Course Progress</h3>
            <button
              className="view-all-btn"
              onClick={() => setViewAll(!viewAll)}
            >
              {viewAll ? "Show Less" : "View All"}
            </button>
          </div>
          {progressData.courses.length > 0 ? (
            <div className="courses-list">
              {displayedCourses.map((course) => (
                <div key={course.id} className="course-item">
                  <div
                    className="course-info"
                    onClick={() => toggleExpand(course.id)}
                  >
                    <span className="course-name">{course.name}</span>
                    <span className="course-progress">
                      {course.progress}%
                    </span>
                    <span
                      className={`collapse-arrow ${
                        expandedCourse === course.id ? "expanded" : ""
                      }`}
                    >
                      {expandedCourse === course.id ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>

                  {expandedCourse === course.id && (
                    <div className="topics-section">
                      <ul className="topics-list">
                        {course.topics.map((topic) => (
                          <li
                            key={topic.id}
                            className={`topic-item ${topic.completed ? "completed" : ""}`}
                          >
                            <div className="topic-info">
                              <span className="topic-title">{topic.title}</span>
                            </div>
                            {topic.completed ? (
                              <span className="completed-label">Completed</span>
                            ) : (
                              <button
                                className="mark-btn"
                                onClick={() => toggleTopicCompletion(course.id, topic.id)}
                              >
                                Mark as done
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>

                      <div className="add-topic">
                        <input
                          type="text"
                          placeholder="Add a new topic..."
                          value={newTopic}
                          onChange={(e) => setNewTopic(e.target.value)}
                        />
                        <button
                          className="add-btn"
                          onClick={() => handleAddTopic(course.id)}
                        >
                          Add Topic
                        </button>
                      </div>
                    </div>
                  )}


                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              No courses yet. Start by adding your first course!
            </div>
          )}
        </div>

        {/* Study Hours */}
        <div className="progress-card">
          <h3>Study Hours</h3>
          <div className="progress-value">{progressData.studyHours}h</div>
          <div className="progress-label">this week</div>
        </div>

        {/* Group Sessions */}
        <div className="progress-card">
          <h3>Group Sessions</h3>
          <div className="progress-value">{progressData.groupSessions}</div>
          <div className="progress-label">this month</div>
        </div>

        {/* Upcoming Sessions */}
        <div className="progress-card full-width">
          <div className="card-header">
            <h3>Upcoming Sessions</h3>
          </div>
          {progressData.upcomingSessions.length > 0 ? (
            <div className="sessions-list">
              {progressData.upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="session-item"
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="session-dot"></div>
                  <div className="session-info">
                    <span className="session-title">{session.title}</span>
                    <span className="session-date">{session.date}</span>
                  </div>
                  <button className="join-btn">View</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              No upcoming sessions. Schedule your next study session!
            </div>
          )}
        </div>
      </div>

      {/* Session Modal */}
      {selectedSession && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedSession.title}</h3>
            <p>
              <strong>Description:</strong> {selectedSession.description}
            </p>
            <p>
              <strong>Location:</strong> {selectedSession.location}
            </p>
            <p>
              <strong>Category:</strong> {selectedSession.category}
            </p>
            <p>
              <strong>Date:</strong> {selectedSession.date}
            </p>
            <p>
              <strong>Start Time:</strong> {selectedSession.startTime}
            </p>
            <p>
              <strong>End Time:</strong> {selectedSession.endTime}
            </p>
            <p>
              <strong>Organizer:</strong> {selectedSession.eventPlanner}
            </p>
            <p>
              <strong>Capacity:</strong> {selectedSession.capacity} participants
            </p>
            <p>
              <strong>Theme:</strong> {selectedSession.theme}
            </p>

            <div className="modal-actions">
              <button
                className="outline-btn"
                onClick={() => setSelectedSession(null)}
              >
                Cancel
              </button>
              <button
                className="blue-btn"
                onClick={() => handleJoinSession(selectedSession)}
                disabled={joining}
              >
                {joining ? "Joining..." : "Join"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
