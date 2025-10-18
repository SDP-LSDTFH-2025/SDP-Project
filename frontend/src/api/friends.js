import api from "./api";

// Helper functions to get current auth data
const getToken = () => localStorage.getItem("token");
const getUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const respondToFriendRequest = async ({ requestID, response }) => {
  const token = getToken();
  const user = getUser();
  
  if (!token || !user) {
    throw new Error("User not authenticated");
  }
  
  const res = await api.post("friends/request/response", {
    requestID,
    response,
  });
  return res.data;
};

export const sendFriendRequest = async ({ username }) => {
  const token = getToken();
  const user = getUser();
  
  console.log("Sending friend request:", { token: !!token, userId: user?.id, username });
  
  if (!token || !user) {
    throw new Error("User not authenticated");
  }
  
  const res = await api.post("friends/request", {
    username,
  });
  return res.data;
};

export const declineFriendRequest = async ({ requestID }) => {
  return respondToFriendRequest({ requestID, response: "decline" });
};

// Get sent friend requests
export const getSentFriendRequests = async () => {
  const token = getToken();
  const user = getUser();
  
  if (!token || !user) {
    throw new Error("User not authenticated");
  }
  
  const res = await api.post("friends/request/sent", {});
  console.log("Sent requests response:", res.data);
  return res.data;
};

// Unfriend a user
export const unfriendUser = async ({ friend_id }) => {
  const token = getToken();
  const user = getUser();
  
  if (!token || !user) {
    throw new Error("User not authenticated");
  }
  
  const res = await api.delete("friends/unfriend", {
    data: { friend_id }
  });
  return res.data;
};

// Check if two users are friends
export const checkFriendship = async ({ friend_id }) => {
  const token = getToken();
  const user = getUser();
  
  if (!token || !user) {
    throw new Error("User not authenticated");
  }
  
  const res = await api.get("friends/check", {
    params: { 
      user_id: user.id, 
      friend_id 
    }
  });
  return res.data;
};