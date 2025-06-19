import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/axiosConfig';
import socket from '../../socket';
import PropTypes from 'prop-types';

function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationDropdownRef = useRef(null);

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

  const handleNavigation = route => {
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

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data.data.notifications || []);
      setUnreadNotificationCount(
        (res.data.data.notifications || []).filter(n => !n.isRead).length
      );
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(n => !n.isRead)
          .map(n => apiClient.patch(`/notifications/${n._id}/read`))
      );
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notifications as read:', err);
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

      socket.on('notification:newMessage', data => {
        console.log('New chat message notification received:', data);
        if (data.receiverId === user._id) {
          setUnreadMessageCount(prevCount => prevCount + 1);
        }
      });

      // Listen for unread count updates (e.g., when messages are marked as read)
      socket.on('notification:unreadCountUpdated', () => {
        console.log(
          'Unread count update notification received. Refreshing count...'
        );
        fetchUnreadCount(); // Re-fetch the count immediately
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket.');
      });

      socket.on('error', err => {
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
    if (!user) return;
    fetchNotifications();
    socket.on('notification:new', fetchNotifications);
    return () => {
      socket.off('notification:new', fetchNotifications);
    };
  }, [user]);

  // Handle notification dropdown open/close
  useEffect(() => {
    if (!showNotifications) return;
    markAllAsRead();
    const handleClickOutside = event => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchInputChange = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = event => {
    event.preventDefault();
    const trimmed = searchTerm.trim();

    if (!trimmed) return;

    if (user?.role.includes('provider')) {
      // For providers, search for taskers with specific skills
      navigate(`/gig-helper?search=${encodeURIComponent(trimmed)}`);
    } else if (user?.role.includes('tasker')) {
      // For taskers, search for gigs
      navigate(`/gigs?search=${encodeURIComponent(trimmed)}`);
    }

    setSearchTerm('');
  };

  return (
    <>
      <header className={styles.header}>
        <button
          onClick={toggleSidebar}
          className={styles.menuButton}
          aria-label="Toggle Menu"
        >
          <img
            src="/assets/menu.svg"
            alt="Menu"
            className={styles.menuIcon}
            width={32}
            height={32}
          />
        </button>

        <Link to="/" className={styles.logoLink}>
          <img
            src="/assets/gygg-logo.svg"
            alt="Gygg Logo"
            className={styles.headerLogo}
            height={50}
          />
        </Link>

        <form className={styles.searchContainer} onSubmit={handleSearchSubmit}>
          <div className={styles.searchBox}>
            <img
              src="/assets/search-outline.svg"
              alt="Search"
              width={20}
              height={20}
            />
            <input
              type="text"
              placeholder={
                user?.role.includes('provider')
                  ? 'Search Taskers'
                  : 'Search Gigs'
              }
              className={styles.searchInput}
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
          </div>
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </form>

        <div className={styles.headerControls}>
          {user && (
            <>
              <div style={{ position: 'relative' }}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowNotifications(prev => !prev)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setShowNotifications(prev => !prev);
                    }
                  }}
                  className={styles.notificationIcon}
                  aria-label="Open notifications"
                >
                  <img
                    src="/assets/notification.svg"
                    alt="Notification"
                    width={28}
                    height={28}
                  />
                  {unreadNotificationCount > 0 && (
                    <span className={styles.notificationDot}>
                      {unreadNotificationCount}
                    </span>
                  )}
                </div>
                {showNotifications && (
                  <div
                    className={styles.notificationDropdown}
                    ref={notificationDropdownRef}
                  >
                    <div className={styles.notificationHeader}>
                      Notifications
                      {notifications.length > 0 && (
                        <button
                          className={styles.markAllReadBtn}
                          onClick={markAllAsRead}
                          type="button"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className={styles.notificationEmpty}>
                        No notifications
                      </div>
                    ) : (
                      <ul className={styles.notificationList}>
                        {notifications.map(n => (
                          <li
                            key={n._id}
                            className={
                              n.isRead
                                ? styles.notificationRead
                                : styles.notificationUnread
                            }
                          >
                            <button
                              type="button"
                              className={styles.notificationItemBtn}
                              onClick={() => {
                                if (n.link) {
                                  navigate(n.link);
                                  setShowNotifications(false);
                                } else if (n.data && n.data.link) {
                                  navigate(n.data.link);
                                  setShowNotifications(false);
                                } else if (
                                  n.type === 'new_message' &&
                                  n.data &&
                                  n.data.conversationId
                                ) {
                                  navigate(
                                    `/messages/${n.data.conversationId}`
                                  );
                                  setShowNotifications(false);
                                } else if (
                                  n.type === 'new_comment' &&
                                  n.data &&
                                  n.data.postId
                                ) {
                                  navigate(`/posts/${n.data.postId}`);
                                  setShowNotifications(false);
                                }
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  if (n.link) {
                                    navigate(n.link);
                                    setShowNotifications(false);
                                  } else if (n.data && n.data.link) {
                                    navigate(n.data.link);
                                    setShowNotifications(false);
                                  } else if (
                                    n.type === 'new_message' &&
                                    n.data &&
                                    n.data.conversationId
                                  ) {
                                    navigate(
                                      `/messages/${n.data.conversationId}`
                                    );
                                    setShowNotifications(false);
                                  } else if (
                                    n.type === 'new_comment' &&
                                    n.data &&
                                    n.data.postId
                                  ) {
                                    navigate(`/posts/${n.data.postId}`);
                                    setShowNotifications(false);
                                  }
                                }
                              }}
                              tabIndex={0}
                              aria-label={n.message}
                            >
                              {/* Show icon if present */}
                              {n.icon && (
                                <img
                                  src={`/assets/${n.icon}`}
                                  alt="Notification Icon"
                                  style={{
                                    width: 24,
                                    height: 24,
                                    marginRight: 8,
                                    verticalAlign: 'middle',
                                  }}
                                />
                              )}
                              <span>{n.message}</span>
                              <div className={styles.notificationTime}>
                                {new Date(n.createdAt).toLocaleString()}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

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
                    <Link
                      to="/profile"
                      className={styles.dropdownItem}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <img
                        src="/assets/user.svg"
                        alt="User"
                        width={18}
                        height={18}
                      />
                      <p>Profile</p>
                    </Link>
                    <button
                      type="button"
                      className={styles.dropdownItem}
                      onClick={() => handleNavigation('/settings')}
                    >
                      <img
                        src="/assets/settings.svg"
                        alt="Settings"
                        width={18}
                        height={18}
                      />
                      <p>Settings</p>
                    </button>
                    <button
                      type="button"
                      className={styles.dropdownItem}
                      onClick={handleLogout}
                    >
                      <img
                        src="/assets/logout.svg"
                        alt="Log out"
                        width={18}
                        height={18}
                      />
                      <p>Log out</p>
                    </button>
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

Header.propTypes = {
  // Add any necessary prop types here
};

export default Header;
