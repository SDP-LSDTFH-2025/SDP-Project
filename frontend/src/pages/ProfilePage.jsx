import { useState } from "react";
import "./ProfilePage.css";

function ProfilePage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "Sarah Chen",
    email: "sarah.chen@university.edu",
    major: "Computer Science",
    year: "2nd Year",
    bio: "Love coding and problem-solving. Always excited to collaborate on challenging projects and learn new technologies together.",
    courses: ["Data Structures", "Web Development", "Linear Algebra", "Algorithms"],
  });

  const handleProfileUpdate = () => {
    setIsEditingProfile(false);
    console.log("Profile updated:", profileData);
  };

  const handleCourseAdd = () => {
    const newCourse = prompt("Enter course name:");
    if (newCourse && newCourse.trim()) {
      setProfileData((prev) => ({
        ...prev,
        courses: [...prev.courses, newCourse.trim()],
      }));
    }
  };

  const handleCourseRemove = (courseToRemove) => {
    setProfileData((prev) => ({
      ...prev,
      courses: prev.courses.filter((course) => course !== courseToRemove),
    }));
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div>
            <h2>Profile</h2>
            <p>Manage your account information and preferences</p>
          </div>
          <button
            className="edit-btn"
            onClick={() =>
              isEditingProfile ? handleProfileUpdate() : setIsEditingProfile(true)
            }
          >
            {isEditingProfile ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        <div className="profile-grid">
          {/* Profile Picture */}
          <div className="card">
            <h3 className="card-title">Profile Picture</h3>
            <div className="card-content center-content">
              <div className="avatar">
                <span className="avatar-fallback">
                  {profileData.username
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              {isEditingProfile && <button className="small-btn">Change Picture</button>}
              <div className="text-center">
                <h3>{profileData.username}</h3>
                <p className="muted">{profileData.major}</p>
                <p className="muted">{profileData.year}</p>
              </div>
            </div>
          </div>

          {/* Personal Info & Courses */}
          <div className="profile-info">
            <div className="card">
              <h3 className="card-title">Personal Information</h3>
              <p className="card-desc">Update your basic account details</p>
              <div className="card-content">
                <div className="grid-2">
                  <div>
                    <label>Full Name</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <p className="display-text">{profileData.username}</p>
                    )}
                  </div>
                  <div>
                    <label>Email</label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData((prev) => ({ ...prev, email: e.target.value }))
                        }
                      />
                    ) : (
                      <p className="display-text">{profileData.email}</p>
                    )}
                  </div>
                  <div>
                    <label>Major</label>
                    {isEditingProfile ? (
                      <input
                        value={profileData.major}
                        onChange={(e) =>
                          setProfileData((prev) => ({ ...prev, major: e.target.value }))
                        }
                      />
                    ) : (
                      <p className="display-text">{profileData.major}</p>
                    )}
                  </div>
                  <div>
                    <label>Year</label>
                    {isEditingProfile ? (
                      <input
                        value={profileData.year}
                        onChange={(e) =>
                          setProfileData((prev) => ({ ...prev, year: e.target.value }))
                        }
                      />
                    ) : (
                      <p className="display-text">{profileData.year}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label>Bio</label>
                  {isEditingProfile ? (
                    <textarea
                      rows="3"
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, bio: e.target.value }))
                      }
                    ></textarea>
                  ) : (
                    <p className="display-text">{profileData.bio}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Courses</h3>
              <p className="card-desc">Manage the courses you are currently studying</p>
              <div className="card-content flex-wrap">
                {profileData.courses.map((course, index) => (
                  <div key={index} className="badge">
                    {course}
                    {isEditingProfile && (
                      <button
                        className="small-btn"
                        onClick={() => handleCourseRemove(course)}
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
                {isEditingProfile && (
                  <button className="small-btn outline" onClick={handleCourseAdd}>
                    + Add Course
                  </button>
                )}
                {profileData.courses.length === 0 && <p className="muted">No courses added yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
