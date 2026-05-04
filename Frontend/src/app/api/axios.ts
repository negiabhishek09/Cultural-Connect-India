import axios from "axios";

// ✅ FIX: Render pe VITE_API_URL env variable se URL aayega
// Local mein automatically localhost use karega
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});