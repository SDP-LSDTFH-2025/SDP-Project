import api from "./api";

// Get full user progress
export const getProgress = async (userId) => {
  const res = await api.get(`track/${userId}`);
  return res.data;
};

// Log study hours
export const logStudyHours = async (userId, hours) => {
  const res = await api.post("track/study-log", { userId, hours });
  return res.data;
};

// Add a new topic
export const addTopic = async (userId, course, title) => {
  const res = await api.post("track/topic", { userId, course, title });
  return res.data;
};

// Toggle topic completion
export const toggleTopic = async (topicId) => {
  const res = await api.post("track/topic/toggle", { topicId });
  return res.data;
};
