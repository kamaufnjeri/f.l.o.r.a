import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true, // IMPORTANT for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;