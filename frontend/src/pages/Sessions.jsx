import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  User,
  Plus
} from "lucide-react";
import GroupChat from "./GroupChat";
import "./Sessions.css";

export default function PlanGroups() {
  const [groupSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Discover groups");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [groups, setGroups] = useState([]);

  const [newGroup, setNewGroup] = useState({
    title: "",
    courseId: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(null);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER || "http://localhost:3000";
  const token = localStorage.getItem("user");
  const creatorId = JSON.parse(localStorage.getItem("user")).id;

  const subjects = ["My groups", "Discover groups"];

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${SERVER}/api/v1/study_groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error(data);
          throw new Error(data.message || "Failed to fetch groups");
        }

        const formatted = data.groups.map((g) => ({
          id: g.id,
          title: g.name,
          description: g.description,
          subject: g.course_id ? `Course ${g.course_id}` : "General",
          date: g.created_at || new Date().toISOString(), 
          participants: g.participants?.length || 0,
          organizer: g.creator_id || g.creator_name,
          joined: false,
        }));

        setGroups(formatted);
      } catch (err) {
        console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [SERVER, token]);

  const filteredGroups = groups.filter((group) => {
    if (selectedSubject === "My groups" && !group.joined) return false;
    if (selectedSubject === "Discover groups" && group.joined) return false;

    return (
      group.title.toLowerCase().includes(groupSearch.toLowerCase()) ||
      group.subject.toLowerCase().includes(groupSearch.toLowerCase()) ||
      group.organizer.toLowerCase().includes(groupSearch.toLowerCase())
    );
  });

  const handleJoinGroup = async (id) => {
    setJoining(id);
    try {
      const res = await fetch(`${SERVER}/api/v1/study_groups/join`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          id: creatorId,
          groupID: id,
        }),

      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to join group");
      alert(data.message);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, joined: true, participants: g.participants + 1 } : g
        )
      );
    } catch (err) {
      console.error(err);
      alert("Could not join group: " + err.message);
    }finally {
      setJoining(null);
    }
  };
  const handleLeaveGroup = async (id) => {
    setJoining(id);
    try {
      const res = await fetch(`${SERVER}/api/v1/study_groups/leave`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          id: creatorId,
          groupID: id
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to leave group");

      alert(data.message);

      setGroups((prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, joined: false, participants: g.participants - 1 } : g
        )
      );
    } catch (err) {
      console.error(err);
      alert("Could not leave group: " + err.message);
    } finally {
      setJoining(false);
    }
  };


  const handleViewGroupDetails = (group) => {
    setActiveGroup(group);
  };

  const createGroup = async () => {
    try {
      setCreatingGroup(true);
      const today = new Date().toISOString().split("T")[0];

      if (!newGroup.title || !newGroup.courseId || !newGroup.description) {
        alert("Please fill in all required fields");
        setCreatingGroup(false);
        return;
      }

      const payload = {
        token,
        id: creatorId,
        title: newGroup.title,
        course_code: newGroup.courseId,
        description: newGroup.description,
        participants: [creatorId],
      };

      const res = await fetch(`${SERVER}/api/v1/study_groups/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        throw new Error(data.message || "Failed to create group");
      }

      console.log("Group created:", data);

      setGroups((prev) => [
        ...prev,
        {
          id: data.id || prev.length + 1,
          title: newGroup.title,
          description: newGroup.description,
          subject: newGroup.courseId,
          date: today,
          participants: 1,
          organizer: "You",
          joined: true,
        },
      ]);

      setNewGroup({
        title: "",
        courseId: "",
        description: "",
      });

    } catch (err) {
      console.error(err);
      alert("Error creating group: " + err.message);
    } finally {
      setCreatingGroup(false);
      setShowCreateGroup(false);
    }
  };

  if (activeGroup) {
    return <GroupChat group={activeGroup} onBack={() => setActiveGroup(null)} />;
  }

  return (
    <div className="plan-groups">
      {/* Header */}
      <div className="header">
        <div>
          <h2>Study Groups</h2>
          <p>Join collaborative study groups and learn together</p>
        </div>
        <button
          className="create-btn"
          onClick={() => setShowCreateGroup(true)}
        >
          <Plus size={16} /> Create Group
        </button>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        {subjects.map((subj) => (
          <button
            key={subj}
            className={`filter-btn ${selectedSubject === subj ? "active" : ""}`}
            onClick={() => setSelectedSubject(subj)}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* Groups Grid */}
      <div className="groups-grid">
        {filteredGroups.map((group) => (
          <div key={group.id} className="session-card">
            <div className="session-badges">
              <span className="badge badge-outline">{group.subject}</span>
            </div>

            <h3>{group.title}</h3>
            <p className="description">{group.description}</p>

            <div className="details">
              <div>
                <Calendar size={14} />{" "}
                {new Date(group.date).toLocaleDateString()}
              </div>
              <div>
                <Users size={14} />{" "}
                {group.participants} participants
              </div>
              <div>
                <User size={14} /> Created by {group.organizer}
              </div>
            </div>

            <div className="card-actions">
              {group.joined ? (
                <>
                  <button
                    className="outline-btn"
                    onClick={() => handleViewGroupDetails(group)}
                  >
                    View
                  </button>
                  <button
                    className="red-btn"
                    onClick={() => handleLeaveGroup(group.id)}
                    disabled={joining === group.id}
                  >
                    {joining === group.id ? "Leaving..." : "Leave"}
                  </button>
                </>
              ) : (
                <button
                  className="blue-btn"
                  onClick={() => handleJoinGroup(group.id)}
                  disabled={joining === group.id}
                >
                  {joining === group.id ? "Joining..." : "Join"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="empty-card">
          <Calendar size={48} className="empty-icon" />
          <h3> No groups found </h3>
          <p> No study groups available </p>
        </div>
      )}

      {/* Modal */}
      {showCreateGroup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Group</h3>
            <label>
              Title
              <input
                type="text"
                value={newGroup.title}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, title: e.target.value })
                }
                placeholder="Enter group title"
              />
            </label>
            <label>
              Course Code
              <input
                type="text"
                value={newGroup.courseId}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, courseId: e.target.value })
                }
                placeholder="Enter course Code"
              />
            </label>
            <label>
              Description
              <textarea
                value={newGroup.description}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, description: e.target.value })
                }
                placeholder="Enter description"
              />
            </label>

            <div className="modal-actions">
              <button
                className="outline-btn"
                onClick={() => setShowCreateGroup(false)}
                disabled={creatingGroup}
              >
                Cancel
              </button>
              <button
                className="blue-btn"
                onClick={createGroup}
                disabled={creatingGroup}
              >
                {creatingGroup ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
