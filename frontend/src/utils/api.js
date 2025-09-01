import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL ||  "";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request: attach Bearer token (backend middleware expects "Bearer <token>")
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("election_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: centralized user-friendly messages + session expiry handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.non_field_errors ||
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "An error occurred";

    const url = error.config?.url || "";

    const isAuthRoute = url.includes("/api/auth/admin/login") || url.includes("/api/auth/voter/verify") || url.includes("/api/auth/voter/generate");

    if (!isAuthRoute) {
      // if (error.response?.status === 401) {
      //   localStorage.removeItem("election_token");
      //   localStorage.removeItem("user");
      //   // send to root (default voter login) by default
      //   window.location.href = "/";
      //   toast.error("Session expired. Please login again.");
      // // } else if (error.response?.status === 403) {
      // //   toast.error("Access forbidden. You do not have permission.");
      // // } else if (error.response?.status === 404) {
      // //   toast.error("Resource not found.");
      // // } else if (error.response?.status >= 500) {
      // //   toast.error("Server error. Please try again later.");
      // } else {
      //   toast.error(message);
      // }
    } else {
      // for auth routes show the specific error
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
