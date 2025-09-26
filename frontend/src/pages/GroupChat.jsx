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
    subject: "",
    description: "",
    location: "",
    date: "",      
    time: "",     
    endDate: "",   
    endTime: ""    
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const calendar_token = localStorage.getItem("calendar_token");
  const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER || "http://localhost:3000";

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: messages.length + 1,
      sender: "Me",
      text: newMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const handleCreateSession = async () => {
    const start = new Date(`${sessionData.date}T${sessionData.time}`);
    const end = new Date(`${sessionData.endDate}T${sessionData.endTime}`);

    if (end < start) {
      alert("End date/time cannot be earlier than start date/time.");
      return;
    }

    const payload = {
      eventPlanner: user.username.replaceAll("_", " ") ,
      title: sessionData.title,
      description: sessionData.description,
      location: sessionData.location,
      category: sessionData.subject,
      capacity: group.participants || 0,
      budget: 0,
      theme: group.title,
      date: sessionData.date,
      startTime: sessionData.time,
      endTime: sessionData.endTime,
      endDate: sessionData.endDate,
    };

    try {
      const res = await fetch(`${SERVER}/api/v1/planit/events?${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        throw new Error(data.message || "Failed to create session");
      }

      console.log("Session created:", data);
      setShowModal(false);

      //Add to Google Calendar
      const event = {
        summary: sessionData.title,
        description: sessionData.description,
        location: sessionData.location,
        start: {
          dateTime: new Date(`${sessionData.date}T${sessionData.time}`).toISOString(),
          timeZone: "UTC", // or your local TZ if needed
        },
        end: {
          dateTime: new Date(`${sessionData.endDate}T${sessionData.endTime}`).toISOString(),
          timeZone: "UTC",
        },
      };
      const resCal = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${calendar_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if(resCal.ok){
        alert("Added to Google Calendar");
      }

      setSessionData({
        title: "",
        subject: "",
        description: "",
        location: "",
        date: "",
        time: "",
        endDate: "",
        endTime: "",
      });
    } catch (err) {
      console.error("Error creating session:", err);
      alert(err.message);
    }
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
        <button
          className="create-session-btn"
          onClick={() => setShowModal(true)}
        >
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
              {msg.sender !== "Me" && <h5 className="sender">{msg.sender}</h5>}
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
            <form>
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
              <input
                type="text"
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
                  setSessionData({
                    ...sessionData,
                    description: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Location
              <input
                type="text"
                value={sessionData.location || ""}
                onChange={(e) =>
                  setSessionData({ ...sessionData, location: e.target.value })
                }
              />
            </label>

            <label>
              Start Date
              <input
                type="date"
                value={sessionData.date}
                onChange={(e) =>
                  setSessionData({ ...sessionData, date: e.target.value })
                }
              />
            </label>

            <label>
              Start Time
              <input
                type="time"
                value={sessionData.time}
                onChange={(e) =>
                  setSessionData({ ...sessionData, time: e.target.value })
                }
              />
            </label>

            <label>
              End Date
              <input
                type="date"
                value={sessionData.endDate || ""}
                onChange={(e) =>
                  setSessionData({ ...sessionData, endDate: e.target.value })
                }
              />
            </label>

            <label>
              End Time
              <input
                type="time"
                value={sessionData.endTime || ""}
                onChange={(e) =>
                  setSessionData({ ...sessionData, endTime: e.target.value })
                }
              />
            </label>

            <div className="modal-actions">
              <button className="outline-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="blue-btn" onClick={handleCreateSession}>
                Create
              </button>
            </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
