import React, { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { socket } from "../socket";

export default function ChatWindow({ chat, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const initials = chat.username.split("_").map((p) => p[0]).join("").toUpperCase();

  useEffect(() => {
    socket.connect();

    socket.emit("private:join", { chatId: chat.id });

    socket.on("private:message:new", (msg) => {
      if (msg.sender_id === chat.id) {
        setMessages((prev) => [
          ...prev,
          {
            from: "other",
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    });

    return () => {
      socket.off("private:message:new");
      socket.disconnect();
    };
  }, [chat.id]);

  const sendMessage = () => {
    if (!input.trim()) return;

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
        receiverId: chat.id, 
        message: input,
        tempId: Date.now(),
      },
      (ack) => {
        if (!ack.ok) {
          console.error("Message failed:", ack.error);
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
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}><Send className="pic" /></button>
      </div>
    </div>
  );
}
