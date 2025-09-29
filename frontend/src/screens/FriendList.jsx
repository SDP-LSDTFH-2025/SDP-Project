import React, { useState } from "react";
import { Check, X, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers, getPendingFriendRequests } from "../api/resources";
import "./FriendList.css";

const FriendList = ({ handleNavigationClick, setSelectedUser }) => {
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState([]);

  // Fetch suggested friends (all users)
  const {
    data: suggestedFriends = [],
    isLoading: loadingUsers,
    error: usersError,
  } = useQuery({
      queryKey: ["users"], 
      queryFn: getAllUsers,
    staleTime: 60 * 60 * 1000, // 1 hour in milliseconds
    cacheTime: 65 * 60 * 1000, // slightly longer than staleTime so it stays cached
    });

  const {
    data: friendRequests = [],
    isLoading: loadingRequestsQuery,
    error: requestsError,
  } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getPendingFriendRequests,
    staleTime: 5 * 60 * 1000, // friend requests are more dynamic
  });

  // --- Action handlers ---
  const handleAccept = async (fr, e) => {
    e.stopPropagation();
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(`${import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER || "http://localhost:3000"}/api/v1/friends/request/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: user,
          id: user.id,
          requestID: fr.request.id,
          response: "accept",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`You are now friends with ${fr.user.username}`);
      } else {
        alert(`Could not accept request: ${data.message}`);
      }
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const handleDecline = (user, e) => {
    e.stopPropagation();
    console.log("Declined:", user.username);
  };

  const handleAddFriend = async (receiver, e) => {
    e.stopPropagation();
    try {
      setLoadingRequests((prev) => [...prev, receiver.id]);
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(`${import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER || "http://localhost:3000"}/api/v1/friends/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: user,
          id: user.id,
          username: receiver.username,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSentRequests((prev) => [...prev, receiver.id]);
      }
    } catch (err) {
      console.error("Error sending friend request", err);
    } finally {
      setLoadingRequests((prev) => prev.filter((id) => id !== receiver.id));
    }
  };

  const handleCardClick = (user) => {
    setSelectedUser(user);
    handleNavigationClick("usersprof");
  };

  // --- Loading/Error states ---
  if (loadingUsers || loadingRequestsQuery) return <p>Loading friends...</p>;
  if (usersError || requestsError) return <p>Error loading friends data</p>;

  return (
    <div className="friend-list-container">
      {/* Friend Requests */}
      <div className="friend-card">
        <div className="card-header">
          <UserPlus className="card-header-icon" size={18} />
          <h2>Friend Requests</h2>
          <span className="request-count">{friendRequests.length}</span>
        </div>

        <div className="card-scroll" >
          {friendRequests.length === 0 ? (
            <p>No friend requests right now.</p>
          ) : (
            friendRequests.map((fr) => (
              <div
                key={fr.request.id}
                className="request-item clickable"
                onClick={() => handleCardClick(fr.user)}
              >
                <div className="request-info">
                  <div className="avatar">
                    {fr.user.username
                      ?.split("_")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="request-details">
                    <h3 className="request-name">
                      {fr.user.username?.replaceAll("_", " ")}
                    </h3>
                    <p className="request-meta">
                      {fr.user.institution || "Unknown"} • {fr.user.course || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="request-actions">
                  <button className="accept-btn" onClick={(e) => handleAccept(fr, e)}>
                    <Check size={16} />
                  </button>
                  <button className="decline-btn" onClick={(e) => handleDecline(fr.user, e)}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Suggested Friends */}
      <div className="friend-card">
        <div className="card-header">
          <h2>Suggested Study Buddies</h2>
        </div>

        <div className="card-scroll">
          {suggestedFriends.length === 0 ? (
            <p>No suggested friends found.</p>
          ) : (
            suggestedFriends.map((friend) => (
              <div
                key={friend.id}
                className="suggested-item clickable"
                onClick={() => handleCardClick(friend)}
              >
                <div className="request-info">
                  <div className="avatar">
                    {friend.username
                      ?.split("_")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="request-details">
                    <h3 className="request-name">
                      {friend.username?.replaceAll("_", " ")}
                    </h3>
                    <p className="request-meta">
                      {friend.institution || "Unknown"} • {friend.course || "N/A"}
                    </p>
                  </div>
                </div>
                {sentRequests.includes(friend.id) ? (
                  <button className="sent-btn" disabled>Sent</button>
                ) : loadingRequests.includes(friend.id) ? (
                  <button className="sent-btn" disabled>Sending...</button>
                ) : (
                  <button className="add-friend-btn" onClick={(e) => handleAddFriend(friend, e)}>
                    Add Friend
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendList;
