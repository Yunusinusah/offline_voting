// Shared datetime helpers for the frontend UI
// Provides robust parsing of backend datetimes and utilities for display and input values
export function parseDateTime(dt) {
  if (!dt) return null;
  if (dt instanceof Date) return dt;
  try {
    const s = String(dt).trim();
    const mysqlLike = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    const normalized = mysqlLike.test(s) ? s.replace(" ", "T") : s;
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}

export function formatDateTime(dt) {
  const d = parseDateTime(dt);
  if (!d) return "-";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Convert a backend datetime to a value acceptable for <input type="datetime-local" />
export function toInputDateTime(dt) {
  const d = parseDateTime(dt);
  if (!d) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const minute = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hour}:${minute}`;
}
