import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Check, X, Users, UserPlus } from "lucide-react";
import "./FriendList.css";

const FriendList = () => {
  const mockRequests = [
    {
      id: 1,
      name: "Sophie Martinez",
      school: "MIT",
      course: "Computer Science",
      mutualFriends: 3,
      interests: ["Machine Learning", "Web Development", "Data Science"],
    },
    {
      id: 2,
      name: "David Chen",
      school: "Stanford",
      course: "Mathematics",
      mutualFriends: 1,
      interests: ["Calculus", "Statistics", "Linear Algebra"],
    },
  ];

  const suggestedFriends = [
    {
      id: 3,
      name: "Emma Thompson",
      school: "UC Berkeley",
      course: "Physics",
      mutualFriends: 2,
      interests: ["Quantum Physics", "Thermodynamics", "Research"],
    },
    {
      id: 4,
      name: "Ryan Park",
      school: "MIT",
      course: "Computer Science",
      mutualFriends: 5,
      interests: ["Algorithms", "Software Engineering", "AI"],
    },
  ];

  return (
    <div className="friend-list-container">
      {/* Pending Requests */}
      <div className="friend-card">
        <div className="card-header">
          <UserPlus className="card-header-icon" size={18} />
          <h2>Friend Requests</h2>
          <span className="request-count">{mockRequests.length}</span>
        </div>
        
        <div>
          {mockRequests.map((request) => (
            <div key={request.id} className="request-item">
              <div className="request-info">
                <div className="avatar">
                  {request.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="request-details">
                  <h3 className="request-name">{request.name}</h3>
                  <p className="request-meta">{request.school} • {request.course}</p>
                  <p className="mutual-friends">{request.mutualFriends} mutual friends</p>
                  <div className="interests-container">
                    {request.interests.slice(0, 2).map((interest, index) => (
                      <span key={index} className="interest-badge">{interest}</span>
                    ))}
                    {request.interests.length > 2 && (
                      <span className="more-interests">+{request.interests.length - 2}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="request-actions">
                <button className="accept-btn">
                  <Check size={16} />
                </button>
                <button className="decline-btn">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Friends */}
      <div className="friend-card">
        <div className="card-header">
          <h2>Suggested Study Buddies</h2>
        </div>
        
        <div>
          {suggestedFriends.map((friend) => (
            <div key={friend.id} className="suggested-item">
              <div className="request-info">
                <div className="avatar">
                  {friend.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="request-details">
                  <h3 className="request-name">{friend.name}</h3>
                  <p className="request-meta">{friend.school} • {friend.course}</p>
                  <p className="mutual-friends">{friend.mutualFriends} mutual friends</p>
                  <div className="interests-container">
                    {friend.interests.slice(0, 2).map((interest, index) => (
                      <span key={index} className="interest-badge">{interest}</span>
                    ))}
                    {friend.interests.length > 2 && (
                      <span className="more-interests">+{friend.interests.length - 2}</span>
                    )}
                  </div>
                </div>
              </div>
              <button className="add-friend-btn">Add Friend</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendList;