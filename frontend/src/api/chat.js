import api from "./api";

export const getPrivateChatHistory = async (senderId, receiverId) => {
  const [sentRes, receivedRes] = await Promise.all([
    api.get(`private-chats`, { params: { sender_id: senderId, receiver_id: receiverId } }),
    api.get(`private-chats`, { params: { sender_id: receiverId, receiver_id: senderId } }),
  ]);

  const sentMsgs = sentRes.data;
  const receivedMsgs = receivedRes.data;

  return [...sentMsgs, ...receivedMsgs].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
};
