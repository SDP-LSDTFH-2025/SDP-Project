import React, { useEffect, useState } from "react";
import "./ProfilePage.css";
import { Edit, MapPin, Calendar, CircleDot, Circle } from "lucide-react";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setEditForm({
          username: parsed.username || "No Username",
          course: parsed.course || "No Course",
          institution: parsed.institution || "Unknown",
          role: parsed.role || "student",
          year_of_study: parsed.year_of_study || "N/A",
          location: parsed.school || "N/A",
          academic_interests: parsed.academic_interests || "",
          study_preferences: parsed.study_preferences || "",
        });
      } catch (error) {
        console.error("Invalid JSON in localStorage", error);
      }
    }
  }, []);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);
  const handleSave = () => {
    if (editForm) {
      localStorage.setItem("user", JSON.stringify(editForm));
      setUser(editForm);
    }
    setIsEditing(false);
  };

  if (!user || !editForm) return <p>No profile data found.</p>;

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <img
          src="https://i.pravatar.cc/160?img=15"
          alt={`${editForm.username}`}
          className="profile-image"
        />
        <div className="profile-info">
          {isEditing ? (
            <>
              <div className="field-group">
                <label>Username</label>
                <input
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                />
              </div>
              <div className="field-group">
                <label>Course</label>
                <input
                  value={editForm.course}
                  onChange={(e) =>
                    setEditForm({ ...editForm, course: e.target.value })
                  }
                />
              </div>
              <div className="field-group">
                <label>Institution</label>
                <input
                  value={editForm.institution}
                  onChange={(e) =>
                    setEditForm({ ...editForm, institution: e.target.value })
                  }
                />
              </div>
              <div className="field-group">
                <label>Location</label>
                <input
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                />
              </div>
            </>
          ) : (
            <>
              <h1>{editForm.username.replaceAll('_', ' ')}</h1>
              <p className="username">@{editForm.username}</p>
              <p className="title">
                {editForm.role} • {editForm.location}
              </p>
              <div className="profile-details">
                <span className="detail-item">
                  <MapPin size={16} className="icon" />
                  {editForm.institution}
                </span>
                <span className="detail-item">
                  <Calendar size={16} className="icon" />
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
                <span className="detail-item">
                {user.is_active && <CircleDot className="status-icon online" size={12} />}
                {!user.is_active && <Circle className="status-icon offline" size={12} />}
                  {user.is_active ? "Active" : "Offline"}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="button-group">
          {isEditing ? (
            <>
              <button className="edit-button" onClick={handleSave}>
                Save
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <button className="edit-button" onClick={handleEdit}>
              <Edit size={16} className="icon" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Courses = academic_interests */}
      <div className="profile-body">
        <div className="card">
          <h2>Courses</h2>
          <div className="tags blue">
            {editForm.academic_interests
              .split(",")
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
            <span className="value">{editForm.role}</span>
          </div>
          <div className="kv">
            <span className="label">Year of Study</span>
            <span className="value">{editForm.year_of_study}</span>
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
          {editForm.study_preferences
            .split(",")
            .map((item, idx) => (
              <span key={idx}>{item.trim()}</span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
