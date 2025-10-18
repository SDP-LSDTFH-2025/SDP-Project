import api from "./api";
/*
*GET PRIVATE CHATS
*/
export const getPrivateChatHistory = async (senderId, receiverId) => {
  const res = await api.get(`private-chats`, { params: { sender_id: senderId, receiver_id: receiverId } });
  const json = res.data;

  if (!json.success) throw new Error("Failed to fetch chat history");

  return json.data.sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
};

/*
*GET LAST MESSAGE FOR EACH FRIEND
*/
export const getLastMessages = async (userId) => {
  try {
    const response = await api.get(`private-chats/last-messages`, {
      params: { user_id: userId },
    });

    return response.data.data || [];
  } catch (err) {
    console.error("Failed to fetch last messages:", err);
    return [];
  }
};

/*
*GET GROUP CHATS
*/
export const getGroupChatHistory = async (groupId) => {
  try {
    const response = await api.get(`group-chats`, {
      params: { groupId },
    });

    return response.data.data || [];
  } catch (err) {
    console.error("Failed to fetch group chat history:", err);
    throw err;
  }
};

/*
*SEND GROUP CHAT MESSAGE
*/
export const sendGroupMessage = async (groupId, message) => {
  try {
    const response = await api.post(`group-chats`, {
      groupId,
      message,
    });

    return response.data;
  } catch (err) {
    console.error("Failed to send group message:", err);
    throw err;
  }
};

