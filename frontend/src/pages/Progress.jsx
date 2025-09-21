// Progress.jsx
import React from 'react';
import './Progress.css';

const Progress = () => {
  return (
    <div className="progress-container">
      <div className="progress-header">
        <h2>Progress Dashboard</h2>
      </div>
      
      <div className="progress-grid">
        {/* Study Streak Card */}
        <div className="progress-card">
          <h3>Study Streak</h3>
          <div className="progress-value">0</div>
          <div className="progress-label">days in a row</div>
        </div>
        
        {/* Courses Card */}
        <div className="progress-card">
          <h3>Courses</h3>
          <div className="progress-value">0</div>
          <div className="progress-label">active</div>
        </div>
        
        {/* Course Progress Card */}
        <div className="progress-card full-width">
          <div className="card-header">
            <h3>Course Progress</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="empty-state">
            No courses yet. Start by adding your first course!
          </div>
        </div>
        
        {/* Study Hours Card */}
        <div className="progress-card">
          <h3>Study Hours</h3>
          <div className="progress-value">0h</div>
          <div className="progress-label">this week</div>
        </div>
        
        {/* Group Sessions Card */}
        <div className="progress-card">
          <h3>Group Sessions</h3>
          <div className="progress-value">0</div>
          <div className="progress-label">this month</div>
        </div>
        
        {/* Upcoming Sessions Card */}
        <div className="progress-card full-width">
          <div className="card-header">
            <h3>Upcoming Sessions</h3>
            <button className="schedule-btn">Schedule</button>
          </div>
          <div className="empty-state">
            No upcoming sessions. Schedule your next study session!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;