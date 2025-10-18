// socket.js
import { io } from "socket.io-client";

const SERVER = import.meta.env.MODE === "development" ? import.meta.env.VITE_DEV_SERVER || "http://localhost:3000" : import.meta.env.VITE_PROD_SERVER;

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

export const socket = io(`${SERVER}/api/v1/sockets`, {
  transports: ["websocket"],
  auth: { token, userId: user?.id },
  extraHeaders: {
    Authorization: `Bearer ${token}`,
  },
  autoConnect: false,
});

export const groupSocket = io(`${SERVER}/api/v1/sockets`, {
  transports: ['websocket', 'polling'], // Allow fallback to polling
  auth: { token, userId: user?.id },
  extraHeaders: { Authorization: `Bearer ${token}` },
  autoConnect: false,
  forceNew: true, // Force new connection
});

socket.onAny((event, ...args) => {
  console.log("[SOCKET EVENT]", event, args);
});

groupSocket.onAny((event, ...args) => {
  console.log("[GROUP SOCKET EVENT]", event, args);
});