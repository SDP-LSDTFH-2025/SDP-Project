import React, { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Send } from "lucide-react";
import { socket } from "../socket";

function makeChatId(userA, userB) {
  return [userA, userB].sort().join("");
}

export default function ChatWindow({ chat, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.id;
  const chatId = makeChatId(currentUserId, chat.id);

  const initials = chat.username
    .split("_")
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  useEffect(() => {

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("private:join", { chatId });

    socket.on("private:message:new", (msg) => {
      if (makeChatId(msg.sender_id, msg.receiver_id) === chatId) {
        setMessages((prev) => {
          if (msg.tempId) {
            return prev.map((m) =>
              m.tempId === msg.tempId ? { ...m, ...msg, pending: false } : m
            );
          }
          return [
            ...prev,
            {
              id: msg.id,
              text: msg.message,
              from: msg.sender_id === currentUserId ? "me" : "other",
              time: new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ];
        });
      }
    });

    return () => {
      socket.off("private:message:new");
    };
  }, [chatId, currentUserId]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const tempId = Date.now();

    const optimisticMsg = {
      tempId,
      text: input,
      from: "me",
      pending: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    socket.emit(
      "private:message",
      {
        senderId: currentUserId,
        receiverId: chat.id,
        message: input,
        tempId,
      },
      (ack) => {
        if (!ack.ok) {
          console.error("Message failed:", ack.error);
          setMessages((prev) =>
            prev.map((m) =>
              m.tempId === tempId ? { ...m, failed: true, pending: false } : m
            )
          );
        }
      }
    );

    setInput("");
  };

  return (
    <div className="chat-window-container">
      <div className="chat-header">
        <Button className="back-btn" onClick={onBack}>←</Button>
        <div className="avatar"><span>{initials}</span></div>
        <div className="header-info">
          <h2>{chat.username.replaceAll("_", " ")}</h2>
          <p>{chat.Active ? "Online" : "Offline"}</p>
        </div>
      </div>

      <div className="messages">
        {messages.map((msg, i) => (
          <div
            key={msg.id || msg.tempId || i}
            className={`message ${msg.from} ${msg.pending ? "pending" : ""} ${msg.failed ? "failed" : ""}`}
          >
            <p>{msg.text}</p>
            <span className="time">{msg.time}</span>
            {msg.pending && <span className="status">⏳</span>}
            {msg.failed && <span className="status">❌</span>}
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
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}><Send className="pic" /></button>
      </div>
    </div>
  );
}
