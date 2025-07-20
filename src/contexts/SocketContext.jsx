import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import PropTypes from 'prop-types';

const SocketContext = createContext(undefined);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [newMessage, setNewMessage] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [notifications, setNotifications] = useState([]); // New: notifications array
  const [updatedMessage, setUpdatedMessage] = useState(null);
  const { user, authToken, isLoading } = useAuth();
  const newMessageHandlers = useRef([]);
  const messageUpdateHandlers = useRef([]);

  console.log('[Socket] User in SocketContext:', user);
  console.log('[Socket] AuthToken in SocketContext:', authToken);

  useEffect(() => {
    console.log(
      '[Socket] useEffect running. isLoading:',
      isLoading,
      'user:',
      user,
      'authToken:',
      authToken
    );
    console.log('[Socket] useEffect before if (!isLoading && user)');
    if (!isLoading && user && authToken) {
      console.log('[Socket] Entering socket creation block.');
      const newSocket = io(
        (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(
          '/api/v1',
          ''
        ),
        {
          path: '/socket.io',
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
          autoConnect: true,
          withCredentials: true,
          forceNew: true,
          auth: {
            token: authToken,
          },
        }
      );
      console.log('[Socket] Socket instance created:', newSocket);

      newSocket.on('connect', () => {
        setConnected(true);
        console.log('[Socket] Connected:', newSocket.id);
        if (user && user._id) {
          newSocket.emit('subscribeToNotifications', { userId: user._id });
          console.log(
            '[Socket] Subscribed to notifications for userId:',
            user._id,
            'typeof:',
            typeof user._id
          );
        }
      });

      newSocket.on('disconnect', reason => {
        setConnected(false);
        console.log('[Socket] Disconnected:', reason);
      });

      newSocket.on('connect_error', err => {
        console.error('[Socket] Connect error:', err);
      });

      newSocket.on('error', err => {
        console.error('[Socket] General error:', err);
      });

      newSocket.on('chat:newMessage', message => {
        console.log('[Socket] Received chat:newMessage:', message);
        setNewMessage(message);
        newMessageHandlers.current.forEach(h => h(message));
      });

      newSocket.on('chat:unreadCountUpdated', ({ count }) => {
        setUnreadCount(count);
      });

      newSocket.on('chat:typing', userId => {
        setTypingUser(userId);
      });

      newSocket.on('chat:onlineUsers', users => {
        setOnlineUsers(users);
      });

      newSocket.on('notification:new', notif => {
        console.log(
          '[Socket] Received notification:new:',
          notif,
          'socket:',
          newSocket
        );
        setNotification(notif);
        setNotifications(prev => {
          const updated = [notif, ...prev];
          console.log('[Socket] Updated notifications array:', updated);
          return updated;
        });
      });

      newSocket.on('newChatMessage', message => {
        console.log('[Socket] Received newChatMessage:', message);
        setNewMessage(message);
        newMessageHandlers.current.forEach(h => h(message));
      });

      newSocket.on('notification:unreadCountUpdated', () => {
        console.log('Unread count updated notification received');
      });

      newSocket.on('chat:messageUpdated', message => {
        setUpdatedMessage(message);
        messageUpdateHandlers.current.forEach(h => h(message));
      });

      setSocket(newSocket);

      return () => {
        console.log('[Socket] Cleanup function running.');
        if (user && user._id) {
          newSocket.emit('unsubscribeFromNotifications', { userId: user._id });
        }
        newSocket.disconnect();
      };
    }
  }, [user, authToken, isLoading]);

  // Register/unregister handler functions
  const registerNewMessageHandler = handler => {
    newMessageHandlers.current.push(handler);
    return () => {
      newMessageHandlers.current = newMessageHandlers.current.filter(
        h => h !== handler
      );
    };
  };
  const registerMessageUpdateHandler = handler => {
    messageUpdateHandlers.current.push(handler);
    return () => {
      messageUpdateHandlers.current = messageUpdateHandlers.current.filter(
        h => h !== handler
      );
    };
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        newMessage,
        unreadCount,
        typingUser,
        onlineUsers,
        notification,
        notifications, // Export notifications array
        updatedMessage,
        registerNewMessageHandler,
        registerMessageUpdateHandler,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
