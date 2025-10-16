import React from 'react';
import { Check, X } from 'lucide-react';
import styles from './NotificationItem.module.css';
import { decodeHTMLEntities } from '../../utils/htmlEntityDecoder';

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}) => {
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

  // Get notification icon
  const getNotificationIcon = type => {
    const iconMap = {
      new_message: '💬',
      new_like: '❤️',
      new_comment: '💭',
      new_gig: '💼',
      gig_application: '📝',
      gig_accepted: '✅',
      payment_received: '💰',
      review_received: '⭐',
      system: '🔔',
      contract_accepted: '📋',
      default: '🔔',
    };
    return iconMap[type] || iconMap.default;
  };

  return (
    <div
      className={`${styles.notificationItem} ${
        !notification.isRead ? styles.unread : ''
      }`}
      onClick={() => onClick(notification)}
    >
      <div className={styles.notificationIcon}>
        {notification.icon ? (
          <img src={notification.icon} alt="" />
        ) : (
          <span>{getNotificationIcon(notification.type)}</span>
        )}
      </div>

      <div className={styles.notificationContent}>
        <p className={styles.message}>
          {decodeHTMLEntities(notification.message)}
        </p>
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
              onMarkAsRead(notification._id);
            }}
            title="Mark as read"
          >
            <Check size={14} />
          </button>
        )}
        <button
          className={styles.deleteButton}
          onClick={e => {
            e.stopPropagation();
            onDelete(notification._id);
          }}
          title="Delete notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
