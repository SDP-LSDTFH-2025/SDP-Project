import api from "./api";

export const respondToFriendRequest = async ({ token, id, requestID, response }) => {
  const res = await api.post("friends/request/response", {
    token,
    id,
    requestID,
    response,
  });
  return res.data;
};

export const sendFriendRequest = async ({ token, id, username }) => {
  const res = await api.post("friends/request", {
    token,
    id,
    username,
  });
  return res.data;
};

export const declineFriendRequest = async ({ token, id, requestID }) => {
  return respondToFriendRequest({ token, id, requestID, response: "decline" });
};
