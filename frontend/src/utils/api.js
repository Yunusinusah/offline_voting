import axios from "axios";
import { toast } from "react-toastify";
import { logout } from "../utils/auth";
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

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
  () => Promise.reject()
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.non_field_errors ||
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      "An error occurred";

    const url = error.config?.url || "";

    const isAuthRoute =
      url.includes("auth/admin/login") ||
      url.includes("auth/voter/verify") ||
      url.includes("auth/voter/generate");
    // 🛑 Handle 401 Unauthorized globally
    if (status === 401 && !isAuthRoute) {
      logout();
      toast.error("Session expired. Please log in again.");
      return
    }

    if (isAuthRoute) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);


export default api;

export function getBackendOrigin() {
  if (!API_BASE_URL) return "";
  try {
    const url = new URL(API_BASE_URL, window.location.origin);
    let pathname = url.pathname.replace(/\/+/g, "/");
    if (pathname.endsWith("/api")) pathname = pathname.slice(0, -4) || "/";
    const origin = `${url.protocol}//${url.host}`;
    return origin + (pathname === "/" ? "" : pathname);
  } catch {
    let v = API_BASE_URL.replace(/\/+$/, "");
    if (v.endsWith("/api")) v = v.slice(0, -4);
    return v;
  }
}

export function getUploadUrl(uploadPath) {
  if (!uploadPath) return "";
  try {
    const maybeAbs = new URL(uploadPath, window.location.origin);
    if (maybeAbs.protocol && maybeAbs.host && !uploadPath.startsWith("/")) {
      return uploadPath;
    }
  } catch {
    // ignore
  }

  const origin = getBackendOrigin() || "";

  // If uploadPath already starts with a leading slash, just concat to origin
  if (uploadPath.startsWith("/")) return `${origin}${uploadPath}`;

  // Otherwise ensure slash between origin and path
  return `${origin}/${uploadPath}`;
}
