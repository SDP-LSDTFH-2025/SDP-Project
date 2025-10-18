import React, { useState, useEffect } from "react";
import { Check, X, UserPlus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, getPendingFriendRequests } from "../api/resources";
import {
  respondToFriendRequest,
  sendFriendRequest,
  declineFriendRequest,
  getSentFriendRequests,
  unfriendUser,
  checkFriendship,
} from "../api/friends";
import { showSuccess, showError } from "../utils/toast";
import "./FriendList.css";

const FriendList = ({ handleNavigationClick, setSelectedUser }) => {
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState([]);
  const [friendshipStatus, setFriendshipStatus] = useState({});
  const queryClient = useQueryClient();

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
        showSuccess(`You are now friends with ${fr.user.username}`);
        // Update friendship status
        setFriendshipStatus(prev => ({
          ...prev,
          [fr.user.id]: true
        }));
        // Invalidate and refetch the friend requests list
        queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
        queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
      } else {
        showError(`Could not accept request: ${data.message}`);
      }
    } catch (err) {
      console.error("Error accepting request:", err);
      showError("Error accepting friend request. Please try again.");
    }
  };

  const handleDecline = async (fr, e) => {
    e.stopPropagation();
    try {
      const data = await declineFriendRequest({
        requestID: fr.request.id,
      });
      if (data.success) {
        showSuccess(`Declined request from ${fr.user.username}`);
        // Invalidate and refetch the friend requests list
        queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
        queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
      } else {
        showError(`Could not decline request: ${data.message}`);
      }
    } catch (err) {
      console.error("Error declining request:", err);
      showError("Error declining friend request. Please try again.");
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
        // Update friendship status to show pending request
        setFriendshipStatus(prev => ({
          ...prev,
          [receiver.id]: false // Not friends yet, but request sent
        }));
        // Invalidate and refetch the sent requests to update the UI
        queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
        showSuccess(`Friend request sent to ${receiver.username}`);
      } else {
        showError(`Could not send friend request: ${data.message || data.response || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error sending friend request", err);
      const errorMessage = err.response?.data?.response || err.response?.data?.message || err.message || "Unknown error";
      showError(`Error sending friend request: ${errorMessage}`);
    } finally {
      setLoadingRequests((prev) => prev.filter((id) => id !== receiver.id));
    }
  };

  const handleUnfriend = async (friend, e) => {
    e.stopPropagation();
    try {
      setLoadingRequests((prev) => [...prev, friend.id]);
      const data = await unfriendUser({
        friend_id: friend.id,
      });
      if (data.success) {
        // Update friendship status
        setFriendshipStatus(prev => ({
          ...prev,
          [friend.id]: false
        }));
        // Invalidate and refetch queries
        queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
        queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
        showSuccess(`Unfriended ${friend.username}`);
      } else {
        showError(`Could not unfriend: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error unfriending user", err);
      const errorMessage = err.response?.data?.message || err.message || "Unknown error";
      showError(`Error unfriending user: ${errorMessage}`);
    } finally {
      setLoadingRequests((prev) => prev.filter((id) => id !== friend.id));
    }
  };

  const handleCardClick = (user) => {
    setSelectedUser(user);
    handleNavigationClick("usersprof");
  };

  // Check friendship status for a user
  const checkUserFriendship = async (userId) => {
    try {
      const data = await checkFriendship({ friend_id: userId });
      if (data.success) {
        setFriendshipStatus(prev => ({
          ...prev,
          [userId]: data.are_friends
        }));
      }
    } catch (err) {
      console.error("Error checking friendship status:", err);
    }
  };

  // Check if user is a friend
  const isFriend = (userId) => {
    return friendshipStatus[userId] === true;
  };

  // Check if user has a pending request
  const hasPendingRequest = (userId) => {
    return sentRequestUserIds.includes(userId);
  };

  // Check friendship status for all suggested friends when component loads
  useEffect(() => {
    if (suggestedFriends.length > 0) {
      suggestedFriends.forEach(friend => {
        if (friendshipStatus[friend.id] === undefined) {
          checkUserFriendship(friend.id);
        }
      });
    }
  }, [suggestedFriends]);

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
                {isFriend(friend.id) ? (
                  <button className="unfriend-btn" onClick={(e) => handleUnfriend(friend, e)}>
                    Unfriend
                  </button>
                ) : sentRequestUserIds.includes(friend.id) ? (
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
