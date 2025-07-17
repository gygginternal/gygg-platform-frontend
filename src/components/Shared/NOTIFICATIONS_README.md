# 🔔 Facebook-Style Notification System

## Overview

This notification system provides a Facebook-like dropdown experience with real-time notifications, infinite scrolling, and comprehensive user interactions.

## Features

### ✅ Core Features

- **Real-time Notifications**: Instant delivery via WebSocket
- **Infinite Scrolling**: Load more notifications as you scroll
- **Unread Count Badge**: Shows number of unread notifications
- **Mark as Read**: Individual and bulk mark as read functionality
- **Delete Notifications**: Remove unwanted notifications
- **Time Formatting**: Human-readable time stamps (e.g., "2m ago", "1h ago")
- **Responsive Design**: Works on desktop and mobile devices

### ✅ User Experience

- **Smooth Animations**: Hover effects and transitions
- **Visual Indicators**: Blue dot for unread notifications
- **Empty State**: Friendly message when no notifications exist
- **Loading States**: Spinner while fetching data
- **End State**: "You're all caught up!" message

### ✅ Backend Integration

- **Pagination**: Efficient loading with page-based pagination
- **Real-time Updates**: WebSocket integration for instant notifications
- **Secure API**: Protected endpoints with authentication
- **Optimized Queries**: Efficient database queries with proper indexing

## Components

### 1. NotificationDropdown

Main component that handles the notification bell and dropdown.

```jsx
import NotificationDropdown from './components/Shared/NotificationDropdown';

// Usage in Header
<NotificationDropdown />;
```

### 2. NotificationItem

Individual notification item component.

```jsx
import NotificationItem from './components/Shared/NotificationItem';

// Usage
<NotificationItem
  notification={notification}
  onMarkAsRead={handleMarkAsRead}
  onDelete={handleDelete}
  onClick={handleClick}
/>;
```

### 3. useNotifications Hook

Custom hook for managing notification state and API calls.

```jsx
import { useNotifications } from '../hooks/useNotifications';

const {
  notifications,
  unreadCount,
  loading,
  hasMore,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  loadMore,
} = useNotifications();
```

## API Endpoints

### Backend Routes (`/api/v1/notifications`)

- `GET /` - Get notifications with pagination
- `GET /unread-count` - Get unread notification count
- `GET /:id` - Get specific notification
- `PATCH /:id/read` - Mark notification as read
- `PATCH /mark-all-read` - Mark all notifications as read
- `DELETE /:id` - Delete notification

### Query Parameters

```javascript
// Get notifications with pagination
GET /api/v1/notifications?page=1&limit=20

// Response
{
  "status": "success",
  "data": {
    "notifications": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalNotifications": 100,
      "hasMore": true,
      "limit": 20
    },
    "unreadCount": 15
  }
}
```

## Notification Types

The system supports various notification types with appropriate icons:

- `new_message` 💬 - New chat message
- `new_like` ❤️ - Post liked
- `new_comment` 💭 - New comment
- `new_gig` 💼 - New gig posted
- `gig_application` 📝 - Gig application received
- `gig_accepted` ✅ - Gig application accepted
- `payment_received` 💰 - Payment received
- `review_received` ⭐ - Review received
- `contract_accepted` 📋 - Contract accepted
- `system` 🔔 - System notification

## Styling

### CSS Modules

All components use CSS modules for scoped styling:

- `NotificationDropdown.module.css`
- `NotificationItem.module.css`
- `Header.module.css`

### Key Classes

- `.unread` - Styling for unread notifications
- `.badge` - Notification count badge
- `.dropdown` - Main dropdown container
- `.notificationItem` - Individual notification styling

## Real-time Integration

### WebSocket Events

The system listens for real-time notification events:

```javascript
// Backend emits
io.to(userId).emit('notification:new', notification);

// Frontend receives
const { notification } = useSocket();
```

### Auto-update

- New notifications appear instantly
- Unread count updates in real-time
- No page refresh required

## Usage Examples

### Basic Implementation

```jsx
import React from 'react';
import Header from './components/Shared/Header';

function App() {
  return (
    <div>
      <Header /> {/* Contains NotificationDropdown */}
      {/* Rest of your app */}
    </div>
  );
}
```

### Custom Notification Handler

```jsx
import { useNotifications } from './hooks/useNotifications';

function CustomNotifications() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const handleNotificationClick = notification => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Navigate to relevant page
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div>
      <h2>Notifications ({unreadCount})</h2>
      {notifications.map(notification => (
        <div
          key={notification._id}
          onClick={() => handleNotificationClick(notification)}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}
```

## Performance Optimizations

### Frontend

- **Infinite Scrolling**: Load notifications on demand
- **Memoization**: React.memo for notification items
- **Debounced Scrolling**: Prevent excessive API calls
- **Optimistic Updates**: Immediate UI updates

### Backend

- **Pagination**: Limit query results
- **Indexing**: Database indexes on user and createdAt
- **Caching**: Consider Redis for high-traffic scenarios
- **WebSocket Optimization**: Efficient real-time delivery

## Mobile Responsiveness

The notification system is fully responsive:

- **Desktop**: Full-width dropdown (360px)
- **Tablet**: Adjusted width (320px)
- **Mobile**: Compact width (280px)
- **Touch-friendly**: Larger touch targets on mobile

## Accessibility

- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Tab and Enter support
- **Focus Management**: Proper focus handling
- **Color Contrast**: WCAG compliant colors

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Fallbacks**: Graceful degradation for older browsers

## Installation & Setup

1. **Install Dependencies**:

   ```bash
   npm install lucide-react
   ```

2. **Import Components**:

   ```jsx
   import NotificationDropdown from './components/Shared/NotificationDropdown';
   ```

3. **Add to Header**:

   ```jsx
   <NotificationDropdown />
   ```

4. **Ensure WebSocket Context**:
   Make sure your app is wrapped with `SocketProvider`.

## Troubleshooting

### Common Issues

1. **Notifications not appearing**:
   - Check WebSocket connection
   - Verify user authentication
   - Check browser console for errors

2. **Infinite scroll not working**:
   - Verify `hasMore` state
   - Check scroll event listeners
   - Ensure proper pagination

3. **Real-time updates missing**:
   - Check WebSocket connection status
   - Verify user subscription to notifications
   - Check backend WebSocket emission

### Debug Mode

Enable debug logging:

```javascript
// In NotificationDropdown.js
const DEBUG = import.meta.env.DEV;

if (DEBUG) {
  console.log('Notifications:', notifications);
  console.log('Unread count:', unreadCount);
}
```

## Future Enhancements

- **Push Notifications**: Browser push notifications
- **Notification Categories**: Group by type
- **Notification Settings**: User preferences
- **Rich Notifications**: Images and actions
- **Notification History**: Archive old notifications

---

This notification system provides a complete, production-ready solution that matches modern social media platforms' user experience! 🚀
