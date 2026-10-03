import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useReducedMotionPreference } from "../hooks/useReducedMotionPreference";

export const SidebarNavItem = ({ path, label, icon: Icon, preference = false }) => {
  const reduced = useReducedMotionPreference();
  return <NavLink end={path === "/"} to={path} data-testid={`nav-${path === "/" ? "dashboard" : path.slice(1)}`}
    className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
    {({ isActive }) => <>
      {isActive && <motion.span className="nav-motion-indicator" layoutId="main-active-menu"
        data-testid={preference ? "preferences-navigation-indicator" : "main-navigation-indicator"} aria-hidden="true"
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 440, damping: 36 }} />}
      <Icon size={18} aria-hidden="true" /><span>{label}</span>
      {path === "/" && <span className="nav-active-dot" aria-hidden="true" />}
    </>}
  </NavLink>;
};