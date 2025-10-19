import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllFriends } from "../api/resources";
import { getLastMessages } from "../api/chat";
import { MessageCircle } from "lucide-react";

export default function ChatList({ onSelectChat }) {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.id;

  const {
    data: friends = [],
    isLoading: friendsLoading,
    error: friendsError,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getAllFriends,
    staleTime: 20 * 60 * 1000,
    cacheTime: 25 * 60 * 1000,
  });

  const {
    data: lastMessages = [],
    isLoading: messagesLoading,
  } = useQuery({
    queryKey: ["lastMessages", currentUserId],
    queryFn: () => getLastMessages(currentUserId),
    enabled: !!currentUserId,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
  });

  // Create a map of last messages by friend ID
  const lastMessagesMap = lastMessages.reduce((acc, msg) => {
    const friendId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
    acc[friendId] = {
      message: msg.message,
      time: new Date(msg.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      unreadCount: 0 // You can implement unread count logic here
    };
    return acc;
  }, {});

  // Merge friends with their last messages
  const friendsWithMessages = friends.map(friend => ({
    ...friend,
    lastMessage: lastMessagesMap[friend.id]?.message || null,
    lastMessageTime: lastMessagesMap[friend.id]?.time || null,
    unreadCount: lastMessagesMap[friend.id]?.unreadCount || 0
  }));

  // Show all friends (no search filtering)
  const filteredFriends = friendsWithMessages;

  const isLoading = friendsLoading || messagesLoading;
  const error = friendsError;

  if (isLoading) {
    return (
      <div className="chat-list-container">
        <div className="chat-list-header">
          <h2>Messages</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-list-container">
        <div className="chat-list-header">
          <h2>Messages</h2>
        </div>
        <div className="error-state">
          <MessageCircle className="error-icon" />
          <p>Failed to load conversations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="whatsapp-chat-list">
      {/* WhatsApp-style Header */}
      <div className="whatsapp-header">
        <div className="header-content">
          <h1>Chats</h1>
        </div>
      </div>


      {/* Chat Items - WhatsApp Style */}
      <div className="whatsapp-chat-items">
        {filteredFriends.length === 0 ? (
          <div className="whatsapp-empty-state">
            <div className="empty-icon">💬</div>
            <h3>No chats yet</h3>
            <p>Start a conversation with your friends!</p>
          </div>
        ) : (
          filteredFriends.map((chat) => {
            const initials = chat.username
              .split("_")
              .map((p) => p[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={chat.id}
                className="whatsapp-chat-item"
                onClick={() => onSelectChat(chat)}
              >
                <div className="whatsapp-avatar-container">
                  <div className="whatsapp-avatar">
                    <span>{initials}</span>
                  </div>
                  <div className={`whatsapp-status ${chat.is_active ? 'online' : 'offline'}`}></div>
                </div>
                <div className="whatsapp-chat-content">
                  <div className="whatsapp-chat-header">
                    <h3>{chat.username.replaceAll("_", " ")}</h3>
                    <span className="whatsapp-time">
                      {chat.lastMessageTime || "now"}
                    </span>
                  </div>
                  <div className="whatsapp-chat-preview">
                    <p className="whatsapp-last-message">
                      {chat.lastMessage || "Tap to start chatting"}
                    </p>
                    <div className="whatsapp-message-status">
                      {chat.unreadCount > 0 && (
                        <span className="unread-count">{chat.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
