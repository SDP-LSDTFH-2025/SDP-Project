import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllFriends } from "../api/resources"; // same function we created earlier

export default function ChatList({ onSelectChat }) {
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

  if (isLoading) return <p>Loading chats...</p>;
  if (error) return <p>Failed to load chats.</p>;

  return (
    <div className="chat-list-container">
      {/* Header */}
      <div className="chat-list-header">
        <h2>Chats</h2>
      </div>

      {/* Chat Items */}
      {friends.map((chat) => {
        const initials = chat.username
          .split("_")
          .map((p) => p[0])
          .join("")
          .toUpperCase();

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
