// src/components/Friends.jsx
import React, { useState } from "react";
import { MessageCircle, User, Users, Circle, CircleDot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllFriends } from "../api/resources";
import "./Friends.css";

export default function Friends({ setSelectedUser, handleNavigationClick }) {
  const [search, setSearch] = useState("");

  const {
    data: friends = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getAllFriends,
    staleTime: 20 * 60 * 1000,
    cacheTime: 25 * 60 * 1000,
  });

  const filterList = (list) =>
    list.filter(
      (f) =>
        f.name?.toLowerCase().includes(search.toLowerCase()) ||
        f.username?.toLowerCase().includes(search.toLowerCase()) ||
        f.course?.toLowerCase().includes(search.toLowerCase()) ||
        f.academic_interests?.toLowerCase().includes(search.toLowerCase())
    );

  /*const handleAddFriend = (friend) => {
    setSuggested((prev) => prev.filter((f) => f.id !== friend.id));
    setFriends((prev) => [...prev, friend]);
  };*/

  const handleProfileClick = (friend) => {
    setSelectedUser(friend);
    handleNavigationClick("usersprof");
  };

  if (isLoading) return <p>Loading friends...</p>;
  if (error) return <p>Error loading friends.</p>;

  return (
    <section className="friends">
      {/* Search */}
      <input
        type="text"
        placeholder="Search friends..."
        className="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* My Friends */}
      <header className="friends-header">
        <h2>My Buddies</h2>
        <span className="count">{friends.length} friends</span>
      </header>

      <div className="friends-list">
        {filterList(friends).map((friend) => (
          <div className="friend-card" key={friend.id}>
            <div className="friend-header">
              <div className="avatar">
                {friend.avatar ? (
                  <img src={friend.avatar} alt={friend.name} />
                ) : (
                  friend.username
                    .split("_")
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase()
                )}
              </div>
              <div className="friend-title">
                <h3>{friend.name || friend.username.replaceAll("_", " ")}</h3>
                <span className="username">@{friend.username}</span>
              </div>
            </div>

            <div className="role">
              {friend.course} • {friend.institution}
            </div>

            <div className="friend-meta">
              <p className="friend-tag">
                <Users size={12} /> Friend
              </p>
              <span className="friend-tag">
                {friend.is_active && <CircleDot className="status-icon online" size={10} />}
                {!friend.is_active && <Circle className="status-icon offline" size={10} />}
                {friend.is_active ? "Online" : "Offline"}
              </span>
            </div>

            <div className="actions">
              <button 
                className="message-btn"
                onClick={() => {
                  // Store the selected chat in localStorage for the Message component to use
                  localStorage.setItem("selectedChat", JSON.stringify({
                    id: friend.id,
                    username: friend.username,
                    is_active: friend.is_active,
                    course: friend.course || "",
                    name: friend.username.replaceAll("_", " "),
                  }));
                  handleNavigationClick("messages");
                }}
              >
                <MessageCircle size={13} /> Message
              </button>
              <button className="profile-btn" onClick={() => handleProfileClick(friend)}>
                <User size={13} /> Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
