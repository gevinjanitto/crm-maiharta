import React, { createContext, useContext, useEffect, useState } from "react";
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import { api, setToken } from "./lib/api";
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { api } from "./lib/api";
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
import Trash from "./pages/Trash";
import Audit from "./pages/Audit";
import "./App.css";
import "./modern.css";
import "./kanban.css";
<<<<<<< HEAD
=======
=======
import "./App.css";
<<<<<<< HEAD
import "./modern.css";
import "./kanban.css";
import Kanban from "./pages/Kanban";
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2

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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
    try {
      await api.post("/auth/logout");
    } finally {
      setToken(null);
      setUser(null);
    }
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
    await api.post("/auth/logout");
    setUser(null);
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
  };
  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
function Protected({ children, roles }) {
  const { user, loading } = useAuth();
<<<<<<< HEAD
  const location = useLocation();
=======
<<<<<<< HEAD
  const location = useLocation();
=======
<<<<<<< HEAD
  const location = useLocation();
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
  if (loading)
    return (
      <div className="app-loading" data-testid="app-loading">
        <span className="loading-ring" />
        <p>Menyiapkan ruang kerja Anda...</p>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
<<<<<<< HEAD
  if (user.must_change_password && location.pathname !== "/settings")
    return <Navigate to="/settings" replace />;
=======
<<<<<<< HEAD
  if (user.must_change_password && location.pathname !== "/settings")
    return <Navigate to="/settings" replace />;
=======
<<<<<<< HEAD
  if (user.must_change_password && location.pathname !== "/settings")
    return <Navigate to="/settings" replace />;
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
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
<<<<<<< HEAD
            <Route path="kanban" element={<Navigate to="/projects" replace />} />
            <Route
=======
<<<<<<< HEAD
            <Route path="kanban" element={<Navigate to="/projects" replace />} />
            <Route
=======
            <Route
<<<<<<< HEAD
              path="kanban"
              element={
                <Protected
                  roles={["Admin", "Admin Project", "Developer", "Client"]}
                >
                  <Kanban />
                </Protected>
              }
            />
            <Route
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
            <Route
              path="trash"
              element={
                <Protected roles={["Admin", "Admin Project"]}>
                  <Trash />
                </Protected>
              }
            />
            <Route
              path="audit"
              element={
                <Protected roles={["Admin"]}>
                  <Audit />
                </Protected>
              }
            />
<<<<<<< HEAD
=======
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
