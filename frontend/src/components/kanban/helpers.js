export const PRIORITIES = ["Mendesak", "Tinggi", "Sedang", "Rendah"];
export const PRIORITY_COLOR = {
  Mendesak: "#e5484d",
  Tinggi: "#f5a623",
  Sedang: "#4f8ef7",
  Rendah: "#9aa4b8",
};
export const SOURCE_LABEL = {
  manual: "Manual",
  feature: "Fitur",
  revision: "Revisi",
  maintenance: "Maintenance",
  ticket: "Tiket",
};
export const STATUS_COLORS = [
  "#87909e",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#0ea5e9",
];
export const isManager = (u) => ["Admin", "Admin Project"].includes(u.role);
export const canEditTask = (u, t) =>
  isManager(u) ||
  (u.role === "Developer" && ["", u.id].includes(t.assigned_to || ""));
export const kindOf = (statuses, name) =>
  (statuses || []).find((s) => s.name === name)?.kind || "active";
export const colorOf = (statuses, name) =>
  (statuses || []).find((s) => s.name === name)?.color || "#87909e";
export const isDone = (statuses, t) => kindOf(statuses, t.status) === "done";
export const isOverdue = (statuses, t) =>
  t.due_date &&
  !isDone(statuses, t) &&
  t.due_date < new Date().toISOString().slice(0, 10);
export const fmtDuration = (s) => {
  s = Math.max(0, Math.round(s || 0));
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    sec = s % 60;
  if (h) return `${h}j ${m}m`;
  if (m) return `${m}m ${sec}d`;
  return `${sec}d`;
};
export const midOrder = (before, after) => {
  if (before && after) return (before.order + after.order) / 2;
  if (before) return before.order + 1;
  if (after) return after.order - 1;
  return 1;
};
export const byOrder = (a, b) => (a.order || 0) - (b.order || 0);
export const shortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    : "";
