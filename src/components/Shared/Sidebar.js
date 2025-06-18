// src/components/Shared/Sidebar.js
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { useAuth } from "../../context/AuthContext";
import io from 'socket.io-client';
import apiClient from '../../api/axiosConfig';

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
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Socket.io connection (singleton)
  const socket = React.useMemo(() => {
    if (user) {
      return io(process.env.REACT_APP_BACKEND_URL, { path: '/socketio' });
    }
    return null;
  }, [user]);

  React.useEffect(() => {
    if (!user) return;
    // Fetch unread count on mount
    const fetchUnreadCount = async () => {
      try {
        const unreadResponse = await apiClient.get('/chat/unread-count');
        setUnreadMessageCount(unreadResponse.data.data.unreadCount);
      } catch (error) {
        console.error('Error fetching unread count:', error);
        setUnreadMessageCount(0);
      }
    };
    fetchUnreadCount();
    if (socket) {
      socket.emit('subscribeToNotifications', { userId: user._id });
      socket.on('chat:newMessage', fetchUnreadCount);
      socket.on('chat:unreadCountUpdated', fetchUnreadCount);
      return () => {
        socket.emit('unsubscribeFromNotifications', { userId: user._id });
        socket.off('chat:newMessage', fetchUnreadCount);
        socket.off('chat:unreadCountUpdated', fetchUnreadCount);
      };
    }
  }, [user, socket]);

  const getSelectedItem = (path) => {
    if (path === location.pathname) return true;
    if (path === "/gigs" && location.pathname.startsWith("/gigs/")) return true;
    return false;
  };

  const navItems = [
    { key: "home", path: "/feed", icon: "/assets/home.svg", text: "Home" },
    { key: "messages", path: "/messages", icon: "/assets/messages.svg", text: "Messages", unread: unreadMessageCount > 0 },
    { key: "contracts", path: "/contracts", icon: "/assets/receipt-edit.svg", text: "Contracts" },
  ];

  if (user?.role.includes("tasker")) {
    navItems.push({ key: "gigs", path: "/gigs", icon: "/assets/briefcase.svg", text: "Gigs" });
  }

  if (user?.role.includes("provider")) {
    navItems.push({ key: "gig helpers", path: "/gig-helper", icon: "/assets/briefcase.svg", text: "Gig Helpers" });
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
              {item.unread && (
                <span style={{
                  display: 'inline-block',
                  background: '#ff3b30',
                  borderRadius: '50%',
                  width: 10,
                  height: 10,
                  marginLeft: 4,
                  verticalAlign: 'middle',
                }}></span>
              )}
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