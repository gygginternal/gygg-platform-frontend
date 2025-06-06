// src/components/Shared/Sidebar.js
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { useAuth } from "../../context/AuthContext";

const Icon = ({ src, alt, className }) => (
  <img
    src={src}
    alt={alt}
    width={24}
    height={24}
    className={className}
    onError={(e) => (e.target.style.display = "none")}
  />
);

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getSelectedItem = (path) => {
    if (path === location.pathname) return true;
    if (path === "/gigs" && location.pathname.startsWith("/gigs/")) return true;
    return false;
  };

  const navItems = [
    { key: "home", path: "/feed", icon: "/assets/home.svg", text: "Home" },
    { key: "messages", path: "/messages", icon: "/assets/messages.svg", text: "Messages" },
    { key: "contracts", path: "/contracts", icon: "/assets/receipt-edit.svg", text: "Contracts" },
  ];

  if (user?.role.includes("tasker")) {
    navItems.push({ key: "gigs", path: "/gigs", icon: "/assets/briefcase.svg", text: "Gigs" });
  }

  if (user?.role.includes("provider")) {
    navItems.push({ key: "gig helpers", path: "/find-taskers", icon: "/assets/briefcase.svg", text: "Gig Helpers" });
  }

  const handleNavigation = (path) => {
    navigate(path);
    if (isOpen && window.innerWidth < 768) {
      // toggleSidebar(); // Uncomment if toggleSidebar prop is passed and works
    }
  };

  return (
    <nav
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.collapsed}`}
    >
      {navItems.map((item) => {
        const isSelected = getSelectedItem(item.path);
        return (
          <div
            key={item.key}
            className={`${styles.navItem} ${isSelected ? styles.selected : ""}`}
            onClick={() => handleNavigation(item.path)}
            role="link"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ")
                handleNavigation(item.path);
            }}
          >
            {/* New wrapper for icon and text */}
            <div className={styles.navItemContent}>
              <Icon
                className={isSelected ? styles.selectedIcon : styles.defaultIcon}
                src={item.icon}
                alt={item.text}
              />
              {/* Text is hidden via CSS when collapsed (desktop only) */}
              {isOpen && <span className={styles.navText}>{item.text}</span>}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export default Sidebar;