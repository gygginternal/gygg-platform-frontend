import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import { useSocket } from '../contexts/SocketContext';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const { notification: newNotification } = useSocket();

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
      setError(null);

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
      } catch (err) {
        setError('Failed to fetch notifications');
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  // Load more notifications
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  }, [fetchNotifications, page, loading, hasMore]);

  // Refresh notifications
  const refresh = useCallback(() => {
    fetchNotifications(1, true);
  }, [fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async notificationId => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(
    async notificationId => {
      try {
        await apiClient.delete(`/notifications/${notificationId}`);
        const deletedNotification = notifications.find(
          n => n._id === notificationId
        );
        setNotifications(prev =>
          prev.filter(notif => notif._id !== notificationId)
        );

        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error('Failed to delete notification:', err);
      }
    },
    [notifications]
  );

  // Get unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      setUnreadCount(response.data.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    error,
    fetchNotifications,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchUnreadCount,
  };
};
