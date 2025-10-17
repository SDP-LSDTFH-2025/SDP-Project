// groupSocketHelpers.js
import { socket } from "./socket";

const joinedGroups = new Set();
const typingTimeouts = {};

// Connect socket safely with latest token/user
export function connectSocketSafe() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  socket.auth = { token, userId: user?.id };
  socket.extraHeaders = { Authorization: `Bearer ${token}` };

  if (!socket.connected) socket.connect();
}

// Safe emit wrapper
export function emitSafe(event, payload, ack) {
  if (!socket.connected) connectSocketSafe();
  socket.emit(event, payload, ack);
}

// Join group safely
export function joinGroup(groupId) {
  if (joinedGroups.has(groupId)) return; // already joined
  emitSafe("group:join", { groupId }, (ack) => {
    if (!ack.ok) console.error("Failed to join group:", ack.error);
    else joinedGroups.add(groupId);
  });
}

// Leave group safely
export function leaveGroup(groupId) {
  if (!joinedGroups.has(groupId)) return;
  emitSafe("group:leave", { groupId });
  joinedGroups.delete(groupId);
}

// Send typing with debounce
export function sendTyping(groupId, isTyping) {
  if (typingTimeouts[groupId]) clearTimeout(typingTimeouts[groupId]);

  emitSafe("group:typing", { groupId, isTyping });

  if (isTyping) {
    typingTimeouts[groupId] = setTimeout(() => {
      emitSafe("group:typing", { groupId, isTyping: false });
    }, 1500);
  }
}
