// MyFriends.jsx
import React, { useState } from "react";
import "./FriendList.css";

const dummyFriends = [
  {
    id: 1,
    name: "Lisa Rodriguez",
    username: "@lisar",
    role: "Frontend Developer",
    status: "Online",
    avatar: "https://via.placeholder.com/80",
    online: true,
  },
  {
    id: 2,
    name: "Mark Anderson",
    username: "@markanderson",
    role: "Backend Developer",
    status: "Last seen 3h ago",
    avatar: "https://via.placeholder.com/80",
    online: false,
  },
  {
    id: 3,
    name: "Sarah Johnson",
    username: "@sarahj",
    role: "Software Engineer",
    status: "Online",
    avatar: "https://via.placeholder.com/80",
    online: true,
  },
];

export default function MyFriends() {
  const [search, setSearch] = useState("");

  const filteredFriends = dummyFriends.filter((friend) =>
    friend.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="friends-container">
      <div className="friends-header">
        <h2>My Friends</h2>
        <span>{dummyFriends.length} friends</span>
      </div>

      <input
        type="text"
        className="search-bar"
        placeholder="Search friends..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="friends-grid">
        {filteredFriends.map((friend) => (
          <div key={friend.id} className="friend-card">
            <img src={friend.avatar} alt={friend.name} className="friend-avatar" />
            <h3 className="friend-name">{friend.name}</h3>
            <p className="friend-username">{friend.username}</p>
            <p className="friend-role">{friend.role}</p>
            <p className={`status ${friend.online ? "online" : "offline"}`}>
              ● {friend.status}
            </p>
            <div className="actions">
              <button className="btn">👤 Friend</button>
              <button className="btn btn-primary">💬 Message</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
