import React from 'react';
import './ProfilePage.css';
import { Edit, MapPin, Calendar, Users } from 'lucide-react';

const ProfilePage = () => {
  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <img
          src="https://i.pravatar.cc/160?img=15"
          alt="John Doe"
          className="profile-image"
        />
        <div className="profile-info">
          <h1>John Doe</h1>
          <p className="username">@johndoe</p>
          <p className="title">Senior Software Engineer</p>
          <div className="profile-details">
            <span className="detail-item">
              <MapPin size={16} className="icon" />
              New York, NY
            </span>
            <span className="detail-item">
              <Calendar size={16} className="icon" />
              Joined September 2025
            </span>
            <span className="detail-item">
              <Users size={16} className="icon" />
              2 friends
            </span>
          </div>
        </div>

        <button className="edit-button">
          <Edit size={16} className="icon" />
          Edit Profile
        </button>
      </div>

      {/* Courses + Activity */}
      <div className="profile-body">
        <div className="card">
          <h2>Courses</h2>
          <div className="tags blue">
            <span>Full Stack Web Development</span>
            <span>Advanced React Patterns</span>
            <span>System Design</span>
            <span>Cloud Architecture</span>
          </div>
        </div>

        <div className="card activity">
          <h2>Activity</h2>
          <div className="kv">
            <span className="label">Friends</span>
            <span className="value">2</span>
          </div>
          <div className="kv">
            <span className="label">Profile Views</span>
            <span className="value">89</span>
          </div>
          <div className="kv">
            <span className="label">Last Active</span>
            <span className="value">Today</span>
          </div>
        </div>
      </div>

      {/* Interests */}
      <div className="card">
        <h2>Interests</h2>
        <div className="tags green">
          <span>Open Source Development</span>
          <span>Machine Learning</span>
          <span>Travel Photography</span>
          <span>Rock Climbing</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
