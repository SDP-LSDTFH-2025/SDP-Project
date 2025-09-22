import React, { useState } from "react";
import { ArrowLeft, Send, Users, Plus } from "lucide-react";
import "./GroupChat.css";

export default function GroupChat({ group, onBack }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: "Alice", text: "Hi everyone!", time: "10:00" },
    { id: 2, sender: "Bob", text: "Ready to study calculus?", time: "10:05" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sessionData, setSessionData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: messages.length + 1,
      sender: "Me",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const handleCreateSession = () => {
    console.log("Session created:", sessionData);
    setShowModal(false);
    setSessionData({ title: "", description: "", date: "", time: "" });
  };

  return (
    <div className="group-chat">
      {/* Header */}
      <div className="chat-header">
        <button onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="chat-info">
          <h3>{group.title}</h3>
          <p>
            <Users size={14} /> {group.participants} members
          </p>
        </div>
        <button className="create-session-btn" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Create Session
        </button>
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender === "Me" ? "me" : "other"}`}
          >
            <div>
              <h5 className="sender"> {msg.sender}  </h5>
              <p className="text">{msg.text}</p>
              <span className="time">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="send-btn" onClick={handleSend}>
          <Send size={18} />
        </button>
      </div>

      {/* Create Session Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Session</h3>
            <label>
              Title
              <input
                type="text"
                value={sessionData.title}
                onChange={(e) =>
                  setSessionData({ ...sessionData, title: e.target.value })
                }
              />
            </label>
            <label>
              Subject
              <input type="text"
                value={sessionData.subject}
                onChange={(e) =>
                  setSessionData({ ...sessionData, subject: e.target.value })
                }
              />
            </label>
            <label>
              Description
              <textarea
                value={sessionData.description}
                onChange={(e) =>
                  setSessionData({ ...sessionData, description: e.target.value })
                }
              />
            </label>
            <label>
              Date
              <input
                type="date"
                value={sessionData.date}
                onChange={(e) =>
                  setSessionData({ ...sessionData, date: e.target.value })
                }
              />
            </label>
            <label>
              Time
              <input
                type="time"
                value={sessionData.time}
                onChange={(e) =>
                  setSessionData({ ...sessionData, time: e.target.value })
                }
              />
            </label>

            <div className="modal-actions">
              <button
                className="outline-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="blue-btn" onClick={handleCreateSession}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
