import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import ChatList from "../screens/ChatList";
import ChatWindow from "../screens/ChatWindow";
import "../screens/Message.css";

export default function Messages() {
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleBackToHome = () => {
    navigate("/home");
  };

  return (
    <div className="messages-standalone-container">
      {/* Header with back button */}
      <div className="messages-header">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBackToHome}
          className="back-to-home-btn"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Button>
        <h1 className="messages-title">Messages</h1>
      </div>

      {/* Messages container */}
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
    </div>
  );
}
