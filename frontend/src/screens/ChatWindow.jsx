import React, { useState, useEffect, useRef } from "react";
import { Input } from "../components/ui/input";
import { Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { socket } from "../socket";
import { getPrivateChatHistory } from "../api/chat";

function makeChatId(userA, userB) {
  return [userA, userB].sort().join(""); // consistent ID for both directions
}

export default function ChatWindow({ chat, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const lastTempIdSent = useRef(null);
  const typingTimeout = useRef(null);
  const messagesEndRef = useRef(null);

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

  return (
    <div className="chat-window-container">
      <div className="chat-header">
        <Button className="back-btn" onClick={onBack}>
          ←
        </Button>
        <div className="avatar">
          <span>{initials}</span>
        </div>
        <div className="header-info">
          <h2>{chat.username.replaceAll("_", " ")}</h2>
          {isTyping ? (
            <p style={{ fontStyle: "italic" }}>Typing...</p>
          ) : (
            <p style={{ color: chat.is_active ? "green" : "gray" }}>
              {chat.is_active ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.from}`}>
            <p>{msg.text}</p>
            <span className="time">{msg.time}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <Input
          className="messagebox"
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>
          <Send className="pic" />
        </button>
      </div>
    </div>
  );
}
