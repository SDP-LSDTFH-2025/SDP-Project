// GroupChat.jsx
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Users, Plus, Trash2, Phone, Video, Mic, Image, File, Smile, MoreVertical } from "lucide-react";
import "./GroupChat.css";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUpcomingSessions, joinSession, createSession, deleteSession } from "../api/groups";
import { getGroupChatHistory, sendGroupMessage } from "../api/chat";
import { showSuccess, showError } from "../utils/toast";
import EmojiPicker from "../components/EmojiPicker";
import VoiceNoteRecorder from "../components/VoiceNoteRecorder";
import VoiceNotePlayer from "../components/VoiceNotePlayer";
import GroupVideoCall from "../components/GroupVideoCall";
import GroupVoiceCall from "../components/GroupVoiceCall";
import DropdownMenu from "../components/DropdownMenu"; 

import { 
  connectSocketSafe, 
  joinGroup, 
  leaveGroup, 
  sendTyping, 
  emitSafe 
} from "../groupSocketHelpers";

import { groupSocket } from "../socket";

export default function GroupChat({ group, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [joining, setJoining] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [deletingSession, setDeletingSession] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  // Voice note and call states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceNoteRecorder, setShowVoiceNoteRecorder] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [videoCallData, setVideoCallData] = useState(null);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [voiceCallData, setVoiceCallData] = useState(null);

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
  const queryClient = useQueryClient();

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
      const sessionId = session.id || session._id;
      console.log('Joining session:', session, 'with ID:', sessionId);
      
      if (!sessionId) {
        throw new Error("Session ID not found");
      }
      
      const data = await joinSession({ userId: user.id, eventId: sessionId });
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

  const handleDeleteSession = async (session) => {
    setSessionToDelete(session);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    
    setDeletingSession(true);
    try {
      const sessionId = sessionToDelete.id || sessionToDelete._id;
      console.log('Deleting session:', sessionToDelete, 'with ID:', sessionId);
      
      if (!sessionId) {
        throw new Error("Session ID not found");
      }
      
      const data = await deleteSession({ userId: user.id, eventId: sessionId });
      if (!data.success) throw new Error(data.message || "Failed to delete session");

      showSuccess("Session deleted successfully!");
      setShowDeleteConfirm(false);
      setSessionToDelete(null);
      setSelectedSession(null);
      
      // Refresh the sessions list
      queryClient.invalidateQueries({ queryKey: ["upcomingSessions"] });
    } catch (err) {
      console.error(err);
      showError("Error deleting session: " + err.message);
    } finally {
      setDeletingSession(false);
    }
  };

  const cancelDeleteSession = () => {
    setShowDeleteConfirm(false);
    setSessionToDelete(null);
  };

  // Voice note and call handlers
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const toggleVoiceNoteRecorder = () => {
    setShowVoiceNoteRecorder(!showVoiceNoteRecorder);
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceNoteSend = async (audioBlob) => {
    try {
      // Convert audio blob to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = reader.result.split(',')[1]; // Remove data:audio/webm;base64, prefix
        
        // Get audio duration
        const audio = new Audio();
        audio.src = URL.createObjectURL(audioBlob);
        
        const getDuration = () => {
          return new Promise((resolve) => {
            const handleLoadedMetadata = () => {
              resolve(audio.duration);
              audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
            audio.addEventListener('loadedmetadata', handleLoadedMetadata);
            audio.load();
          });
        };
        
        const duration = await getDuration();
        
        const tempId = Date.now();
        lastTempIdSent.current = tempId;
        
        // Add voice note to UI immediately
        setMessages((prev) => [
          ...prev,
          {
            id: tempId,
            userId: user.id,
            text: "🎤 Voice note",
            message_type: 'voice_note',
            audio_data: `data:audio/webm;base64,${base64Audio}`,
            audio_duration: duration,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            sender: "Me",
            isOwnMessage: true,
          },
        ]);
        
        // Send via socket
        emitSafe(groupSocket, "group:message", { 
          groupId: group.id, 
          message: "🎤 Voice note", 
          tempId, 
          userId: user.id,
          messageType: 'voice_note',
          audioData: base64Audio,
          audioDuration: duration
        }, (ack) => {
          if (!ack || !ack.ok) {
            console.error("Socket voice note failed:", ack?.error);
            // Fallback to HTTP API
            sendVoiceNoteViaAPI(base64Audio, duration, tempId);
          }
        });
        
        setShowVoiceNoteRecorder(false);
        showSuccess("Voice note sent!");
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error sending voice note:", error);
      showSuccess("Failed to send voice note");
    }
  };

  const startVideoCall = () => {
    const callId = `group_video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Use the new call manager to initiate group call
    if (window.callManager) {
      window.callManager.initiateCall({
        callType: 'video',
        isGroupCall: true,
        groupId: group.id,
        groupName: group.name,
        participants: group.Participants || []
      });
    } else {
      // Fallback to old system
      setVideoCallData({
        callId,
        groupId: group.id,
        participants: group.Participants || []
      });
      setIsVideoCallActive(true);
    }
  };

  const endVideoCall = () => {
    if (window.callManager && window.callManager.activeCall) {
      window.callManager.endCall();
    } else {
      setIsVideoCallActive(false);
      setVideoCallData(null);
    }
  };

  const startVoiceCall = () => {
    const callId = `group_voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Use the new call manager to initiate group call
    if (window.callManager) {
      window.callManager.initiateCall({
        callType: 'voice',
        isGroupCall: true,
        groupId: group.id,
        groupName: group.name,
        participants: group.Participants || []
      });
    } else {
      // Fallback to old system
      setVoiceCallData({
        callId,
        groupId: group.id,
        participants: group.Participants || []
      });
      setIsVoiceCallActive(true);
    }
  };

  const endVoiceCall = () => {
    if (window.callManager && window.callManager.activeCall) {
      window.callManager.endCall();
    } else {
      setIsVoiceCallActive(false);
      setVoiceCallData(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


  /* ------------------- SOCKET LOGIC ------------------- */
  const [isTyping, setIsTyping] = useState(false);
  const lastTempIdSent = useRef(null);
  const typingTimeout = useRef(null);
  const messagesEndRef = useRef(null);
  const hasJoinedGroupRef = useRef(false);
  const fileInputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch initial group chat messages
  useEffect(() => {
    async function fetchHistory() {
      try {
        const msgs = await getGroupChatHistory(group.id);
        const participantsMap = {};
        (group.Participants || []).forEach(p => participantsMap[p.id] = p.username);

        setMessages(
          msgs.map((msg) => ({
            id: msg.id,
            userId: msg.user_id,
            text: msg.message,
            message_type: msg.message_type || 'text',
            audio_data: msg.audio_data,
            audio_duration: msg.audio_duration,
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

  // Safe emit
  const emitSafe = (socket, event, data, callback) => {
    if (!data.userId) data.userId = user.id;
    if (socket.connected) socket.emit(event, data, callback);
    else if (callback) callback({ ok: false, error: "Socket not connected" });
  };

  // Leave group
  const leaveGroup = (socket, groupId) => {
    emitSafe(socket, "group:leave", { groupId });
  };

  // Typing
  const sendTyping = (socket, groupId, isTyping) => {
    emitSafe(socket, "group:typing", { groupId, isTyping });
  };

  // Connect socket on mount
  useEffect(() => {
    const connectSocket = () => {
      if (!groupSocket.connected) {
        groupSocket.connect();
      }
    };

    const handleConnect = () => {
      if (!hasJoinedGroupRef.current) {
        emitSafe(groupSocket, "group:join", { groupId: group.id });
        hasJoinedGroupRef.current = true;
      }
    };

    const handleDisconnect = () => {
      hasJoinedGroupRef.current = false;
    };

    const handleConnectError = (error) => {
      console.error("Group socket connection error:", error);
    };

    // Connect immediately
    connectSocket();

    // Set up event listeners
    groupSocket.on("connect", handleConnect);
    groupSocket.on("disconnect", handleDisconnect);
    groupSocket.on("connect_error", handleConnectError);

    const handleNewMessage = (msg) => {
      // Skip if this is our own message that we already added locally
      if (msg.tempId && msg.tempId === lastTempIdSent.current) {
        return;
      }
      
      if (msg.group_id === group.id) {
        const participantsMap = {};
        (group.Participants || []).forEach((p) => participantsMap[p.id] = p.username);
        
        const newMessage = {
          id: msg.id,
          userId: msg.user_id,
          text: msg.message,
          message_type: msg.message_type || 'text',
          audio_data: msg.audio_data,
          audio_duration: msg.audio_duration,
          time: new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sender: msg.user_id === user.id ? "Me" : participantsMap[msg.user_id] || "Unknown",
          isOwnMessage: msg.user_id === user.id,
        };
        
        setMessages((prev) => [...prev, newMessage]);
        emitSafe(groupSocket, "group:read", { groupId: group.id, lastReadMessageId: msg.id });
      }
    };

    const handleTyping = ({ userId: typingUserId, groupId: typingGroupId, isTyping }) => {
      if (group.id === typingGroupId && typingUserId !== user.id) {
        setIsTyping(isTyping);
      }
    };

    groupSocket.on("connect", handleConnect);
    groupSocket.on("group:message:new", handleNewMessage);
    groupSocket.on("group:typing", handleTyping);
    groupSocket.on("group:user:joined", ({ userId }) => console.log(`User ${userId} joined group ${group.id}`));
    groupSocket.on("group:user:left", ({ userId }) => console.log(`User ${userId} left group ${group.id}`));

    return () => {
      leaveGroup(groupSocket, group.id);
      groupSocket.off("connect", handleConnect);
      groupSocket.off("disconnect", handleDisconnect);
      groupSocket.off("connect_error", handleConnectError);
      groupSocket.off("group:message:new", handleNewMessage);
      groupSocket.off("group:typing", handleTyping);
      groupSocket.off("group:user:joined");
      groupSocket.off("group:user:left");
    };
  }, [group.id, user.id, group.Participants]);

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const messageText = newMessage.trim();
    const tempId = Date.now();
    lastTempIdSent.current = tempId;

    // Add message to UI immediately
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        userId: user.id,
        text: messageText,
        sender: "Me",
        isOwnMessage: true,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    // Clear input immediately
    setNewMessage("");

    // Try socket first, fallback to HTTP API
    try {
      emitSafe(groupSocket, "group:message", { groupId: group.id, message: messageText, tempId, userId: user.id }, (ack) => {
        if (!ack || !ack.ok) {
          console.error("Socket message failed:", ack?.error);
          // Fallback to HTTP API
          sendMessageViaAPI(messageText, tempId);
        }
      });
    } catch (error) {
      console.error("Socket error, falling back to HTTP API:", error);
      // Fallback to HTTP API
      sendMessageViaAPI(messageText, tempId);
    }
  };

  // Fallback method to send message via HTTP API
  const sendMessageViaAPI = async (messageText, tempId) => {
    try {
      const response = await sendGroupMessage(group.id, messageText);
      
      if (response.success) {
        // Update the temporary message with the real server response
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { 
                ...msg, 
                id: response.data.id,
                time: new Date(response.data.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              }
            : msg
        ));
        console.log("Message sent via HTTP API successfully");
      } else {
        throw new Error(response.error || "Failed to send message");
      }
    } catch (error) {
      console.error("HTTP API message failed:", error);
      showError("Failed to send message. Please try again.");
      
      // Remove the temporary message from UI
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  // Fallback method to send voice note via HTTP API
  const sendVoiceNoteViaAPI = async (audioData, duration, tempId) => {
    try {
      // For now, we'll use the regular message API with voice note data
      // In a full implementation, you'd have a dedicated voice note endpoint
      const response = await sendGroupMessage(group.id, "🎤 Voice note");
      
      if (response.success) {
        // Update the temporary message with the real server response
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { 
                ...msg, 
                id: response.data.id,
                time: new Date(response.data.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              }
            : msg
        ));
        console.log("Voice note sent via HTTP API successfully");
      } else {
        throw new Error(response.error || "Failed to send voice note");
      }
    } catch (error) {
      console.error("HTTP API voice note failed:", error);
      showError("Failed to send voice note. Please try again.");
      
      // Remove the temporary message from UI
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  const handleTypingChange = (e) => {
    setNewMessage(e.target.value);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    if (e.target.value.length > 0) {
      sendTyping(groupSocket, group.id, true);
      typingTimeout.current = setTimeout(() => sendTyping(groupSocket, group.id, false), 2000);
    } else {
      sendTyping(groupSocket, group.id, false);
    }
  };

  return (
    <div className="group-chat">
      {/* Header */}
      <div className="chat-header">
        <button onClick={onBack}><ArrowLeft size={20} /></button>
        <div className="chat-info">
          <h3>{group.title}</h3>
          <p><Users size={14} /> {group.participants} members</p>
        </div>
        <div className="header-actions">
          <button className="header-btn" onClick={startVideoCall} title="Video Call">
            <Video size={18} />
          </button>
          <button className="header-btn" onClick={startVoiceCall} title="Voice Call">
            <Phone size={18} />
          </button>
          <DropdownMenu 
            items={[
              {
                label: "Sessions",
                icon: <Users size={16} />,
                onClick: () => setShowSessions(true)
              },
              {
                label: "Create Session",
                icon: <Plus size={16} />,
                onClick: () => setShowModal(true)
              }
            ]}
            className="header-btn"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.isOwnMessage ? "me" : "other"}`}>
            <div>
              {msg.sender !== "Me" && <h5 className="sender">{msg.sender}</h5>}
              {msg.message_type === 'voice_note' ? (
                <VoiceNotePlayer
                  audioBlob={null}
                  audioUrl={msg.audio_data}
                  duration={msg.audio_duration}
                  isOwnMessage={msg.isOwnMessage}
                />
              ) : (
                <p className="text">{msg.text}</p>
              )}
              <span className="time">{msg.time}</span>
            </div>
          </div>
        ))}
        {isTyping && <p style={{ fontStyle: "italic" }}>Someone is typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input">
        <div className="input-container">
          <button className="attach-btn" onClick={() => fileInputRef.current?.click()} title="Attach File">
            <File size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            style={{ display: 'none' }}
          />
          
          <div className="message-input-container">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={handleTypingChange}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="message-input"
            />
            
            {/* File attachments preview */}
            {attachedFiles.length > 0 && (
              <div className="attached-files">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="attached-file">
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                    <button 
                      className="remove-file-btn" 
                      onClick={() => removeFile(index)}
                      title="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="emoji-btn" onClick={toggleEmojiPicker} title="Emoji">
            <Smile size={18} />
          </button>
          
          {newMessage.trim() || attachedFiles.length > 0 ? (
            <button className="send-btn" onClick={sendMessage}>
              <Send size={18} />
            </button>
          ) : (
            <button className="mic-btn" onClick={toggleVoiceNoteRecorder} title="Voice Note">
              <Mic size={18} />
            </button>
          )}
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div style={{ position: 'relative' }}>
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              isOpen={showEmojiPicker}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}

        {/* Voice Note Recorder */}
        {showVoiceNoteRecorder && (
          <div style={{ position: 'relative' }}>
            <VoiceNoteRecorder
              onRecordingComplete={handleVoiceNoteSend}
              onCancel={() => setShowVoiceNoteRecorder(false)}
            />
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Session</h3>
            <form onSubmit={handleCreateSession}>
              <label>Title<input type="text" value={sessionData.title} onChange={(e) => setSessionData({ ...sessionData, title: e.target.value })} /></label>
              <label>Subject<input type="text" value={sessionData.subject} onChange={(e) => setSessionData({ ...sessionData, subject: e.target.value })} /></label>
              <label>Description<textarea value={sessionData.description} onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })} /></label>
              <label>Location<input type="text" value={sessionData.location} onChange={(e) => setSessionData({ ...sessionData, location: e.target.value })} /></label>
              <label>Start Date<input type="date" value={sessionData.date} onChange={(e) => setSessionData({ ...sessionData, date: e.target.value })} /></label>
              <label>Start Time<input type="time" value={sessionData.time} onChange={(e) => setSessionData({ ...sessionData, time: e.target.value })} /></label>
              <label>End Date<input type="date" value={sessionData.endDate} onChange={(e) => setSessionData({ ...sessionData, endDate: e.target.value })} /></label>
              <label>End Time<input type="time" value={sessionData.endTime} onChange={(e) => setSessionData({ ...sessionData, endTime: e.target.value })} /></label>
              <div className="modal-actions">
                <button type="button" className="outline-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="blue-btn">{creatingSession ? "Creating..." : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {showSessions && (
        <div className="modal-overlay">
          <div className="progress-card full-width">
            <div className="card-header"><h3>Upcoming Sessions</h3></div>
            {upcomingSessions.length > 0 ? (
              <div className="sessions-list">
                {upcomingSessions.map((session) => {
                  const sessionId = session.id || session._id;
                  return (
                    <div key={sessionId} className="session-item">
                      <div className="session-content" onClick={() => setSelectedSession(session)}>
                        <div className="session-dot"></div>
                        <div className="session-info">
                          <span className="session-title">{session.title}</span>
                          <span className="session-date">{session.date}</span>
                        </div>
                      </div>
                      <div className="session-actions">
                        <button className="join-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSession(session);
                        }}
                        >View</button>
                        <button 
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session);
                          }}
                          title="Delete session"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">No upcoming sessions. Schedule your next study session!</div>
            )}
            <div className="modal-actions"><button className="outline-btn" onClick={() => setShowSessions(false)}>Close</button></div>
          </div>
        </div>
      )}

      {/* Session Details */}
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
              <button className="outline-btn" onClick={() => setSelectedSession(null)}>Cancel</button>
              <button className="blue-btn" onClick={() => handleJoinSession(selectedSession)} disabled={joining}>{joining ? "Joining..." : "Join"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="progress-card">
            <div className="card-header">
              <h3>Delete Session</h3>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete this session?</p>
              {sessionToDelete && (
                <div className="session-preview">
                  <strong>{sessionToDelete.title}</strong>
                  <span>{sessionToDelete.date} at {sessionToDelete.startTime}</span>
                </div>
              )}
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="outline-btn" 
                onClick={cancelDeleteSession}
                disabled={deletingSession}
              >
                Cancel
              </button>
              <button 
                className="delete-btn-confirm" 
                onClick={confirmDeleteSession}
                disabled={deletingSession}
              >
                {deletingSession ? "Deleting..." : "Delete Session"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Call */}
      {isVideoCallActive && videoCallData && (
        <GroupVideoCall
          callId={videoCallData.callId}
          onEndCall={endVideoCall}
          groupId={videoCallData.groupId}
          participants={videoCallData.participants}
        />
      )}

      {/* Voice Call */}
      {isVoiceCallActive && voiceCallData && (
        <GroupVoiceCall
          callId={voiceCallData.callId}
          onEndCall={endVoiceCall}
          groupId={voiceCallData.groupId}
          participants={voiceCallData.participants}
        />
      )}
    </div>
  );
}
