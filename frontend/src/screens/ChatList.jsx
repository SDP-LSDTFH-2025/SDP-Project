import React from "react";

const chats = [
  { id: 1, name: "Alex Johnson", online: true, lastMessage: "CS 101 - algorithms" },
  { id: 2, name: "Maria Lopez", online: false, lastMessage: "See you tomorrow!" },
];

export default function ChatList({ onSelectChat }) {
  return (
    <div className="chat-list-container">
    {/* Header */}
    <div className="chat-list-header">
      <h2>Chats</h2>
    </div>

    {/* Chat Items */}
    {chats.map((chat) => {
      const initials = chat.name
        .split(" ")
        .map((n) => n[0])
        .join("");

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
            <h3>{chat.name}</h3>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      );
    })}
  </div>
  );
}
