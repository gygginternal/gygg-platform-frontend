// src/components/Shared/Sidebar.js
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Import hooks/components
import styles from "./Sidebar.module.css"; // Your CSS module
import { useAuth } from "../context/AuthContext"; // Assuming useAuth provides user role

// Simple component just for structure, replace with real Image/SVG handling
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

// NOTE: This Sidebar assumes it's toggled by an external mechanism (like the Header)
// It receives isOpen and toggleSidebar props.
function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation(); // Get current path
  const navigate = useNavigate(); // Get navigation function
  const { user } = useAuth(); // Get user info from AuthContext

  // Determine selected item based on current route path
  // This logic might need adjustment based on your exact routes
  const getSelectedItem = (path) => {
    if (path === location.pathname) return true;
    // Add more specific checks if needed, e.g., '/gigs/:id' should highlight '/gigs'
    if (path === "/gigs" && location.pathname.startsWith("/gigs/")) return true;
    // Add similar logic for other nested routes
    return false;
  };

  // Navigation data
  const navItems = [
    // Map route paths used in your React Router setup
    { key: "home", path: "/feed", icon: "/assets/home.svg", text: "Home" }, // Assuming /feed is home now
    {
      key: "messages",
      path: "/messages",
      icon: "/assets/messages.svg",
      text: "Messages",
    }, // Placeholder path
    {
      key: "contracts",
      path: "/gig-history",
      icon: "/assets/clock.svg",
      text: "Task History",
    }, // Use your history path
    { key: "gigs", path: "/gigs", icon: "/assets/briefcase.svg", text: "Gigs" }, // Path for all gigs
  ];

  // Add "Gig Helpers" only if the user role is "provider"

  if (user?.role.includes("provider")) {
    navItems.push({
      key: "gig helpers",
      path: "/taskers/matched",
      icon: "/assets/briefcase.svg",
      text: "Gig Helpers",
    });
  }

  const handleNavigation = (path) => {
    navigate(path); // Use navigate for programmatic navigation
    if (isOpen && window.innerWidth < 768) {
      // Close sidebar on mobile after click
      // toggleSidebar(); // Uncomment if toggleSidebar prop is passed and works
    }
  };

  return (
    // Apply open/collapsed classes based on isOpen prop
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
            role="link" // Accessibility
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ")
                handleNavigation(item.path);
            }}
          >
            <Icon
              className={isSelected ? styles.selectedIcon : styles.defaultIcon}
              src={item.icon} // Ensure icons are in /public
              alt={item.text}
            />
            {/* Text is hidden via CSS when collapsed */}
            {isOpen && <span className={styles.navText}>{item.text}</span>}
          </div>
        );
      })}
      {/* Optional: Add Toggle button inside if needed */}
      {/* <button onClick={toggleSidebar}>Toggle</button> */}
    </nav>
  );
}

export default Sidebar;
