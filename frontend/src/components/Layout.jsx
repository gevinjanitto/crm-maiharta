import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  UsersRound,
  Wallet,
  RotateCcw,
  Wrench,
  Ticket,
  ShieldCheck,
  Settings,
  LogOut,
  Search,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  ArrowUpRight,
  X,
} from "lucide-react";
import { useAuth } from "../App";
import { Footer } from "./Common";
import { initials } from "../lib/api";
const nav = [
  ["/", "Dashboard", LayoutDashboard],
  ["/projects", "Semua Project", FolderKanban],
  ["/clients", "Client", UsersRound, ["Admin", "Admin Project", "Accounting"]],
  ["/finance", "Keuangan", Wallet, ["Admin", "Accounting"]],
  ["/revisions", "Revisi", RotateCcw, ["Admin", "Admin Project", "Developer"]],
  [
    "/maintenance",
    "Maintenance",
    Wrench,
    ["Admin", "Admin Project", "Developer"],
  ],
  [
    "/tickets",
    "Tiket Client",
    Ticket,
    ["Admin", "Admin Project", "Developer", "Client"],
  ],
];
export default function Layout() {
  const { user, logout } = useAuth(),
    location = useLocation(),
    navigate = useNavigate();
  const [open, setOpen] = useState(false),
    [search, setSearch] = useState(""),
    [light, setLight] = useState(
      localStorage.getItem("maiharta-theme") === "light",
    );
  useEffect(() => {
    document.documentElement.classList.toggle("light-mode", light);
    localStorage.setItem("maiharta-theme", light ? "light" : "dark");
    return () => document.documentElement.classList.remove("light-mode");
  }, [light]);
  useEffect(() => setOpen(false), [location.pathname]);
  const title =
    nav.find((n) => n[0] === location.pathname)?.[1] ||
    (location.pathname.startsWith("/projects/")
      ? "Detail Project"
      : location.pathname === "/users"
        ? "Manajemen User"
        : "Pengaturan");
  return (
    <div className="app-shell">
      {open && (
        <button
          className="sidebar-backdrop"
          data-testid="sidebar-backdrop"
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <NavLink
          to="/"
          className="sidebar-brand"
          data-testid="sidebar-logo-link"
        >
          <img
            src="/assets/logo.webp"
            alt="MaiHarta"
            data-testid="sidebar-logo"
          />
          <span>PROJECT WORKSPACE</span>
        </NavLink>
        <div className="workspace-switch" data-testid="workspace-info">
          <span className="workspace-icon">M</span>
          <div>
            <b>MaiHarta Workspace</b>
            <small>
              <span className="live-dot" /> Tim MaiHarta
            </small>
          </div>
          <ChevronDown size={14} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {nav
            .filter((n) => !n[3] || n[3].includes(user.role))
            .map(([path, label, Icon]) => (
              <NavLink
                end={path === "/"}
                key={path}
                to={path}
                data-testid={`nav-${path === "/" ? "dashboard" : path.slice(1)}`}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
                {path === "/" && <span className="nav-active-dot" />}
              </NavLink>
            ))}
        </nav>
        <div className="sidebar-lower">
          <div className="nav-label">PREFERENSI</div>
          {user.role === "Admin" && (
            <NavLink className="nav-item" to="/users" data-testid="nav-users">
              <ShieldCheck size={18} />
              Manajemen User
            </NavLink>
          )}
          <NavLink
            className="nav-item"
            to="/settings"
            data-testid="nav-settings"
          >
            <Settings size={18} />
            Pengaturan
          </NavLink>
          <div className="sidebar-note" data-testid="sidebar-brand-note">
            <span>MAKE GOOD THINGS HAPPEN.</span>
            <p>
              Bersama, melangkah
              <br />
              lebih jauh.
            </p>
            <ArrowUpRight size={22} />
          </div>
          <button
            className="sidebar-profile"
            data-testid="logout-button"
            onClick={logout}
            title="Keluar"
          >
            <span className="avatar">{initials(user.name)}</span>
            <span className="profile-copy">
              <b>{user.name}</b>
              <small>{user.role}</small>
            </span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              data-testid="open-menu"
              onClick={() => setOpen(true)}
              title="Buka menu"
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <span className="crumb-divider">/</span>
            <b data-testid="breadcrumb-current">{title}</b>
          </div>
          <div className="topbar-actions">
            <form
              className="global-search"
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/projects?q=${encodeURIComponent(search)}`);
              }}
            >
              <Search size={16} />
              <input
                data-testid="global-search"
                placeholder="Cari project..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span>↵</span>
            </form>
            <button
              data-testid="toggle-theme"
              className="icon-button"
              onClick={() => setLight(!light)}
              title={light ? "Mode gelap" : "Mode terang"}
            >
              {light ? <Moon size={19} /> : <Sun size={19} />}
            </button>
            <span className="topbar-separator" />
            <button
              className="topbar-profile"
              data-testid="topbar-profile"
              onClick={() => navigate("/settings")}
            >
              <span className="avatar small">{initials(user.name)}</span>
              <span>{user.name.split(" ")[0]}</span>
              <ChevronDown size={13} />
            </button>
          </div>
        </header>
        <main className="page-content" key={location.pathname}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
