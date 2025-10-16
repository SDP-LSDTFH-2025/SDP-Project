// src/api/auth.js
import api from "./api";

export const manualLogin = async (email, password) => {
  const res = await api.post("/auth/logIn", { email, password });
  const { data, token } = res.data;

  if (token) localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(data));
  const loginTime = Date.now();
  localStorage.setItem("studyLastTimestamp", loginTime);

  return data;
};

export const manualSignup = async (email, username, password) => {
  const res = await api.post("/auth/signIn", { email, username, password });
  const { data, token } = res.data;
  if (token) localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(data));
  const loginTime = Date.now();
  localStorage.setItem("studyLastTimestamp", loginTime);
  return data;
};

export const googleAuth = async (access_token) => {
  const res = await api.post("/auth/google/verify", { access_token });
  const { data, token } = res.data;
  if (token) localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(data));
  const loginTime = Date.now();
  localStorage.setItem("studyLastTimestamp", loginTime);
  return data;
};

export const registerInterests = async (payload) => {
  const res = await api.post("/users/register", payload);
  if (!res.data.success) {
    throw new Error(res.data.error || "Registration failed");
  }
  return res.data;
};
