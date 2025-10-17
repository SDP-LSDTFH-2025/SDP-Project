import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Users, Plus } from "lucide-react";
import "./GroupChat.css";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getUpcomingSessions, joinSession, createSession } from "../api/groups";
import { getGroupChatHistory } from "../api/chat"; // Assume you have
import { showSuccess, showError } from "../utils/toast"; 

import { 
  connectSocketSafe, 
  joinGroup, 
  leaveGroup, 
  sendTyping, 
  emitSafe 
} from "../groupSocketHelpers";

export default function GroupChat({ group, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [joining, setJoining] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);

  const [sessionData, setSessionData] = useState({
    title: "",
    subject: "",
    description: "",
    location: "",
    date: "",
    time: "",
    endDate: "",
    endTime: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const calendar_token = localStorage.getItem("calendar_token");

  const { data: upcomingData } = useQuery({
    enabled: !!user?.id,
    queryKey: ["upcomingSessions", user.id],
    queryFn: () => getUpcomingSessions(user.id),
    staleTime: 20 * 60 * 1000,
  });

  const guests = upcomingData?.guests || [];
  const upcomingSessions = upcomingData?.events || [
    {
      id: 1,
      title: "Calculus Study Group",
      description: "Review calculus problems together.",
      location: "Library Room 101",
      category: "Mathematics",
      eventPlanner: "Alice",
      capacity: 10,
      theme: "Derivatives",
      date: "2025-09-30",
      startTime: "15:00",
      endTime: "16:00",
    },
    {
      id: 2,
      title: "Physics Problem Solving",
      description: "Work on mechanics exercises.",
      location: "Physics Lab 2",
      category: "Physics",
      eventPlanner: "Bob",
      capacity: 12,
      theme: "Forces & Motion",
      date: "2025-10-01",
      startTime: "16:30",
      endTime: "18:00",
    },
  ];

  const handleJoinSession = async (session) => {
    setJoining(true);
    try {
      const data = await joinSession({ userId: user.id, eventId: session.id });
      if (!data.success) throw new Error(data.message || "Failed to join session");

      showSuccess("You joined the session successfully!");
      setSelectedSession(null);
    } catch (err) {
      console.error(err);
      showError("Error joining session: " + err.message);
    } finally {
      setJoining(false);
    }
  };

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

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setCreatingSession(true);

    const start = new Date(`${sessionData.date}T${sessionData.time}`);
    const end = new Date(`${sessionData.endDate}T${sessionData.endTime}`);

    if (end < start) {
      showError("End date/time cannot be earlier than start date/time.");
      setCreatingSession(false);
      return;
    }

    const payload = {
      eventPlanner: user.username?.replaceAll("_", " ") || "Unknown",
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
      const data = await createSession({ userId: user.id, payload });
      if (!data.success) throw new Error(data.message || "Failed to create session");

      console.log("Session created:", data);
      showSuccess("Session Created!");
      setShowModal(false);

      // Add to Google Calendar
      const event = {
        summary: sessionData.title,
        description: sessionData.description,
        location: sessionData.location,
        start: {
          dateTime: new Date(`${sessionData.date}T${sessionData.time}`).toISOString(),
          timeZone: "UTC",
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

      if (resCal.ok) {
        showSuccess("Added to Google Calendar");
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
      showError(err.message);
    } finally {
      setCreatingSession(false);
    }
  };

  /*
  * I will use this part below to init the sockets
  */
  const [isTyping, setIsTyping] = useState(false);

  const lastTempIdSent = useRef(null);
  const typingTimeout = useRef(null);
  const messagesEndRef = useRef(null);

   // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch initial chat history
  useEffect(() => {
    async function fetchHistory() {
      try {
        const msgs = await getGroupChatHistory(group.id);

        const participantsMap = {};
        (group.Participants || []).forEach(p => {
          participantsMap[p.id] = p.username;
        });

        setMessages(
          msgs.map((msg) => ({
            id: msg.id,
            userId: msg.user_id,
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            sender: msg.user_id === user.id ? "Me" : participantsMap[msg.user_id],
            isOwnMessage: msg.user_id === user.id, 
          }))
        );
      } catch (err) {
        console.error("Failed to fetch group messages:", err);
      }
    }

    fetchHistory();
  }, [group.id, user.id, group.Participants]);

  // Socket setup
  const hasJoinedGroupRef = useRef(false);
useEffect(() => {
  connectSocketSafe();
  if (!hasJoinedGroupRef.current) {
    emitSafe("group:join", { groupId: group.id }, (ack) => {
      if (!ack.ok) console.error("Failed to join group:", ack.error);
    });
    hasJoinedGroupRef.current = true;
  }

  // Import socket dynamically without await
  import("../socket").then(({ socket }) => {
    const handleNewMessage = (msg) => {
      if (msg.tempId && msg.tempId === lastTempIdSent.current) return;
      if (msg.group_id === group.id) {
        const participantsMap = {};
        (group.Participants || []).forEach(p => participantsMap[p.id] = p.username);

        setMessages(prev => [
          ...prev,
          {
            id: msg.id,
            userId: msg.user_id,
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            sender: msg.user_id === user.id ? "Me" : participantsMap[msg.user_id] || "Unknown",
            isOwnMessage: msg.user_id === user.id
          }
        ]);

        emitSafe("group:read", { groupId: group.id, lastReadMessageId: msg.id });
      }
    };

    const handleTyping = ({ userId: typingUserId, groupId: typingGroupId, isTyping }) => {
      if (group.id === typingGroupId && typingUserId !== user.id) setIsTyping(isTyping);
    };

    socket.on("group:message:new", handleNewMessage);
    socket.on("group:typing", handleTyping);

    return () => {
      leaveGroup(group.id);
      socket.off("group:message:new", handleNewMessage);
      socket.off("group:typing", handleTyping);
    };
  });
}, []);


  // Send a message
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const tempId = Date.now();
    lastTempIdSent.current = tempId;

    setMessages(prev => [
      ...prev,
      { id: tempId, userId: user.id, text: newMessage, sender: "Me", isOwnMessage: true, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
    ]);

    emitSafe("group:message", { groupId: group.id, message: newMessage, tempId }, (ack) => {
      if (!ack.ok) console.error("Message failed:", ack.error);
    });

    setNewMessage("");
  };

  // Typing event
  const handleTypingChange = (e) => {
    setNewMessage(e.target.value);
    sendTyping(group.id, true);
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
        <button className="create-session-btn" onClick={() => setShowSessions(true)}>
          Sessions
        </button>
        <button className="create-session-btn" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Create Session
        </button>
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.isOwnMessage  ? "me" : "other"}`}>
            <div>
              {msg.sender !== "Me" && <h5 className="sender">{msg.sender}</h5>}
              <p className="text">{msg.text}</p>
              <span className="time">{msg.time}</span>
            </div>
          </div>
        ))}
        {isTyping && <p style={{ fontStyle: "italic" }}>Someone is typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={handleTypingChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="send-btn" onClick={sendMessage}>
          <Send size={18} />
        </button>
      </div>

      {/* Create Session Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Session</h3>
            <form onSubmit={handleCreateSession}>
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
                <button
                  type="button"
                  className="outline-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="blue-btn">
                  {creatingSession ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show Sessions Modal */}
      {showSessions && (
        <div className="modal-overlay">
          <div className="progress-card full-width">
            <div className="card-header">
              <h3>Upcoming Sessions</h3>
            </div>
            {upcomingSessions.length > 0 ? (
              <div className="sessions-list">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="session-item" onClick={() => setSelectedSession(session)}>
                    <div className="session-dot"></div>
                    <div className="session-info">
                      <span className="session-title">{session.title}</span>
                      <span className="session-date">{session.date}</span>
                    </div>
                    <button className="join-btn">View</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No upcoming sessions. Schedule your next study session!</div>
            )}
            <div className="modal-actions">
              <button className="outline-btn" onClick={() => setShowSessions(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Modal */}
      {selectedSession && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedSession.title}</h3>
            <p><strong>Description:</strong> {selectedSession.description}</p>
            <p><strong>Location:</strong> {selectedSession.location}</p>
            <p><strong>Category:</strong> {selectedSession.category}</p>
            <p><strong>Date:</strong> {selectedSession.date}</p>
            <p><strong>Start Time:</strong> {selectedSession.startTime}</p>
            <p><strong>End Time:</strong> {selectedSession.endTime}</p>
            <p><strong>Organizer:</strong> {selectedSession.eventPlanner}</p>
            <p><strong>Capacity:</strong> {selectedSession.capacity} participants</p>
            <p><strong>Theme:</strong> {selectedSession.theme}</p>

            <div className="modal-actions">
              <button className="outline-btn" onClick={() => setSelectedSession(null)}>
                Cancel
              </button>
              <button className="blue-btn" onClick={() => handleJoinSession(selectedSession)} disabled={joining}>
                {joining ? "Joining..." : "Join"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
