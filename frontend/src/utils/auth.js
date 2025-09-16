import api from "../utils/api";

const STORAGE_KEY = "ovs_auth";

function saveAuth({ token, role, user }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, role, user }));
  localStorage.setItem("election_token", token);
  localStorage.setItem("user", JSON.stringify(user || { role }));
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("election_token");
  localStorage.removeItem("user");
}

function getAuth() {
  const v = localStorage.getItem(STORAGE_KEY);
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

// Admin login -> backend POST /api/auth/admin/login
export async function loginAdmin({ email, password }) {
  if (!email || !password) throw new Error("email and password required");
  const res = await api.post("auth/admin/login", { email, password });
  // backend returns { token, role } or similar
  const token = res.data?.token || res.data?.access || null;
  const role = res.data?.role || "admin";
  const user = { email, role };
  if (!token) throw new Error("Invalid server response");
  saveAuth({ token, role, user });
  return { token, role, user };
}

// Voter verify -> backend POST /api/auth/voter/verify { student_id, code }
export async function verifyVoter({ student_id, code }) {
  if (!student_id || !code) throw new Error("student_id and code required");
  const res = await api.post("/auth/voter/verify", { student_id, code });
  // backend returns { token } on success
  const token = res.data?.token;
  if (!token) throw new Error("Invalid response from server");
  const role = "voter";
  const user = { voter_id: student_id, role };
  saveAuth({ token, role, user });
  return { token, role, user };
}

// Generate OTP (polling agent/admin): POST /api/auth/voter/generate
// Note: this endpoint requires caller to be authenticated as polling_agent or admin.
export async function generateVoterOTP({ student_id }) {
  if (!student_id) throw new Error("student_id required");
  const res = await api.post("/auth/voter/generate", { student_id });
  return res.data;
}

export function logout() {
  clearAuth();
  window.location.href = "/";
}

export function getCurrentUser() {
  return getAuth();
}

export function isAuthenticated() {
  return !!getAuth();
}

// Backwards-compatible helpers used across the frontend
export function setToken(token) {
  if (!token) return;
  const current = getAuth() || {};
  current.token = token;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  localStorage.setItem("election_token", token);
}

export function getToken() {
  return localStorage.getItem("election_token") || getAuth()?.token || null;
}

export function setUser(user) {
  if (!user) return;
  const current = getAuth() || {};
  current.user = user;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUser() {
  // try the AUTH store first, fallback to legacy user key
  return getAuth()?.user || (() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  })();
}

export default { loginAdmin, verifyVoter, generateVoterOTP, logout, getCurrentUser, isAuthenticated };
