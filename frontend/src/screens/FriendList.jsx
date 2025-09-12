import React, { useEffect, useState } from "react";
import { Check, X, UserPlus } from "lucide-react";
import "./FriendList.css";

const FriendList = ({ handleNavigationClick, setSelectedUser }) => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const SERVER =
          import.meta.env.VITE_PROD_SERVER ||
          import.meta.env.VITE_DEV_SERVER ||
          "http://localhost:3000";

        const res = await fetch(`${SERVER}/api/v1/users`);
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const allUsers = json.data;

          // demo split
          setFriendRequests(allUsers.slice(0, 2));
          setSuggestedFriends(allUsers.slice(2));
        } else {
          console.error("Invalid API response format", json);
        }
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };

    fetchUsers();
  }, []);

  // --- Action handlers ---
  const handleAccept = (user, e) => {
    e.stopPropagation();
    console.log("✅ Accepted:", user.username);
  };

  const handleDecline = (user, e) => {
    e.stopPropagation();
    console.log("❌ Declined:", user.username);
  };

  const handleAddFriend = (user, e) => {
    e.stopPropagation();
    console.log("➕ Sent friend request to:", user.username);
  };

  // --- Click on card should also navigate ---
  const handleCardClick = (user) => {
    setSelectedUser(user);
    handleNavigationClick("usersprof"); // ✅ navigate to profile
  };

  return (
    <div className="friend-list-container">
      {/* Friend Requests */}
      <div className="friend-card">
        <div className="card-header">
          <UserPlus className="card-header-icon" size={18} />
          <h2>Friend Requests</h2>
          <span className="request-count">{friendRequests.length}</span>
        </div>

        <div>
          {friendRequests.length === 0 ? (
            <p>No friend requests right now.</p>
          ) : (
            friendRequests.map((request) => (
              <div
                key={request.id}
                className="request-item clickable"
                onClick={() => handleCardClick(request)}
              >
                <div className="request-info">
                  <div className="avatar">
                    {request.username
                      ?.split("_")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="request-details">
                    <h3 className="request-name">
                      {request.username?.replaceAll("_", " ")}
                    </h3>
                    <p className="request-meta">
                      {request.institution || "Unknown"} • {request.course || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="request-actions">
                  <button
                    className="accept-btn"
                    onClick={(e) => handleAccept(request, e)}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    className="decline-btn"
                    onClick={(e) => handleDecline(request, e)}
                  >
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

        <div>
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
                <button
                  className="add-friend-btn"
                  onClick={(e) => handleAddFriend(friend, e)}
                >
                  Add Friend
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendList;
