import api from "./api";

export const getNotifications = async (userId) => {
  const res = await api.get("notifications/user", {
    params: { user_id: userId },
  });
  return res.data;
};

export const markAllNotificationsAsRead = async (userId) => {
  const res = await api.put("notifications/mark-all-as-read", { user_id: userId });
  return res.data;
};