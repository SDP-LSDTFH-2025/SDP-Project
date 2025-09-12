import React, { useEffect, useState } from "react";
import { Check, X, UserPlus } from "lucide-react";
import "./FriendList.css";

const FriendList = ({ handleNavigationClick, setSelectedUser }) => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState([]);

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

  const handleAddFriend = async (receiver, e) => {
    e.stopPropagation();
    try {
      setLoadingRequests((prev) => [...prev, receiver.id]);
      const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER || "http://localhost:3000";

      const sender = JSON.parse(localStorage.getItem("user"));
      const tokenS = JSON.parse(localStorage.getItem("user"));

      const res = await fetch(`${SERVER}/api/v1/friends/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token : tokenS,
          id: sender.id,
          username: receiver.username,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSentRequests((prev) => [...prev, receiver.id]);
      } else {
        console.error("Failed to send request:", json.message);
      }
    } catch (err) {
      console.error("Error sending friend request", err);
    } finally {
      setLoadingRequests((prev) => prev.filter((id) => id !== receiver.id)); // stop loading
    }
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
                {sentRequests.includes(friend.id) ? (
                  <button className="sent-btn" disabled>
                    Sent
                  </button>
                ) : loadingRequests.includes(friend.id) ? (
                  <button className="sent-btn" disabled>
                    Sending...
                  </button>
                ) : (
                  <button
                    className="add-friend-btn"
                    onClick={(e) => handleAddFriend(friend, e)}
                  >
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
