// Formatting helpers. Time-of-day helpers are bound to the demo profile's
// timezone via createFormat(), so a Dubai demo shows Dubai times.

export function timeAgo(iso: string) {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function formatDue(iso: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const due = new Date(iso);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - startOfToday.getTime()) / 86_400_000);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export function createFormat(timeZone: string) {
  return {
    formatDate: (iso: string) =>
      new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone }),
    formatTime: (iso: string) =>
      new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }),
    formatLongDate: (d: Date) =>
      d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone }),
    hourOfDay: (d: Date) => Number(d.toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone })),
    isoDate: (d: Date) => d.toLocaleDateString("en-CA", { timeZone }), // YYYY-MM-DD
  };
}

export const pct = (n: number) => `${Math.round(n * 100)}%`;

export const titleCase = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
