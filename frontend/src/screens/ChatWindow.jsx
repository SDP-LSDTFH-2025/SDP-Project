import React, { useState, useEffect, useRef } from "react";
import { Input } from "../components/ui/input";
import { Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { socket } from "../socket";

function makeChatId(userA, userB) {
  return [userA, userB].sort().join("");
}

export default function ChatWindow({ chat, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [online, setOnline] = useState(chat.Active || false);

  const lastTempIdSent = useRef(null);
  const typingTimeout = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.id;
  const chatId = makeChatId(currentUserId, chat.id);

  const initials = chat.username
    .split("_")
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.emit("private:join", { chatId });

    socket.on("private:message:new", (msg) => {
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

        // Send read receipt
        socket.emit("private:read", { fromUserId: msg.sender_id });
      }
    });

    socket.on("private:typing", ({ from, isTyping }) => {
      if (from === chat.id) setIsTyping(isTyping);
    });

    socket.on("private:read", ({ by }) => {
      if (by === chat.id) {
        console.log("Message read by", chat.username);
      }
    });

    return () => {
      socket.off("private:message:new");
      socket.off("private:typing");
      socket.off("private:read");
    };
  }, [chatId, currentUserId]);

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
          <p style={{ color: chat.is_active ? "green" : "gray" }}>
            {chat.is_active ? "Online" : "Offline"}
          </p>
          {isTyping && <small style={{ fontStyle: "italic" }}>Typing...</small>}
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
