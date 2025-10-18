import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import "./Message.css";

export default function Message() {
  const location = useLocation();
  const initialChat = location.state?.chat || null;
  const [selectedChat, setSelectedChat] = useState(initialChat);

  // Check for selected chat from localStorage (from other components)
  useEffect(() => {
    const storedChat = localStorage.getItem("selectedChat");
    if (storedChat) {
      try {
        const chatData = JSON.parse(storedChat);
        setSelectedChat(chatData);
        // Clear the stored chat after using it
        localStorage.removeItem("selectedChat");
      } catch (error) {
        console.error("Error parsing stored chat data:", error);
      }
    }
  }, []);

  return (
    <div className="messages-container">
      <div className={`chat-list ${selectedChat ? "hide-on-mobile" : ""}`}>
        <ChatList onSelectChat={setSelectedChat} />
      </div>

      <div className={`chat-window ${!selectedChat ? "hide-on-mobile" : ""}`}>
        {selectedChat ? (
          <ChatWindow key={selectedChat.id} chat={selectedChat} onBack={() => setSelectedChat(null)} />
        ) : (
          <div className="no-chat"></div>
        )}
      </div>
    </div>
  );
}
