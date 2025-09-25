import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import "./Message.css";

export default function Message() {
  const location = useLocation();
  const initialChat = location.state?.chat||null;
  const [selectedChat, setSelectedChat] = useState(initialChat);

  return (
    <div className="messages-container">
      <div className={`chat-list ${selectedChat ? "hide-on-mobile" : ""}`}>
        <ChatList onSelectChat={setSelectedChat} />
      </div>

      <div className={`chat-window ${!selectedChat ? "hide-on-mobile" : ""}`}>
        {selectedChat ? (
          <ChatWindow chat={selectedChat} onBack={() => setSelectedChat(null)} />
        ) : (
          <div className="no-chat"></div>
        )}
      </div>
    </div>
  );
}
