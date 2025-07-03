import React, { useEffect, useState } from 'react';
import apiClient from '../api/axiosConfig';
import styles from './NotificationsPage.module.css';
import { useNavigate } from 'react-router-dom';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data.data.notifications || []);
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async id => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(n =>
        n.map(notif => (notif._id === id ? { ...notif, read: true } : notif))
      );
    } catch (err) {
      // Remove all console.error statements
    }
  };

  const deleteNotification = async id => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications(n => n.filter(notif => notif._id !== id));
    } catch (err) {
      // Remove all console.error statements
    }
  };

  const handleNotificationClick = async notif => {
    if (notif.type === 'gig_application' && notif.data?.gigId) {
      await markAsRead(notif._id);
      navigate(`/posted-gigs?gigId=${notif.data.gigId}`);
    }
    // Add more notification type handlers as needed
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h2>Notifications</h2>
      <ul className={styles.list}>
        {notifications.map(n => (
          <li key={n._id} className={n.read ? styles.read : styles.unread}>
            <button
              className={styles.notificationButton}
              onClick={() => handleNotificationClick(n)}
              style={{
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
              }}
            >
              <span>{n.message}</span>
              <div className={styles.actions}>
                {!n.read && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      markAsRead(n._id);
                    }}
                  >
                    Mark as read
                  </button>
                )}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    deleteNotification(n._id);
                  }}
                >
                  Delete
                </button>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationsPage;
