// src/api/api.js
import axios from "axios";

const SERVER = import.meta.env.MODE === "development" ? import.meta.env.VITE_DEV_SERVER || "http://localhost:3000" : import.meta.env.VITE_PROD_SERVER;

const api = axios.create({
  baseURL: `${SERVER}/api/v1/`, 
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Global error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error("API Error:", error.response || error);
    return Promise.reject(error);
  }
);

export default api;
