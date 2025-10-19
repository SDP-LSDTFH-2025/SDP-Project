import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "./Profiles.css";
import { MapPin, Calendar, CircleDot, Circle } from "lucide-react";
import { sendFriendRequest, getSentFriendRequests } from "../api/friends";
import { showSuccess, showError } from "../utils/toast";

const Profiles = ({ user, currentUser }) => {
  
  const [isFriend, setIsFriend] = useState(false);

  // Check if friend request has been sent
  const {
    data: sentRequestsData = { followers: [] },
    isLoading: loadingSentRequests,
  } = useQuery({
    queryKey: ["sentRequests"],
    queryFn: getSentFriendRequests,
    staleTime: 5 * 60 * 1000,
  });

  const sentRequestUserIds = Array.isArray(sentRequestsData.followers) 
    ? sentRequestsData.followers.map(sr => sr.user.id)
    : [];
  const hasSentRequest = sentRequestUserIds.includes(user?.id);
  
  // Check if viewing own profile
  const isOwnProfile = currentUser && user && currentUser.id === user.id;

  if (!user) return <p>No profile data found.</p>;

  const handleFriendToggle = async () => {
    try {
      const data = await sendFriendRequest({
        username: user.username,
      });
      if (data.success) {
        setIsFriend(true);
        showSuccess(`Friend request sent to ${user.username}`);
      } else {
        showError(`Could not send friend request: ${data.message || data.response || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
      const errorMessage = err.response?.data?.response || err.response?.data?.message || err.message || "Unknown error";
      showError(`Error sending friend request: ${errorMessage}`);
    }
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
            {!isOwnProfile && (
              <button
                className={`friend-btn ${hasSentRequest ? "sent" : isFriend ? "unfriend" : "add"}`}
                onClick={hasSentRequest ? undefined : handleFriendToggle}
                disabled={hasSentRequest}
              >
                {hasSentRequest ? "Sent" : isFriend ? "Unfriend" : "Add Friend"}
              </button>
            )}
            {!isOwnProfile && (
              <button 
                className="sending"
                onClick={() => {
                  // Store the selected chat in localStorage for the Message component to use
                  localStorage.setItem("selectedChat", JSON.stringify({
                    id: user.id,
                    username: user.username,
                    is_active: user.is_active,
                    course: user.course || "",
                    name: user.username.replaceAll("_", " "),
                  }));
                  // Navigate to messages
                  window.location.href = '/messages';
                }}
              >
                Send Message
              </button>
            )}

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
