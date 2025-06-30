import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
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
  const [updatedMessage, setUpdatedMessage] = useState(null);
  const { user } = useAuth();
  const newMessageHandlers = useRef([]);
  const messageUpdateHandlers = useRef([]);

  useEffect(() => {
    if (user) {
      const newSocket = io(
        process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',
        {
          path: '/socketio',
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
          autoConnect: true,
          withCredentials: true,
          forceNew: true,
          auth: {
            token: localStorage.getItem('token'),
          },
        }
      );

      newSocket.on('connect', () => {
        setConnected(true);
        if (user && user.id) {
          newSocket.emit('subscribeToNotifications', { userId: user.id });
        }
      });

      newSocket.on('disconnect', () => {
        setConnected(false);
      });

      newSocket.on('chat:newMessage', message => {
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
        setNotification(notif);
      });

      newSocket.on('newChatMessage', message => {
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
        if (user && user.id) {
          newSocket.emit('unsubscribeFromNotifications', { userId: user.id });
        }
        newSocket.close();
      };
    }
  }, [user]);

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
