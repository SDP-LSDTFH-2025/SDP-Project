import React, { useState } from "react";
import {
  Calendar,
  Users,
  User,
  Plus
} from "lucide-react";
import GroupChat from "./GroupChat";
import "./Sessions.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { getGroups, joinGroup, leaveGroup, createGroup } from "../api/groups";

export default function PlanGroups() {
  const queryClient = useQueryClient();

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

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
    staleTime: 15 * 60 * 1000,
    cacheTime: 17 * 60 * 1000,
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

  const showToast = (message, type = "success") => {
    if (type === "success") toast.success(message);
    else if (type === "error") toast.error(message);
    else toast(message);
  };

  const handleJoinGroup = async (id) => {
    setJoining(id);
    try {
      const data = await joinGroup(token, creatorId, id);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      showToast(data.message, "success");
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
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      showToast(data.message, "success");
    } catch (err) {
      showToast("Could not leave group: " + err.message, "error");
    } finally {
      setJoining(null);
    }
  };


  const handleViewGroupDetails = (group) => {
    setActiveGroup(group);
  };

  const handleCreateGroup = async () => {
    try {
      setCreatingGroup(true);
      await createGroup(token, creatorId, {
        title: newGroup.title,
        courseCode: newGroup.courseId,
        description: newGroup.description
      });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setNewGroup({ title: "", courseId: "", description: "" });
    } catch (err) {
      showToast("Error creating group: " + err.message, "error");
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
                onClick={handleCreateGroup}
                disabled={creatingGroup}
              >
                {creatingGroup ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"  // centers horizontally at the top
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
}
