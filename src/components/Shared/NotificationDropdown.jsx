import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../../api/axiosConfig';
import { useSocket } from '../../contexts/SocketContext';
import styles from './NotificationDropdown.module.css';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const dropdownRef = useRef(null);
  const scrollRef = useRef(null);
  const { notification: newNotification } = useSocket();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle new real-time notifications
  useEffect(() => {
    if (newNotification) {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  }, [newNotification]);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (pageNum = 1, reset = false) => {
      if (loading) return;

      setLoading(true);
      try {
        const response = await apiClient.get(
          `/notifications?page=${pageNum}&limit=20`
        );
        const {
          notifications: newNotifications,
          pagination,
          unreadCount: count,
        } = response.data.data;

        if (reset) {
          setNotifications(newNotifications);
          setPage(1);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }

        setHasMore(pagination.hasMore);
        setUnreadCount(count);
        setPage(pageNum);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  // Load initial notifications when dropdown opens
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications(1, true);
    }
  }, [isOpen, fetchNotifications, notifications.length]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      fetchNotifications(page + 1);
    }
  }, [fetchNotifications, page, loading, hasMore]);

  // Mark notification as read
  const markAsRead = async notificationId => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async notificationId => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      setNotifications(prev =>
        prev.filter(notif => notif._id !== notificationId)
      );
      if (!notifications.find(n => n._id === notificationId)?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Format time ago
  const formatTimeAgo = date => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInSeconds = Math.floor((now - notifDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notifDate.toLocaleDateString();
  };

  // Get notification icon using your original SVG icons
  const getNotificationIcon = type => {
    const iconMap = {
      new_message: '/assets/message.svg',
      new_like: '/assets/heart-filled.svg',
      new_comment: '/assets/comment.svg',
      new_gig: '/assets/briefcase.svg',
      gig_application: '/assets/applied-user.svg',
      gig_accepted: '/assets/contract.svg',
      payment_received: '/assets/money.svg',
      review_received: '/assets/heart.svg',
      system: '/assets/notification.svg',
      contract_accepted: '/assets/receipt-edit.svg',
      default: '/assets/notification.svg',
    };
    return iconMap[type] || iconMap.default;
  };

  return (
    <div className={styles.notificationContainer} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        className={styles.notificationButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <img
          src="/assets/notification.svg"
          alt="Notifications"
          width={24}
          height={24}
        />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={styles.dropdown}>
          {/* Header */}
          <div className={styles.header}>
            <h3>Notifications</h3>
            <div className={styles.headerActions}>
              {unreadCount > 0 && (
                <button
                  className={styles.markAllRead}
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <img
                    src="/assets/close.svg"
                    alt="Mark all read"
                    width={16}
                    height={16}
                  />
                </button>
              )}
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
              >
                <img
                  src="/assets/close.svg"
                  alt="Close"
                  width={16}
                  height={16}
                />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div
            className={styles.notificationsList}
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {notifications.length === 0 && !loading ? (
              <div className={styles.emptyState}>
                <img
                  src="/assets/notification.svg"
                  alt=""
                  width={48}
                  height={48}
                />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`${styles.notificationItem} ${
                    !notification.isRead ? styles.unread : ''
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification._id);
                    }
                    if (notification.link) {
                      window.location.href = notification.link;
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (!notification.isRead) {
                        markAsRead(notification._id);
                      }
                      if (notification.link) {
                        window.location.href = notification.link;
                      }
                    }
                  }}
                >
                  <div className={styles.notificationIcon}>
                    {notification.icon ? (
                      <img src={notification.icon} alt="" />
                    ) : (
                      <img
                        src={getNotificationIcon(notification.type)}
                        alt=""
                        width={20}
                        height={20}
                      />
                    )}
                  </div>

                  <div className={styles.notificationContent}>
                    <p className={styles.message}>{notification.message}</p>
                    <span className={styles.time}>
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>

                  <div className={styles.notificationActions}>
                    {!notification.isRead && (
                      <button
                        className={styles.markReadButton}
                        onClick={e => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                        title="Mark as read"
                      >
                        <img
                          src="/assets/close.svg"
                          alt="Mark as read"
                          width={14}
                          height={14}
                        />
                      </button>
                    )}
                    <button
                      className={styles.deleteButton}
                      onClick={e => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      title="Delete notification"
                    >
                      <img
                        src="/assets/trash.svg"
                        alt="Delete"
                        width={14}
                        height={14}
                      />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Loading indicator */}
            {loading && (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading notifications...</p>
              </div>
            )}

            {/* End of notifications */}
            {!hasMore && notifications.length > 0 && (
              <div className={styles.endMessage}>
                <p>You&apos;re all caught up! 🎉</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
