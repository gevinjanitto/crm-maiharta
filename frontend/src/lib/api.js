import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
const TOKEN_KEY = "maiharta_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
export const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
  withCredentials: true,
});
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
export const errorText = (e) => {
  const detail = e.response?.data?.detail;
  return typeof detail === "string"
    ? detail
    : Array.isArray(detail)
      ? detail.map((x) => `${x.loc?.slice(-1)[0]}: ${x.msg}`).join(", ")
      : "Terjadi kesalahan. Silakan coba kembali.";
};
export function useData(path) {
  const [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const reload = useCallback(async () => {
    try {
      const r = await api.get(path);
      setData(r.data);
      setError("");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);
  return { data, loading, error, reload, setData };
}
export const money = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
export const compact = (n) =>
  n >= 1e9
    ? `${+(n / 1e9).toFixed(2)} M`
    : n >= 1e6
      ? `${+(n / 1e6).toFixed(1)} jt`
      : new Intl.NumberFormat("id-ID").format(n || 0);
export const dateLabel = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
export const initials = (s) =>
  (s || "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
export async function download(path, name) {
  try {
    const r = await api.get(path, { responseType: "blob" });
    const u = URL.createObjectURL(r.data);
    const a = document.createElement("a");
    a.href = u;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  } catch (e) {
    toast.error("Dokumen tidak dapat diunduh.");
  }
}
export const statuses = [
  "Project Masuk",
  "Dokumen Disiapkan",
  "Scope Dirinci",
  "UI/UX",
  "Disetujui",
  "Development",
  "Uploaded to Dev Server",
  "Testing",
  "Revisi",
  "Uploaded to Production",
  "Selesai",
];
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
export const taskStatuses = [
  "Belum Mulai",
  "Dikerjakan",
  "Testing",
  "Revisi",
  "Selesai",
];
export const serverStages = ["Belum Naik", "Dev Server", "Production"];
export const slug = (s) => String(s).toLowerCase().replace(/\s+/g, "-");
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
export const ticketStatuses = [
  "Baru",
  "Ditinjau",
  "Menunggu Klarifikasi",
  "Diterima",
  "Ditolak",
  "Menunggu Estimasi Biaya",
  "Menunggu Persetujuan",
  "Dikerjakan",
  "Selesai",
  "Ditutup",
];
