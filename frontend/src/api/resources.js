// src/api/resources.js
import api from "./api";

// Get all users once and cache
export const getAllUsers = async () => {
  const res = await api.get("users");
  const json = res.data;

  if (!json.success) throw new Error("Failed to fetch users");
  return json.data;
};

// Get all resources and enrich with user data
export const getAllResources = async () => {
  const res = await api.get("resources/all");
  const json = res.data;

  if (!json.success) throw new Error("Failed to fetch resources");

  const users = await getAllUsers(); // fetch all users once

  const enrichedResources = json.data.map((resource) => {
    const user = users.find((u) => u.id === resource.user_id);

    if (user) {
      const username = user.username;
      const initials = username
        .split("_")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      return {
        ...resource,
        user_name: username,
        initials,
      };
    }

    return {
      ...resource,
      user_name: `User ${resource.user_id.slice(0, 4)}`,
      initials: resource.user_id.slice(0, 2).toUpperCase(),
    };
  });

  return enrichedResources;
};

// Get all friends for current user
export const getAllFriends = async () => {
  const token = JSON.parse(localStorage.getItem("user"));
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user?.id) throw new Error("User not logged in");

  const res = await api.post("friends", {
    token,
    id: user.id,
  });

  const json = res.data;

  if (!json.success || !Array.isArray(json.followers))
    throw new Error("Failed to fetch friends");

  return json.followers;
};

// Get pending friend requests
export const getPendingFriendRequests = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user?.id) throw new Error("User not logged in");

  const res = await api.post("friends/request/pending/users", {
    token: user,
    id: user.id,
  });

  const json = res.data;
  if (!json.success || !Array.isArray(json.followers)) {
    throw new Error("Failed to fetch friend requests");
  }
  return json.followers;
};

// Get comments for a file
export const getResourceComments = async (fileId) => {
  const res = await api.get(`resource_threads?resource_id=${fileId}`);
  return res.data;
};

//  Check if current user liked file
export const checkLike = async (fileId, userId) => {
  const res = await api.get(`likes/check/${fileId}`, {
    params: { user_id: userId },
  });
  return res.data;
};

//Toggle like/unlike
export const toggleLike = async (fileId, userId, liked) => {
  if (liked) {
    const res = await api.delete(`likes/${fileId}`, {
      data: { user_id: userId }, // keep body since backend wants it
    });
    return res.data;
  } else {
    const res = await api.post(`likes/${fileId}`, { user_id: userId });
    return res.data;
  }
};

//  Add comment
export const addResourceComment = async ({ userId, fileId, message }) => {
  const res = await api.post("resource_threads", {
    user_id: userId,
    resource_id: fileId,
    message,
    parent_id: 0,
  });
  return res.data;
};