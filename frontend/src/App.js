import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { api, setToken } from "./lib/api";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Clients from "./pages/Clients";
import Tickets from "./pages/Tickets";
import Finance from "./pages/Finance";
import WorkList from "./pages/WorkList";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import "./App.css";
import "./modern.css";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setToken(null);
      setUser(null);
    }
  };
  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="app-loading" data-testid="app-loading">
        <span className="loading-ring" />
        <p>Menyiapkan ruang kerja Anda...</p>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <Protected>
                <Layout />
              </Protected>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route
              path="clients"
              element={
                <Protected roles={["Admin", "Admin Project", "Accounting"]}>
                  <Clients />
                </Protected>
              }
            />
            <Route
              path="tickets"
              element={
                <Protected
                  roles={["Admin", "Admin Project", "Developer", "Client"]}
                >
                  <Tickets />
                </Protected>
              }
            />
            <Route
              path="finance"
              element={
                <Protected roles={["Admin", "Accounting"]}>
                  <Finance />
                </Protected>
              }
            />
            <Route
              path="revisions"
              element={
                <Protected roles={["Admin", "Admin Project", "Developer"]}>
                  <WorkList kind="revisions" />
                </Protected>
              }
            />
            <Route
              path="maintenance"
              element={
                <Protected roles={["Admin", "Admin Project", "Developer"]}>
                  <WorkList kind="maintenances" />
                </Protected>
              }
            />
            <Route
              path="users"
              element={
                <Protected roles={["Admin"]}>
                  <Users />
                </Protected>
              }
            />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
