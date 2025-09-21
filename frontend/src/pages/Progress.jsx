// Progress.jsx
import React, { useState } from 'react';
import './Progress.css';

const Progress = () => {
  // Dummy data for demonstration
  const [progressData, setProgressData] = useState({
    studyStreak: 7,
    activeCourses: 3,
    studyHours: 12,
    groupSessions: 2,
    courses: [
      { id: 1, name: 'Mathematics', progress: 65 },
      { id: 2, name: 'Physics', progress: 42 },
      { id: 3, name: 'Computer Science', progress: 88 }
    ],
    upcomingSessions: [
      { id: 1, title: 'Calculus Study Group', date: 'Tomorrow, 3:00 PM' },
      { id: 2, title: 'Physics Problem Solving', date: 'Friday, 4:30 PM' }
    ]
  });

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h2>Study Dashboard</h2>
      </div>
      
      <div className="progress-grid">
        {/* Study Streak Card */}
        <div className="progress-card">
          <h3>Study Streak</h3>
          <div className="progress-value">{progressData.studyStreak}</div>
          <div className="progress-label">days in a row</div>
        </div>
        
        {/* Courses Card */}
        <div className="progress-card">
          <h3>Courses</h3>
          <div className="progress-value">{progressData.activeCourses}</div>
          <div className="progress-label">active</div>
        </div>
        
        {/* Course Progress Card */}
        <div className="progress-card full-width">
          <div className="card-header">
            <h3>Course Progress</h3>
            <button className="view-all-btn">View All</button>
          </div>
          {progressData.courses.length > 0 ? (
            <div className="courses-list">
              {progressData.courses.map(course => (
                <div key={course.id} className="course-item">
                  <div className="course-info">
                    <span className="course-name">{course.name}</span>
                    <span className="course-progress">{course.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${course.progress}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              No courses yet. Start by adding your first course!
            </div>
          )}
        </div>
        
        {/* Study Hours Card */}
        <div className="progress-card">
          <h3>Study Hours</h3>
          <div className="progress-value">{progressData.studyHours}h</div>
          <div className="progress-label">this week</div>
        </div>
        
        {/* Group Sessions Card */}
        <div className="progress-card">
          <h3>Group Sessions</h3>
          <div className="progress-value">{progressData.groupSessions}</div>
          <div className="progress-label">this month</div>
        </div>
        
        {/* Upcoming Sessions Card */}
        <div className="progress-card full-width">
          <div className="card-header">
            <h3>Upcoming Sessions</h3>
            <button className="schedule-btn">Schedule</button>
          </div>
          {progressData.upcomingSessions.length > 0 ? (
            <div className="sessions-list">
              {progressData.upcomingSessions.map(session => (
                <div key={session.id} className="session-item">
                  <div className="session-dot"></div>
                  <div className="session-info">
                    <span className="session-title">{session.title}</span>
                    <span className="session-date">{session.date}</span>
                  </div>
                  <button className="join-btn">Join</button>
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
    </div>
  );
};

export default Progress;