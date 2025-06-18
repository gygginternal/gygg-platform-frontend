import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import styles from "./Header.module.css";
import Sidebar from "./Sidebar";
import { useAuth } from '../../context/AuthContext';
import apiClient from "../../api/axiosConfig";
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_BACKEND_URL, { path: '/socketio' });

function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const handleNavigation = (route) => {
    navigate(route);
    setIsProfileOpen(false);
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/chat/unread-count');
      setUnreadMessageCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const pollInterval = setInterval(fetchUnreadCount, 30000);

    if (user) {
      socket.disconnect();
      socket.connect();

      socket.on('connect', () => {
        console.log('Connected to WebSocket for notifications.');
        socket.emit('subscribeToNotifications', { userId: user._id });
      });

      socket.on('notification:newMessage', (data) => {
        console.log('New chat message notification received:', data);
        if (data.receiverId === user._id) {
          setUnreadMessageCount(prevCount => prevCount + 1);
        }
      });

      // Listen for unread count updates (e.g., when messages are marked as read)
      socket.on('notification:unreadCountUpdated', () => {
        console.log('Unread count update notification received. Refreshing count...');
        fetchUnreadCount(); // Re-fetch the count immediately
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket.');
      });

      socket.on('error', (err) => {
        console.error('WebSocket error:', err);
      });
    }

    return () => {
      clearInterval(pollInterval);
      socket.off('notification:newMessage');
      socket.off('notification:unreadCountUpdated');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('error');
      if (user) {
        socket.emit('unsubscribeFromNotifications', { userId: user._id });
        socket.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    
    if (!trimmed) return;

    if (user?.role.includes("provider")) {
      // For providers, search for taskers with specific skills
      navigate(`/gig-helper?search=${encodeURIComponent(trimmed)}`);
    } else if (user?.role.includes("tasker")) {
      // For taskers, search for gigs
      navigate(`/gigs?search=${encodeURIComponent(trimmed)}`);
    }
    
    setSearchTerm("");
  };

  return (
    <>
      <header className={styles.header}>
        <button onClick={toggleSidebar} className={styles.menuButton} aria-label="Toggle Menu">
          <img src="/assets/menu.svg" alt="Menu" className={styles.menuIcon} width={32} height={32} />
        </button>

        <Link to="/" className={styles.logoLink}>
          <img src="/assets/gygg-logo.svg" alt="Gygg Logo" className={styles.headerLogo} height={50} />
        </Link>

        <form className={styles.searchContainer} onSubmit={handleSearchSubmit}>
          <div className={styles.searchBox}>
            <img src="/assets/search-outline.svg" alt="Search" width={20} height={20} />
            <input
              type="text"
              placeholder={user?.role.includes("provider") ? "Search Taskers" : "Search Gigs"}
              className={styles.searchInput}
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
          </div>
          <button type="submit" className={styles.searchButton}>Search</button>
        </form>

        <div className={styles.headerControls}>
          {user && (
            <>
              <button className={styles.iconButton} aria-label="Notifications">
                <img src="/assets/notification.svg" alt="Notification" width={28} height={28} />
                {unreadMessageCount > 0 && (
                  <span className={styles.notificationDot}></span>
                )}
              </button>

              <div className={styles.iconWithDropdown} ref={profileDropdownRef}>
                <button
                  className={styles.iconButton}
                  onClick={() => setIsProfileOpen(prev => !prev)}
                  aria-label="Profile Menu"
                >
                  <img
                    src="/assets/profile.svg"
                    alt="Profile"
                    width={36}
                    height={36}
                  />
                </button>
                {isProfileOpen && (
                  <div className={styles.dropdown}>
                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setIsProfileOpen(false)}>
                      <img src="/assets/user.svg" alt="User" width={18} height={18} />
                      <p>Profile</p>
                    </Link>
                    <div className={styles.dropdownItem} onClick={() => handleNavigation("/settings")}>
                      <img src="/assets/settings.svg" alt="Settings" width={18} height={18} />
                      <p>Settings</p>
                    </div>
                    <div className={styles.dropdownItem} onClick={handleLogout}>
                      <img src="/assets/logout.svg" alt="Log out" width={18} height={18} />
                      <p>Log out</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </>
  );
}

export default Header;
