import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import socketManager from '../utils/socketManager';
import PropTypes from 'prop-types';

const SocketContext = createContext(undefined);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(socketManager.getSocket());
  const [connected, setConnected] = useState(socketManager.isConnected());
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

  // Function to handle authentication state changes
  useEffect(() => {
    if (!isLoading) {
      if (user && authToken) {
        // User is authenticated, initialize or update socket
        const userId = user._id;
        socketManager.updateAuthToken(authToken, userId);

        // Set up event listeners for the socket
        const currentSocket = socketManager.getSocket();
        if (currentSocket) {
          // Set up event handlers - we'll re-setup these even on reconnection
          const setupEventHandlers = () => {
            currentSocket.off('newChatMessage'); // Remove any existing listeners
            currentSocket.on('newChatMessage', message => {
              const messageWithTimestamp = {
                ...message,
                receivedAt: Date.now(),
              };
              setNewMessage(messageWithTimestamp);
              newMessageHandlers.current.forEach(h => h(messageWithTimestamp));
            });

            currentSocket.off('chat:unreadCountUpdated');
            currentSocket.on('chat:unreadCountUpdated', ({ count }) => {
              setUnreadCount(count);
            });

            currentSocket.off('chat:typing');
            currentSocket.on('chat:typing', ({ userId, isTyping }) => {
              if (isTyping) {
                setTypingUser(userId);
                setTimeout(() => {
                  setTypingUser(prev => (prev === userId ? null : prev));
                }, 3000);
              } else {
                setTypingUser(prev => (prev === userId ? null : prev));
              }
            });

            currentSocket.off('chat:onlineUsers');
            currentSocket.on('chat:onlineUsers', users => {
              setOnlineUsers(users);
            });

            currentSocket.off('notification:new');
            currentSocket.on('notification:new', notif => {
              setNotification(notif);
              setNotifications(prev => [notif, ...prev]);
              setUnreadCount(prev => prev + 1);
            });

            currentSocket.off('notification:unreadCountUpdated');
            currentSocket.on('notification:unreadCountUpdated', () => {
              // Silent update
            });

            currentSocket.off('chat:messageUpdated');
            currentSocket.on('chat:messageUpdated', message => {
              setUpdatedMessage(message);
              messageUpdateHandlers.current.forEach(h => h(message));
            });
          };

          setupEventHandlers();
          setSocket(currentSocket);
          setConnected(currentSocket.connected);

          // Re-setup event handlers after reconnection
          currentSocket.off('reconnect');
          currentSocket.on('reconnect', () => {
            console.log('[SocketContext] Reconnected, re-setting up handlers');
            setupEventHandlers();
            // Resubscribe to notifications
            socketManager.resubscribe(userId);
          });
        }
      } else if (!user || !authToken) {
        // User is not authenticated, disconnect socket
        socketManager.disconnect();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [user, authToken, isLoading]);

  // Update socket state when connection status changes
  useEffect(() => {
    const handleConnect = () => {
      console.log('[SocketContext] Socket connected:', socketManager.getSocket()?.id);
      setConnected(true);
      setSocket(socketManager.getSocket());
    };

    const handleDisconnect = reason => {
      console.log('[SocketContext] Socket disconnected with reason:', reason);
      setConnected(false);
      setSocket(null);
    };

    const handleReconnectAttempt = attemptNumber => {
      console.log('[SocketContext] Socket reconnect attempt:', attemptNumber);
    };

    const handleReconnect = () => {
      console.log('[SocketContext] Socket reconnected:', socketManager.getSocket()?.id);
      setConnected(true);
      setSocket(socketManager.getSocket());
    };

    socketManager.onConnect(handleConnect);
    socketManager.onDisconnect(handleDisconnect);

    // Add reconnection event handlers
    if (socketManager.getSocket()) {
      socketManager.getSocket().on('reconnect', handleReconnect);
      socketManager.getSocket().on('reconnect_attempt', handleReconnectAttempt);
      socketManager.getSocket().on('reconnect_error', (error) => {
        console.error('[SocketContext] Reconnect error:', error);
      });
      socketManager.getSocket().on('reconnect_failed', () => {
        console.error('[SocketContext] Reconnect failed');
      });
    }

    // Clean up event listeners on unmount
    return () => {
      if (socketManager.getSocket()) {
        socketManager.getSocket().off('reconnect', handleReconnect);
        socketManager.getSocket().off('reconnect_attempt', handleReconnectAttempt);
        socketManager.getSocket().off('reconnect_error');
        socketManager.getSocket().off('reconnect_failed');
      }
    };
  }, []);

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
