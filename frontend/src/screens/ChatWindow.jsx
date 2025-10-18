import React, { useState, useEffect, useRef } from "react";
import { Input } from "../components/ui/input";
import { Send, ArrowLeft, Phone, Video, Smile, Paperclip, Mic, Image, File } from "lucide-react";
import { Button } from "../components/ui/button";
import { socket } from "../socket";
import { getPrivateChatHistory } from "../api/chat";
import DropdownMenu, { chatWindowMenuItems } from "../components/DropdownMenu";
import EmojiPicker from "../components/EmojiPicker";
import VoiceRecorder from "../components/VoiceRecorder";

function makeChatId(userA, userB) {
  return [userA, userB].sort().join(""); // consistent ID for both directions
}

export default function ChatWindow({ chat, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const lastTempIdSent = useRef(null);
  const typingTimeout = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.id;
  const chatId = makeChatId(currentUserId, chat.id);

  const initials = chat.username
    .split("_")
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch chat history
  useEffect(() => {
    async function fetchHistory() {
      try {
        const allMsgs = await getPrivateChatHistory(currentUserId, chat.id);

        const formatted = allMsgs.map((msg) => ({
          from: msg.sender_id === currentUserId ? "me" : "other",
          text: msg.message,
          time: new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          timestamp: new Date(msg.created_at),
          id: msg.id,
          status: msg.sender_id === currentUserId ? "sent" : "received"
        }));

        setMessages(formatted);
        console.log("Loaded messages:", formatted);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    }

    fetchHistory();
  }, [chat.id, currentUserId]);

  // Socket setup
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      console.log("Socket connecting...");
    }

    socket.emit("private:join", { chatId });

    // Incoming messages
    const handleNewMessage = (msg) => {
      console.log("Incoming socket message:", msg);

      if (msg.tempId && msg.tempId === lastTempIdSent.current) return;

      if (makeChatId(msg.sender_id, msg.receiver_id) === chatId) {
        setMessages((prev) => [
          ...prev,
          {
            from: msg.sender_id === currentUserId ? "me" : "other",
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            timestamp: new Date(msg.created_at),
            id: msg.id || Date.now(),
            status: msg.sender_id === currentUserId ? "sent" : "received"
          },
        ]);

        socket.emit("private:read", { fromUserId: msg.sender_id });
      }
    };

    const handleTyping = ({ from, isTyping }) => {
      if (from === chat.id) setIsTyping(isTyping);
    };

    const handleRead = ({ by }) => {
      if (by === chat.id) console.log("Message read by", chat.username);
    };

    socket.on("private:message:new", handleNewMessage);
    socket.on("private:typing", handleTyping);
    socket.on("private:read", handleRead);

    return () => {
      socket.off("private:message:new", handleNewMessage);
      socket.off("private:typing", handleTyping);
      socket.off("private:read", handleRead);
    };
  }, [chatId, currentUserId, chat.id, chat.username]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const tempId = Date.now();
    lastTempIdSent.current = tempId;

    const localMsg = {
      from: "me",
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: new Date(),
      id: tempId,
      status: "sending"
    };
    setMessages((prev) => [...prev, localMsg]);

    socket.emit(
      "private:message",
      {
        senderId: currentUserId,
        receiverId: chat.id,
        message: input,
        tempId,
      },
      (ack) => {
        if (!ack.ok) console.error("Message failed:", ack.error);
      }
    );

    setInput("");
  };

  const handleTyping = (e) => {
    setInput(e.target.value);

    socket.emit("private:typing", {
      senderId: currentUserId,
      receiverId: chat.id,
      isTyping: true,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("private:typing", {
        senderId: currentUserId,
        receiverId: chat.id,
        isTyping: false,
      });
    }, 1500);
  };

  const handleEmojiSelect = (emoji) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleVoiceRecordingComplete = (audioBlob) => {
    // For now, just show a message that voice recording is not sent to backend
    console.log("Voice recording completed:", audioBlob);
    alert("Voice message recorded! (Not sent to backend yet)");
    setShowVoiceRecorder(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="whatsapp-chat-window">
      {/* WhatsApp-style Header */}
      <div className="whatsapp-chat-header">
        <div className="whatsapp-header-left">
          <Button className="whatsapp-back-btn" onClick={onBack} variant="ghost" size="sm">
            <ArrowLeft size={20} />
          </Button>
          <div className="whatsapp-avatar-container">
            <div className="whatsapp-avatar">
              <span>{initials}</span>
            </div>
            <div className={`whatsapp-status-dot ${chat.is_active ? 'online' : 'offline'}`}></div>
          </div>
          <div className="whatsapp-header-info">
            <h2>{chat.username.replaceAll("_", " ")}</h2>
            {isTyping ? (
              <p className="whatsapp-typing">
                <span className="typing-dots">typing</span>
              </p>
            ) : (
              <p className={`whatsapp-status ${chat.is_active ? 'online' : 'offline'}`}>
                {chat.is_active ? "online" : "last seen recently"}
              </p>
            )}
          </div>
        </div>
        <div className="whatsapp-header-actions">
          <Button variant="ghost" size="sm" className="whatsapp-action-btn">
            <Video size={20} />
          </Button>
          <Button variant="ghost" size="sm" className="whatsapp-action-btn">
            <Phone size={20} />
          </Button>
          <DropdownMenu 
            items={chatWindowMenuItems}
            className="whatsapp-action-btn"
          />
        </div>
      </div>

      {/* WhatsApp-style Messages */}
      <div className="whatsapp-messages-container">
        <div className="whatsapp-messages">
          {messages.length === 0 ? (
            <div className="whatsapp-empty-chat">
              <div className="whatsapp-empty-icon">💬</div>
              <h3>Start a conversation</h3>
              <p>Send a message to begin chatting with {chat.username.replaceAll("_", " ")}</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id || i} className={`whatsapp-message-wrapper ${msg.from}`}>
                <div className={`whatsapp-message ${msg.from}`}>
                  <div className="whatsapp-message-content">
                    <p>{msg.text}</p>
                    <div className="whatsapp-message-meta">
                      <span className="whatsapp-time">{msg.time}</span>
                      {msg.from === "me" && (
                        <span className={`whatsapp-message-status ${msg.status}`}>
                          {msg.status === "sending" && "⏳"}
                          {msg.status === "sent" && "✓"}
                          {msg.status === "delivered" && "✓✓"}
                          {msg.status === "read" && "✓✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* WhatsApp-style Input Area */}
      <div className="whatsapp-input-area">
        {/* File Attachments Preview */}
        {attachedFiles.length > 0 && (
          <div className="attached-files">
            {attachedFiles.map((file) => (
              <div key={file.id} className="attached-file">
                <div className="file-info">
                  {file.type.startsWith('image/') ? (
                    <Image size={16} />
                  ) : (
                    <File size={16} />
                  )}
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({formatFileSize(file.size)})</span>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="remove-file-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="whatsapp-input-container">
          <div className="input-actions">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="whatsapp-attach-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={20} />
            </Button>
          </div>
          
          <div className="whatsapp-input-wrapper">
            <Input
              className="whatsapp-message-input"
              type="text"
              placeholder="Message"
              value={input}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="whatsapp-emoji-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile size={20} />
            </Button>
          </div>
          
          {input.trim() || attachedFiles.length > 0 ? (
            <Button 
              onClick={sendMessage} 
              className="whatsapp-send-btn"
              size="sm"
            >
              <Send size={20} />
            </Button>
          ) : (
            <Button 
              className="whatsapp-mic-btn"
              size="sm"
              onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
            >
              <Mic size={20} />
            </Button>
          )}
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            isOpen={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        {/* Voice Recorder */}
        {showVoiceRecorder && (
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecordingComplete}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        )}
      </div>
    </div>
  );
}
