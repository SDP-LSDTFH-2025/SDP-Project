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

socket.onAny((event, ...args) => {
  console.log("[SOCKET EVENT]", event, args);
});
