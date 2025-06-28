import { useEffect, useState } from 'react';
import apiClient from '../api/axiosConfig';
import styles from './NotificationsPage.module.css';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h2>Notifications</h2>
      <ul className={styles.list}>
        {notifications.map(n => (
          <li key={n._id} className={n.read ? styles.read : styles.unread}>
            <span>{n.message}</span>
            <div className={styles.actions}>
              {!n.read && (
                <button onClick={() => markAsRead(n._id)}>Mark as read</button>
              )}
              <button onClick={() => deleteNotification(n._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationsPage;
