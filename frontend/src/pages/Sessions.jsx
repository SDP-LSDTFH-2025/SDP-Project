import React, { useState } from "react";
import {
  Calendar,
  Users,
  User,
  Plus
} from "lucide-react";
import GroupChat from "./GroupChat";
import "./Sessions.css";

import { useQuery } from "@tanstack/react-query";
import { getGroups, joinGroup, leaveGroup, createGroup } from "../api/groups";

export default function PlanGroups() {
  const [groupSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Discover groups");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);

  const [newGroup, setNewGroup] = useState({
    title: "",
    courseId: "",
    description: "",
  });

  const [joining, setJoining] = useState(null);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const token = localStorage.getItem("user");
  const creatorId = JSON.parse(localStorage.getItem("user")).id;

  const subjects = ["Discover groups", "My groups"];

  const {
    data: groups = [],refetch
  } = useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
    staleTime: 20 * 60 * 1000, // 20 minutes
    cacheTime: 25 * 60 * 1000, // slightly longer cache
  });

  const filteredGroups = groups.filter((group) => {

    if (selectedSubject === "Discover groups" && group.joined) return false;
    if (selectedSubject === "My groups" && !group.joined) return false;

    return (
      group.title.toLowerCase().includes(groupSearch.toLowerCase()) ||
      group.subject.toLowerCase().includes(groupSearch.toLowerCase()) ||
      group.organizer.toLowerCase().includes(groupSearch.toLowerCase())
    );
  });

  const handleJoinGroup = async (id) => {
    setJoining(id);
    try {
      const data = await joinGroup(token, creatorId, id);
      alert(data.message);
    } catch (err) {
      alert("Could not join group: " + err.message);
    } finally {
      setJoining(null);
    }
  };
  
  const handleLeaveGroup = async (id) => {
    setJoining(id);
    try {
      const data = await leaveGroup(token, creatorId, id);
      alert(data.message);
    } catch (err) {
      alert("Could not leave group: " + err.message);
    } finally {
      setJoining(null);
    }
  };


  const handleViewGroupDetails = (group) => {
    setActiveGroup(group);
  };

  const createGroup = async () => {
    try {
      setCreatingGroup(true);
      await createGroup(token, creatorId, {
        title: newGroup.title,
        courseCode: newGroup.courseId,
        description: newGroup.description
      });
      await refetch();
      setNewGroup({ title: "", courseId: "", description: "" });
    } catch (err) {
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
