import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
  KanbanSquare,
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
  UsersRound,
  Wallet,
  RotateCcw,
  Wrench,
  Ticket,
  ShieldCheck,
  Settings,
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
  Trash2,
  ScrollText,
  LogOut,
  Search,
<<<<<<< HEAD
  Menu,
  ChevronDown,
=======
<<<<<<< HEAD
  Menu,
  ChevronDown,
=======
=======
  LogOut,
  Search,
<<<<<<< HEAD
=======
  Sun,
  Moon,
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
  Menu,
  ChevronDown,
  ArrowUpRight,
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
  X,
} from "lucide-react";
import { useAuth } from "../App";
import { Footer } from "./Common";
import { initials } from "../lib/api";
const nav = [
  ["/", "Dashboard", LayoutDashboard],
  ["/projects", "Semua Project", FolderKanban],
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
  [
    "/kanban",
    "Kanban",
    KanbanSquare,
    ["Admin", "Admin Project", "Developer", "Client"],
  ],
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
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
<<<<<<< HEAD
    [search, setSearch] = useState("");
=======
<<<<<<< HEAD
    [search, setSearch] = useState("");
=======
<<<<<<< HEAD
    [search, setSearch] = useState("");
=======
<<<<<<< HEAD
    [search, setSearch] = useState("");
=======
    [search, setSearch] = useState(""),
    [light, setLight] = useState(
      localStorage.getItem("maiharta-theme") === "light",
    );
  useEffect(() => {
    document.documentElement.classList.toggle("light-mode", light);
    localStorage.setItem("maiharta-theme", light ? "light" : "dark");
    return () => document.documentElement.classList.remove("light-mode");
  }, [light]);
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
  useEffect(() => setOpen(false), [location.pathname]);
  const title =
    nav.find((n) => n[0] === location.pathname)?.[1] ||
    (location.pathname.startsWith("/projects/")
      ? "Detail Project"
      : location.pathname === "/users"
        ? "Manajemen User"
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
        : location.pathname === "/trash"
          ? "Recycle Bin"
          : location.pathname === "/audit"
            ? "Audit Trail"
            : "Pengaturan");
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
        : "Pengaturan");
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
            src="/assets/logo-mark.webp"
            alt="MaiHarta"
            data-testid="sidebar-logo"
          />
          <span className="brand-text">
            <b>
              CRM <em>maiharta</em>
            </b>
            <small>PROJECT WORKSPACE</small>
          </span>
        </NavLink>
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
        <div className="workspace-switch" data-testid="workspace-info">
          <span className="workspace-icon">
            <img src="/assets/logo-mark.webp" alt="" />
          </span>
<<<<<<< HEAD
=======
=======
            src="/assets/logo.webp"
            alt="MaiHarta"
            data-testid="sidebar-logo"
          />
          <span>PROJECT WORKSPACE</span>
        </NavLink>
        <div className="workspace-switch" data-testid="workspace-info">
          <span className="workspace-icon">M</span>
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
          <div>
            <b>MaiHarta Workspace</b>
            <small>
              <span className="live-dot" /> Tim MaiHarta
            </small>
          </div>
          <ChevronDown size={14} />
        </div>
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
          {user.role === "Admin" && (
            <NavLink className="nav-item" to="/audit" data-testid="nav-audit">
              <ScrollText size={18} />
              Audit Trail
            </NavLink>
          )}
          {["Admin", "Admin Project"].includes(user.role) && (
            <NavLink className="nav-item" to="/trash" data-testid="nav-trash">
              <Trash2 size={18} />
              Recycle Bin
            </NavLink>
          )}
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
          <NavLink
            className="nav-item"
            to="/settings"
            data-testid="nav-settings"
          >
            <Settings size={18} />
            Pengaturan
          </NavLink>
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
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
<<<<<<< HEAD
=======
=======
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
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
            <button
              data-testid="toggle-theme"
              className="icon-button"
              onClick={() => setLight(!light)}
              title={light ? "Mode gelap" : "Mode terang"}
            >
              {light ? <Moon size={19} /> : <Sun size={19} />}
            </button>
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
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
