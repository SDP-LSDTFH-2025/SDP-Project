import React, { useState } from "react";
import "./FriendRequests.css";

const FriendRequests = () => {
  const [activeTab, setActiveTab] = useState("sent");

  // dummy users
  const sentRequests = [
    { id: 1, name: "Michael Chen", username: "@mchen", role: "Product Designer", time: "1h ago", img: "https://i.pravatar.cc/100?img=1" },
    { id: 2, name: "Alice Brown", username: "@aliceb", role: "UX Designer", time: "2h ago", img: "https://i.pravatar.cc/100?img=2" },
    { id: 3, name: "John Doe", username: "@johnd", role: "Frontend Dev", time: "3h ago", img: "https://i.pravatar.cc/100?img=3" },
    { id: 4, name: "Mary Smith", username: "@marys", role: "Backend Dev", time: "5h ago", img: "https://i.pravatar.cc/100?img=4" },
    { id: 5, name: "Chris Lee", username: "@chrisl", role: "Data Scientist", time: "6h ago", img: "https://i.pravatar.cc/100?img=5" },
  ];

  const receivedRequests = [
    { id: 1, name: "Sarah Johnson", username: "@sarahj", role: "Software Engineer", time: "1h ago", img: "https://i.pravatar.cc/100?img=6" },
    { id: 2, name: "Daniel Kim", username: "@danielk", role: "AI Engineer", time: "2h ago", img: "https://i.pravatar.cc/100?img=7" },
    { id: 3, name: "Sophia Patel", username: "@sophiap", role: "Researcher", time: "4h ago", img: "https://i.pravatar.cc/100?img=8" },
    { id: 4, name: "Liam Walker", username: "@liamw", role: "Cloud Architect", time: "5h ago", img: "https://i.pravatar.cc/100?img=9" },
    { id: 5, name: "Emma Davis", username: "@emmad", role: "Mobile Dev", time: "6h ago", img: "https://i.pravatar.cc/100?img=10" },
  ];

  const data = activeTab === "sent" ? sentRequests : receivedRequests;

  return (
    <div className="friend-container">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "sent" ? "tab active" : "tab"}
          onClick={() => setActiveTab("sent")}
        >
          Sent
        </button>
        <button
          className={activeTab === "received" ? "tab active" : "tab"}
          onClick={() => setActiveTab("received")}
        >
          Requests
        </button>
      </div>

      {/* List */}
      <div className="friend-list">
        {data.map((user) => (
          <div key={user.id} className="friend-card">
            <img src={user.img} alt={user.name} className="avatar" />
            <div className="info">
              <h3>{user.name}</h3>
              <p className="username">{user.username}</p>
              <p className="role">{user.role}</p>
              <span className="time">{user.time}</span>
            </div>
            <div className="actions">
              {activeTab === "sent" ? (
                <button className="cancel">✖ Cancel</button>
              ) : (
                <>
                  <button className="accept">✔ Accept</button>
                  <button className="decline">✖ Decline</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendRequests;
