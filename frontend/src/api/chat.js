import api from "./api";

export const getPrivateChatHistory = async (senderId, receiverId) => {
  const res = await api.get(`private-chats`, { params: { sender_id: senderId, receiver_id: receiverId } });
  const json = res.data;

  if (!json.success) throw new Error("Failed to fetch chat history");

  return json.data.sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
};

