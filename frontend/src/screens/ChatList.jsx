import React, { useEffect, useState } from "react";

export default function ChatList({ onSelectChat }) {
  const [Friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const receivee = JSON.parse(localStorage.getItem("user"));
    const token = JSON.parse(localStorage.getItem("user"));
    const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER || "http://localhost:3000";

    const fetchFriends = async () => {
      try {
        const res = await fetch(`${SERVER}/api/v1/friends`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            id: receivee.id,
          }),
        });

        const json = await res.json();

      if (json.success && Array.isArray(json.followers)) {
        setFriends(json.followers);
      } else {
        console.error("Invalid Friends format", json);
      }
      } catch (err) {
        console.error("Error fetching Friends", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFriends();
    }, []);

  

  return (
    <div className="chat-list-container">
    {/* Header */}
    <div className="chat-list-header">
      <h2>Chats</h2>
    </div>
  
    {/* Chat Items */}
    {Friends.map((chat) => {
      const initials = chat.username.split("_").map((p) => p[0]).join("").toUpperCase();

      return (
        <div
          key={chat.id}
          className="chat-item"
          onClick={() => onSelectChat(chat)}
        >
          <div className="avatar">
            <span>{initials}</span>
          </div>
          <div className="chat-info">
            <h3>{chat.username.replaceAll("_", " ")}</h3>
          </div>
        </div>
      );
    })}
  </div>
  );
}