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

  if (!res.data.status === 200) {
    console.error("Failed to fetch sessions:", res.data.error);
    throw new Error(res.data.error || "Failed to fetch sessions");
  }

  return res.data.data;
};

/*
 * Join a session
*/
export const joinSession = async ({ userId, eventId, userData }) => {
  // Get user data from localStorage if not provided
  const user = userData || JSON.parse(localStorage.getItem("user") || "{}");
  
  console.log('User data for guest creation:', user);
  
  const guestData = {
    name: (user.username && user.username !== 'undefined') ? user.username : 
          (user.name && user.name !== 'undefined') ? user.name : 
          "Guest User",
    email: (user.email && user.email !== 'undefined') ? user.email : "guest@example.com",
    phone: (user.phone && user.phone !== 'undefined') ? user.phone : "",
    rsvpStatus: "Pending",
    dietaryPreferences: ""
  };
  
  console.log('Guest data being sent:', guestData);
  
  try {
    // Use the new EventGuest API for consistency
    const { addGuest } = await import('./EventGuest.js');
    const guest = await addGuest(eventId, guestData);
    
    console.log("joinSession response:", guest);
    return { success: true, data: guest };
  } catch (err) {
    console.error("joinSession error:", err);
    throw new Error(err.message || "Failed to join session");
  }
};

/*
 * Create a new session
*/
export const createSession = async ({ userId, payload }) => {
  try {
  const res = await api.post("planit/events", payload, {
    headers: {
      "user_id": userId, 
    },
  });
  console.log("createSession response:", res.data);
  // The backend returns the data directly, not wrapped in a status object
  if (res.status === 201) {
    return { success: true, data: res.data };
  } else {
    throw new Error(res.data?.error || "Failed to create session");
    }
  } catch (err) {
    console.error("createSession error:", err);
    throw new Error(err.response?.data?.error || "Failed to create session");
  }
};

/*
 * Delete a session/event
*/
export const deleteSession = async ({ userId, eventId }) => {
  try {
    const res = await api.delete(`planit/events/${eventId}`, {
      headers: {
        "user_id": userId,
      },
    });
    console.log("deleteSession response:", res.data);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("deleteSession error:", err);
    throw new Error(err.response?.data?.error || "Failed to delete session");
  }
};

/*
 * Get study sessions for calendar
*/
export const getStudySessions = async (userId) => {
  try {
    const res = await api.get("planit/study-sessions", {
      headers: {
        "user_id": userId,
      },
    });
    
    if (res.data.success) {
      return res.data;
    } else {
      throw new Error(res.data.error || "Failed to fetch study sessions");
    }
  } catch (err) {
    console.error("getStudySessions error:", err);
    // Return empty sessions instead of throwing to prevent UI crash
    return {
      success: true,
      sessions: []
    };
  }
};