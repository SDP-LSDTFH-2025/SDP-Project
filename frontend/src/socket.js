import { io } from "socket.io-client";

const SERVER = import.meta.env.VITE_PROD_SERVER || "http://localhost:3000";
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

export const socket = io(`${SERVER}/v1`, {
  transports: ["websocket"],
  auth: {
    token,
    userId: user?.id, 
  },
  extraHeaders: {
    Authorization: `Bearer ${token}`,
  },
  autoConnect: false,
});
