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

  useEffect(() => {
    if (!isLoading && user && authToken) {
      console.log('[SocketContext] Initializing socket connection...', {
        user: user._id,
        hasToken: !!authToken,
        tokenLength: authToken?.length
      });
      
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

      newSocket.on('connect', () => {
        console.log('[SocketContext] Socket connected successfully!', newSocket.id);
        setConnected(true);
        if (user && user._id) {
          console.log('[SocketContext] Subscribing to notifications for user:', user._id);
          newSocket.emit('subscribeToNotifications', { userId: user._id });
        }
      });

      newSocket.on('disconnect', reason => {
        console.log('[SocketContext] Socket disconnected:', reason);
        setConnected(false);
      });

      newSocket.on('connect_error', err => {
        console.error('[Socket] Connect error:', err.message);
        // If authentication fails, the socket will automatically retry
        if (err.message.includes('Authentication')) {
          console.log('Socket authentication failed, will retry...');
        }
      });

      newSocket.on('error', err => {
        console.error('[Socket] General error:', err);
      });

      newSocket.on('newChatMessage', message => {
        // Add timestamp to ensure we have the latest message data
        const messageWithTimestamp = {
          ...message,
          receivedAt: Date.now() // Add client-side timestamp for deduplication
        };
        
        setNewMessage(messageWithTimestamp);
        newMessageHandlers.current.forEach(h => h(messageWithTimestamp));
      });

      newSocket.on('chat:unreadCountUpdated', ({ count }) => {
        setUnreadCount(count);
      });

      newSocket.on('chat:typing', ({ userId, isTyping }) => {
        if (isTyping) {
          setTypingUser(userId);
          // Clear typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUser(prev => prev === userId ? null : prev);
          }, 3000);
        } else {
          setTypingUser(prev => prev === userId ? null : prev);
        }
      });

      newSocket.on('chat:onlineUsers', users => {
        setOnlineUsers(users);
      });

      newSocket.on('notification:new', notif => {
        setNotification(notif);
        setNotifications(prev => [notif, ...prev]);
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
