// src/api/groups.js
import api from "./api";

// Helper function to get current user data
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

const token = localStorage.getItem("token");
/*
 * All groups
 */
export const getGroups = async () => {
  try {
    const res = await api.get("study_groups");
    const user = getCurrentUser(); // Get user data dynamically

    const data = res.data; 
    console.log("res.data:", res.data);
    if (!data?.groups) {
      console.error(data);
      throw new Error(data.message || "Failed to fetch groups");
    }

    return data.groups.map((g) => {
      const participants = Array.isArray(g.participants) ? g.participants : [];
      // Ensure both IDs are strings for comparison to avoid type mismatch issues
      const currentUserId = String(user?.id || '');
      const isJoined = participants.some((p) => String(p.id) === currentUserId);
      
      return {
        id: g.id,
        title: g.name,
        description: g.description,
        subject: g.course_code,
        date: g.created_at,
        organizer: g.creator_name,
        participants: participants.length,
        joined: isJoined,
        Participants: participants.map((p) => ({ id: p.id, username: p.username })),
      };
    });
  } catch (err) {
    console.error("getGroups error:", err);
    throw err;
  }
};

/*
 * Join a group
 */
export const joinGroup = async (token, creatorId, groupID) => {
  try {
    const payload = {
      token,
      id: creatorId,
      groupID,
    };

    const { data } = await api.post("study_groups/join", payload);

    // Check if the response contains an error (backend returns {response: "error message"} for errors)
    if (data.response) {
      throw new Error(data.response);
    }

    // If we get here, the join was successful (backend returns {message: "Successfully joined the group"})
    return data;
  } catch (err) {
    console.error("joinGroup error:", err);
    
    // Handle AxiosError with status codes
    if (err.response) {
      const errorMessage = err.response.data?.response || err.response.data?.message || `Request failed with status ${err.response.status}`;
      throw new Error(errorMessage);
    }
    
    // Handle network errors or other issues
    throw err;
  }
};

/*
 * Leave a group
 */
export const leaveGroup = async (token, creatorId, groupID) => {
  try {
    const payload = {
      token,
      id: creatorId,
      groupID,
    };

    const { data } = await api.post("study_groups/leave", payload);

    // Check if the response contains an error (backend returns {response: "error message"} for errors)
    if (data.response) {
      throw new Error(data.response);
    }

    // If we get here, the leave was successful (backend returns {message: "Successfully left the group"})
    return data;
  } catch (err) {
    console.error("leaveGroup error:", err);
    
    // Handle AxiosError with status codes
    if (err.response) {
      const errorMessage = err.response.data?.response || err.response.data?.message || `Request failed with status ${err.response.status}`;
      throw new Error(errorMessage);
    }
    
    // Handle network errors or other issues
    throw err;
  }
};

/*
 * Create a group
 */
export const createGroup = async (token, creatorId, { title, courseCode, description }) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const payload = {
      token,
      id: creatorId,
      title,
      course_code: courseCode,
      description,
      participants: [creatorId],
    };

    const { data } = await api.post("study_groups/create", payload);

    // Check if the response contains an error (backend returns {response: "error message"} for errors)
    if (data.response) {
      throw new Error(data.response);
    }

    return {
      ...data,
      group: {
        id: data.id || Date.now(),
        title,
        description,
        subject: courseCode,
        date: today,
        participants: 1,
        organizer: "You",
        joined: true,
      },
    };
  } catch (err) {
    console.error("createGroup error:", err);
    
    // Handle AxiosError with status codes
    if (err.response) {
      const errorMessage = err.response.data?.response || err.response.data?.message || `Request failed with status ${err.response.status}`;
      throw new Error(errorMessage);
    }
    
    // Handle network errors or other issues
    throw err;
  }
};

/*
 * Upcoming Sessions
*/
export const getUpcomingSessions = async (userId) => {
  const res = await api.get("planit/events", {
    headers: {
      "user_id": userId,
    },
  });

  if (!res.data.success) {
    console.error("Failed to fetch sessions:", res.data.message);
    throw new Error(res.data.message || "Failed to fetch sessions");
  }

  return {
    events: res.data.data.events || [],
    guests: res.data.data.guests || [],
  };
};

/*
 * Join a session
*/
export const joinSession = async ({ userId, eventId }) => {
  const res = await api.post(`planit/guests/event/${userId}`, {
    eventId,
  });
  return res.data;
};

/*
 * Create a new session
*/
export const createSession = async ({ userId, payload }) => {
  const res = await api.post("planit/events", payload, {
    headers: {
      "user_id": userId, 
    },
  });
  return res.data;
};