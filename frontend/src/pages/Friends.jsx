import React, { useEffect, useState } from "react";
import { MessageCircle, UserPlus, User, Users, Circle, CircleDot } from "lucide-react";
import "./Friends.css";

export default function Friends({ setSelectedUser, handleNavigationClick }) {
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState([]);
  /*const [suggested, setSuggested] = useState([]);*/
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("user"));
        const user = JSON.parse(localStorage.getItem("user"));
        const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER || "http://localhost:3000";

        const res = await fetch(`${SERVER}/api/v1/followers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,  
            id: user.id, 
          }),
        });

        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setFriends(json.data);
        } else {
          console.error("Invalid response:", json);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

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

  if (loading) return <p>Loading friends...</p>;

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

            <p className="role">{friend.course}</p>
            <p className="role">{friend.institution}</p>

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
              <button className="message-btn">
                <MessageCircle size={14} /> Message
              </button>
              <button
                className="profile-btn"
                onClick={() => handleProfileClick(friend)}
              >
                <User size={14} /> Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Friends 
      <header className="friends-header">
        <h2>Suggested Friends</h2>
        <span className="count">{suggested.length} suggestions</span>
      </header>

      <div className="friends-list">
        {filterList(suggested).map((friend) => (
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

            <p className="role">{friend.course}</p>
            <p className="role">{friend.institution}</p>

            <div className="friend-meta">
              <p className="friend-tag">
                <Users size={12} /> Suggested Friend
              </p>
            </div>

            <div className="actions">
              <button className="add-btn" onClick={() => handleAddFriend(friend)}>
                <UserPlus size={14} /> Add Friend
              </button>
              <button
                className="profile-btn"
                onClick={() => handleProfileClick(friend)}
              >
                <User size={14} /> Profile
              </button>
            </div>
          </div>
        ))}
      </div>
      */}
    </section>
  );
}
