import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatRating(r: number) {
  return r.toFixed(1);
}

/** Clamp to 1–4 $ symbols; returns empty string for unknown/invalid levels. */
export function formatPrice(level: number | undefined | null) {
  const n = Number(level);
  if (!Number.isFinite(n)) return "";
  const clamped = Math.min(4, Math.max(1, Math.round(n)));
  return "$".repeat(clamped);
}

/** US-friendly distance label from meters. */
export function formatDistance(meters: number) {
  const miles = meters / 1609.34;
  if (miles < 0.1) return "< 0.1 mi";
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatRelative(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(d);
}

export function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
