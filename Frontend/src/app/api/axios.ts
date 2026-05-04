import axios from "axios";


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