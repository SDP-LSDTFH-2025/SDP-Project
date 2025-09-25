import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Profiles.css";
import { MapPin, Calendar, CircleDot, Circle } from "lucide-react";

const Profiles = ({ user }) => {
  
  const [isFriend, setIsFriend] = useState(false);

  if (!user) return <p>No profile data found.</p>;

  const handleFriendToggle = () => {
    setIsFriend((prev) => !prev);
    // 🔹 TODO: Here you’d also call your backend API
    // fetch(`/api/friends/toggle/${user.id}`, { method: "POST" })
  };
  
  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        {/* Avatar with initials */}
        <div className="profile-avatar">
          {user.username
            .split("_")
            .map((p) => p[0])
            .join("")
            .toUpperCase()}
        </div>

        <div className="profile-info">
          <h1>{user.username.replaceAll("_", " ")}</h1>
          <p className="username">@{user.username}</p>
          <p className="title">
            {user.role} • {user.location || "N/A"}
          </p>

          <div className="profile-details">
            <span className="detail-item">
              <MapPin size={16} className="icon" />
              {user.institution || "Unknown"}
            </span>
            <span className="detail-item">
              <Calendar size={16} className="icon" />
              Joined {new Date(user.created_at).toLocaleDateString()}
            </span>
            <span className="detail-item">
              {user.is_active ? (
                <CircleDot className="status-icon online" size={12} />
              ) : (
                <Circle className="status-icon offline" size={12} />
              )}
              {user.is_active ? "Online" : "Offline"}
            </span>
          </div>

          {/* 🔹 Friend button row */}
          <div className="friend-action">
            <button
              className={`friend-btn ${isFriend ? "unfriend" : "add"}`}
              onClick={handleFriendToggle}
            >
              {isFriend ? "Unfriend" : "Add Friend"}
            </button>
            <Link
              to="/messages"
              state={{
                chat: {
                  id: user.id,
                  username: user.username,
                  is_active: user.is_active,
                  course: user.course || "",
                  name: user.username.replaceAll("_", " "),
                },
              }}
              style={{ textDecoration: "none", color: "inherit" }} // removes underline + keeps styles
            >
              <button className="sending">
                Send Message
              </button>
            </Link>

          </div>
        </div>
      </div>

      {/* Courses = academic_interests */}
      <div className="profile-body">
        <div className="card">
          <h2>Courses</h2>
          <div className="tags blue">
            {user.academic_interests
              ?.split(",")
              .map((item, idx) => (
                <span key={idx}>{item.trim()}</span>
              ))}
          </div>
        </div>

        {/* Activity */}
        <div className="card activity">
          <h2>About</h2>
          <div className="kv">
            <span className="label">Role</span>
            <span className="value">{user.role}</span>
          </div>
          <div className="kv">
            <span className="label">Year of Study</span>
            <span className="value">{user.year_of_study || "N/A"}</span>
          </div>
          <div className="kv">
            <span className="label">Last Login</span>
            <span className="value">
              {new Date(user.last_login).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Interests = study_preferences */}
      <div className="card">
        <h2>Interests</h2>
        <div className="tags green">
          {user.study_preferences
            ?.split(",")
            .map((item, idx) => (
              <span key={idx}>{item.trim()}</span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Profiles;
