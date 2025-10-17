import React, { useState } from "react";
import { Check, X, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers, getPendingFriendRequests } from "../api/resources";
import {
  respondToFriendRequest,
  sendFriendRequest,
  declineFriendRequest,
  getSentFriendRequests,
} from "../api/friends";
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
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 65 * 60 * 1000,
  });

  // Fetch pending friend requests
  const {
    data: friendRequests = [],
    isLoading: loadingRequestsQuery,
    error: requestsError,
  } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getPendingFriendRequests,
    staleTime: 5 * 60 * 1000, // more dynamic
  });

  // Fetch sent friend requests
  const {
    data: sentRequestsData = { followers: [] },
    isLoading: loadingSentRequests,
    error: sentRequestsError,
  } = useQuery({
    queryKey: ["sentRequests"],
    queryFn: getSentFriendRequests,
    staleTime: 5 * 60 * 1000, // more dynamic
  });

  // Extract sent request user IDs
  const sentRequestUserIds = Array.isArray(sentRequestsData.followers) 
    ? sentRequestsData.followers.map(sr => sr.user.id)
    : [];

  // --- Action handlers ---
  const handleAccept = async (fr, e) => {
    e.stopPropagation();
    try {
      const data = await respondToFriendRequest({
        requestID: fr.request.id,
        response: "accept",
      });
      if (data.success) {
        alert(`You are now friends with ${fr.user.username}`);
        // Refresh the friend requests list
        window.location.reload();
      } else {
        alert(`Could not accept request: ${data.message}`);
      }
    } catch (err) {
      console.error("Error accepting request:", err);
      alert("Error accepting friend request. Please try again.");
    }
  };

  const handleDecline = async (fr, e) => {
    e.stopPropagation();
    try {
      const data = await declineFriendRequest({
        requestID: fr.request.id,
      });
      if (data.success) {
        alert(`Declined request from ${fr.user.username}`);
        // Refresh the friend requests list
        window.location.reload();
      } else {
        alert(`Could not decline request: ${data.message}`);
      }
    } catch (err) {
      console.error("Error declining request:", err);
      alert("Error declining friend request. Please try again.");
    }
  };

  const handleAddFriend = async (receiver, e) => {
    e.stopPropagation();
    try {
      setLoadingRequests((prev) => [...prev, receiver.id]);
      const data = await sendFriendRequest({
        username: receiver.username,
      });
      if (data.success) {
        // Refresh sent requests to update the UI
        window.location.reload();
        alert(`Friend request sent to ${receiver.username}`);
      } else {
        alert(`Could not send friend request: ${data.message || data.response || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error sending friend request", err);
      const errorMessage = err.response?.data?.response || err.response?.data?.message || err.message || "Unknown error";
      alert(`Error sending friend request: ${errorMessage}`);
    } finally {
      setLoadingRequests((prev) => prev.filter((id) => id !== receiver.id));
    }
  };

  const handleCardClick = (user) => {
    setSelectedUser(user);
    handleNavigationClick("usersprof");
  };

  // --- Loading/Error states ---
  if (loadingUsers || loadingRequestsQuery || loadingSentRequests) return <p>Loading friends...</p>;
  if (usersError || requestsError || sentRequestsError) return <p>Error loading friends data</p>;

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
                {sentRequestUserIds.includes(friend.id) ? (
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
