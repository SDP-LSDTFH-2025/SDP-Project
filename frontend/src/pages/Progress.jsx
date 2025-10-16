import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import "./Progress.css";

import { addTopic, getProgress, logStudyHours, toggleTopic } from "../api/track";

const Progress = () => {
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [viewAll, setViewAll] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // Dummy sessions
  const dummySessions = [
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
  ];

  // Fetch progress on mount
  useEffect(() => {
    fetchProgress();
  }, []);

  async function fetchProgress() {
    try {
      setLoading(true);
      const data = await getProgress(user.id);
      if (data.success) {
        // Merge academic_interests
        const userCourses = (user.academic_interests || "")
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);

        const mergedCourses = [
          ...data.progress,
          ...userCourses
            .filter(
              (courseName) =>
                !data.progress.some((p) => p.course === courseName)
            )
            .map((courseName) => ({
              course: courseName,
              percentage: 0, // default for new courses
            })),
        ];

        setProgressData({ ...data, progress: mergedCourses });
      } else console.error("Failed to fetch progress:", data.error);
    } catch (err) {
      console.error("Fetch progress error:", err);
    } finally {
      setLoading(false);
    }
  }

  // --- Auto log study hours every 15 minutes ---
  useEffect(() => {
    // Load last study timestamp or set to now
    let lastTimestamp = localStorage.getItem("studyLastTimestamp");
    if (!lastTimestamp) {
      lastTimestamp = new Date().toISOString();
      localStorage.setItem("studyLastTimestamp", lastTimestamp);
    }

    const logStudyHours = async () => {
      const now = new Date();
      const last = new Date(localStorage.getItem("studyLastTimestamp"));
      const diffHours = (now - last) / (1000 * 60 * 60); // hours difference

      if (diffHours > 0) {
        try {
          await logStudyHours(user.id, diffHours);
          // update last timestamp
          localStorage.setItem("studyLastTimestamp", now.toISOString());
          fetchProgress();
        } catch (err) {
          console.error("Error logging study hours:", err);
        }
      }
    };

    // Log immediately on mount
    logStudyHours();

    // Then every 15 minutes
    const interval = setInterval(logStudyHours, 15 * 60 * 1000);

    // On unmount, log the remaining time
    const handleBeforeUnload = () => {
      logStudyHours();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);


  async function handleAddTopic(course) {
    if (!newTopic.trim()) return;
    setAdding(true);
    try {
      const data = await addTopic(user.id, course, newTopic);

      if (data.success) {
        setNewTopic("");
        await fetchProgress();
      }
    } catch (err) {
      console.error("Add topic error:", err);
    } finally {
      setAdding(false);
    }
  }

  async function toggleTopicCompletion(topicId) {
    try {
      const data = await toggleTopic(topicId);
      if (data.success) await fetchProgress();
    } catch (err) {
      console.error("Toggle topic error:", err);
    }
  }

  const toggleExpand = (course) => {
    setExpandedCourse(expandedCourse === course ? null : course);
  };

  if (loading) return <div className="loading">Loading progress...</div>;
  if (!progressData) return <div>No progress data found.</div>;

  const { progress, topics, totalHours, streak } = progressData;
  const displayedCourses = viewAll ? progress : progress.slice(0, 4);

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h2>Study Dashboard</h2>
      </div>

      <div className="progress-grid">
        {/* Study Streak */}
        <div className="progress-card">
          <h3>Study Streak</h3>
          <div className="progress-value">{streak}</div>
          <div className="progress-label">days in a row</div>
        </div>

        {/* Study Hours */}
        <div className="progress-card">
          <h3>Study Hours</h3>
          <div className="progress-value">{totalHours}h</div>
          <div className="progress-label">this week</div>
        </div>

        {/* Courses */}
        <div className="progress-card">
          <h3>Courses</h3>
          <div className="progress-value">{progress.length}</div>
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

          {progress.length > 0 ? (
            <div className="courses-list">
              {displayedCourses.map((courseItem) => {
                const topicsForCourse = topics.filter(
                  (t) => t.course === courseItem.course
                );
                return (
                  <div key={courseItem.course} className="course-item">
                    <div
                      className="course-info"
                      onClick={() => toggleExpand(courseItem.course)}
                    >
                      <span className="course-name">{courseItem.course}</span>
                      <span className="course-progress">
                        {courseItem.percentage}%
                      </span>
                      <span
                        className={`collapse-arrow ${
                          expandedCourse === courseItem.course ? "expanded" : ""
                        }`}
                      >
                        {expandedCourse === courseItem.course ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </span>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${courseItem.percentage}%` }}
                      ></div>
                    </div>

                    {expandedCourse === courseItem.course && (
                      <div className="topics-section">
                        <ul className="topics-list">
                          {topicsForCourse.map((topic) => (
                            <li
                              key={topic.id}
                              className={`topic-item ${
                                topic.completed ? "completed" : ""
                              }`}
                            >
                              <div className="topic-info">
                                <span className="topic-title">{topic.title}</span>
                              </div>
                              {topic.completed ? (
                                <span className="completed-label">Completed</span>
                              ) : (
                                <button
                                  className="mark-btn"
                                  onClick={() =>
                                    toggleTopicCompletion(topic.id)
                                  }
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
                            onClick={() => handleAddTopic(courseItem.course)}
                            disabled={adding}
                          >
                            {adding ? "Adding..." : "Add Topic"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              No courses yet. Start by adding your first topic!
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="progress-card full-width">
          <div className="card-header">
            <h3>Upcoming Sessions</h3>
          </div>
          {dummySessions.length > 0 ? (
            <div className="sessions-list">
              {dummySessions.map((session) => (
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
