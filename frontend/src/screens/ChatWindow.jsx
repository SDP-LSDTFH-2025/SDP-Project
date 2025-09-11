import React, { useState } from "react";
import {Input} from "../components/ui/input";
import{Send} from "lucide-react";
import {Button} from "../components/ui/button";
export default function ChatWindow({ chat, onBack }) {
  const [messages, setMessages] = useState([
    { from: "other", text: "Hey! Are you free to study together?", time: "2m ago" },
    { from: "me", text: "Sure! What subject?", time: "1m ago" },
    { from: "other", text: "CS 101 - algorithms", time: "30s ago" },
  ]);
  const [input, setInput] = useState("");

  const initials = chat.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "me", text: input, time: "now" }]);
    setInput("");
  };

  return (
    <div className="chat-window-container">
      <div className="chat-header">
        <Button className="back-btn" onClick={onBack}>←</Button>
        <div className="avatar"><span>{initials}</span></div>
        <div className="header-info">
          <h2>{chat.name}</h2>
          <p>{chat.online ? "Online" : "Offline"}</p>
        </div>
      </div>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.from}`}>
            <p>{msg.text}</p>
            <span className="time">{msg.time}</span>
          </div>
        ))}
      </div>

      <div className="input-area">
        <Input
          className="messagebox"
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage}><Send className="pic"></Send></button>
      </div>
    </div>
  );
}
