import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/axiosConfig';
import { useSocket } from '../../contexts/SocketContext';

function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const {
    unreadCount,
    notification,
    notifications: liveNotifications,
  } = useSocket();
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
      // setUnreadMessageCount(response.data.data.unreadCount); // This line is removed as per new_code
    } catch (error) {
      // console.error('Error fetching unread count:', error);
    }
  };

  // Fetch notifications only on mount or user change
  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data.data.notifications || []);
      setUnreadNotificationCount(
        (res.data.data.notifications || []).filter(n => !n.isRead).length
      );
    } catch (err) {
      // console.error('Error fetching notifications:', err);
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
      // Optimistically update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotificationCount(0);
    } catch (err) {
      // console.error('Error marking notifications as read:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user]);

  // Use live notifications for instant updates
  useEffect(() => {
    if (liveNotifications && liveNotifications.length > 0) {
      // Merge live notifications with existing ones, avoiding duplicates
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n._id));
        const newNotifications = liveNotifications.filter(
          n => !existingIds.has(n._id)
        );
        const merged = [...newNotifications, ...prev];
        return merged;
      });

      // Update unread count based on merged notifications
      setNotifications(current => {
        setUnreadNotificationCount(current.filter(n => !n.isRead).length);
        return current;
      });
    }
  }, [liveNotifications]);

  // No need for socket event listeners here; handled by context

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

  // Helper function to format notification time
  function formatNotificationTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    if (isToday) {
      // Show time as h:mm AM/PM (no leading zero for hour, minutes always two digits)
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      if (hours === 0) hours = 12;
      const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
      return `${hours}:${minutesStr} ${ampm}`;
    } else {
      return date.toLocaleDateString();
    }
  }

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
              <div className={styles.notificationContainer}>
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
                    {notifications.length === 0 ? (
                      <div className={styles.notificationEmpty}>
                        No notifications
                      </div>
                    ) : (
                      <ul className={styles.notificationList}>
                        {notifications.map((notification, idx) => (
                          <React.Fragment key={notification._id}>
                            <li
                              className={
                                notification.isRead
                                  ? styles.notificationRead
                                  : styles.notificationUnread
                              }
                            >
                              <button
                                type="button"
                                className={styles.notificationDropdownItem}
                                onClick={() => {
                                  if (notification.link) {
                                    navigate(notification.link);
                                    setShowNotifications(false);
                                  } else if (
                                    notification.data &&
                                    notification.data.link
                                  ) {
                                    navigate(notification.data.link);
                                    setShowNotifications(false);
                                  } else if (
                                    notification.type === 'new_message' &&
                                    notification.data &&
                                    notification.data.conversationId
                                  ) {
                                    navigate(
                                      `/messages/${notification.data.conversationId}`
                                    );
                                    setShowNotifications(false);
                                  } else if (
                                    notification.type === 'new_comment' &&
                                    notification.data &&
                                    notification.data.postId
                                  ) {
                                    navigate(
                                      `/posts/${notification.data.postId}`
                                    );
                                    setShowNotifications(false);
                                  }
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    if (notification.link) {
                                      navigate(notification.link);
                                      setShowNotifications(false);
                                    } else if (
                                      notification.data &&
                                      notification.data.link
                                    ) {
                                      navigate(notification.data.link);
                                      setShowNotifications(false);
                                    } else if (
                                      notification.type === 'new_message' &&
                                      notification.data &&
                                      notification.data.conversationId
                                    ) {
                                      navigate(
                                        `/messages/${notification.data.conversationId}`
                                      );
                                      setShowNotifications(false);
                                    } else if (
                                      notification.type === 'new_comment' &&
                                      notification.data &&
                                      notification.data.postId
                                    ) {
                                      navigate(
                                        `/posts/${notification.data.postId}`
                                      );
                                      setShowNotifications(false);
                                    }
                                  }
                                }}
                                tabIndex={0}
                                aria-label={notification.message}
                              >
{(() => {
                                  // Always use consistent icons based on notification type
                                  let iconSrc = '/assets/comment.svg'; // default
                                  
                                  if (notification.type === 'new_message' || 
                                      notification.message?.toLowerCase().includes('message')) {
                                    iconSrc = '/assets/message.svg';
                                  } else if (notification.type === 'post_liked' || 
                                            notification.message?.toLowerCase().includes('liked')) {
                                    iconSrc = '/assets/heart-filled.svg';
                                  } else if (notification.type === 'new_comment' || 
                                            notification.message?.toLowerCase().includes('comment')) {
                                    iconSrc = '/assets/comment.svg';
                                  } else if (notification.type === 'application_received' ||
                                            notification.message?.toLowerCase().includes('applied')) {
                                    iconSrc = '/assets/applied-user.svg';
                                  } else if (notification.type === 'gig_posted' ||
                                            notification.message?.toLowerCase().includes('gig')) {
                                    iconSrc = '/assets/briefcase.svg';
                                  }
                                  
                                  return (
                                    <img
                                      src={iconSrc}
                                      alt="Notification Icon"
                                      width={24}
                                      height={24}
                                    />
                                  );
                                })()}
                                <span>{notification.message}</span>
                                <span className={styles.notificationTime}>
                                  {formatNotificationTime(
                                    notification.createdAt
                                  )}
                                </span>
                              </button>
                            </li>
                            {idx < notifications.length - 1 && (
                              <hr className={styles.notificationDivider} />
                            )}
                          </React.Fragment>
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
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      <li>
                        <Link
                          to="/profile"
                          className={styles.dropdownItem}
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <img
                            src="/assets/user.svg"
                            alt="User"
                            width={24}
                            height={24}
                          />
                          <span>My Profile</span>
                        </Link>
                      </li>
                      <li>
                        <button
                          type="button"
                          className={styles.dropdownItem}
                          onClick={() => handleNavigation('/settings')}
                        >
                          <img
                            src="/assets/settings.svg"
                            alt="Settings"
                            width={24}
                            height={24}
                          />
                          <span>Settings</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className={styles.dropdownItem}
                          onClick={handleLogout}
                        >
                          <img
                            src="/assets/logout.svg"
                            alt="Log out"
                            width={24}
                            height={24}
                          />
                          <span>Log out</span>
                        </button>
                      </li>
                    </ul>
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
