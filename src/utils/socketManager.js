import { io } from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
    this._isConnected = false; // Use a private property to avoid conflict with the method name
    this.connectCallbacks = [];
    this.disconnectCallbacks = [];
    this.token = null;
    this.isUserAuthenticated = false;
  }

  // Initialize the socket connection
  init(token, userId) {
    if (this.socket) {
      // If already connected with same token, don't reconnect
      if (this.token === token) {
        return this.socket;
      }
      // Otherwise, disconnect the old socket
      this.disconnect();
    }

    this.token = token;

    this.socket = io(
      (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(
        '/api/v1',
        ''
      ),
      {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
        withCredentials: true,
        auth: {
          token: token,
        },
      }
    );

    // Set up event listeners
    this.socket.on('connect', () => {
      console.log('[SocketManager] Socket connected:', this.socket.id);
      this._isConnected = true;
      if (userId) {
        this.socket.emit('subscribeToNotifications', { userId });
      }
      // Execute all connect callbacks
      this.connectCallbacks.forEach(callback => callback());
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SocketManager] Socket disconnected:', this.socket.id, 'Reason:', reason);
      this._isConnected = false;
      // Execute all disconnect callbacks
      this.disconnectCallbacks.forEach(callback => callback(reason));
    });

    this.socket.on('connect_error', (err) => {
      console.error('[SocketManager] Connect error:', err.message, 'Code:', err.code);
      if (err.message.includes('Authentication')) {
        console.warn('[SocketManager] Authentication failed');
      }
    });

    this.socket.on('token_refresh', (newToken) => {
      console.log('[SocketManager] Received token refresh event');
      this.token = newToken;
      this.socket.auth = { token: newToken };
    });

    return this.socket;
  }

  // Get current socket instance
  getSocket() {
    return this.socket;
  }

  // Check if socket is connected
  isConnected() {
    return this._isConnected;
  }

  // Add callback to execute when socket connects
  onConnect(callback) {
    this.connectCallbacks.push(callback);
    // If already connected, execute callback immediately
    if (this.isConnected) {
      callback();
    }
  }

  // Add callback to execute when socket disconnects
  onDisconnect(callback) {
    this.disconnectCallbacks.push(callback);
  }

  // Disconnect and clean up
  disconnect() {
    if (this.socket) {
      const userId = this.getUserIdFromToken(); // You might need to implement this
      if (userId) {
        this.socket.emit('unsubscribeFromNotifications', { userId });
      }
      this.socket.disconnect();
      this.socket = null;
      this._isConnected = false;
      this.token = null;
      this.isUserAuthenticated = false;
    }
  }

  // Update authentication token without disconnecting
  updateAuthToken(token, userId) {
    if (this.socket) {
      this.socket.auth = { token };
      this.token = token;
      if (userId) {
        // Resubscribe with new user ID if needed
        this.socket.emit('subscribeToNotifications', { userId });
      }
    } else if (token) {
      // If no socket exists but we have a token, initialize the socket
      this.init(token, userId);
    }
  }

  // Get user ID from token (you might need to implement actual token parsing)
  getUserIdFromToken() {
    if (!this.token) return null;
    try {
      // If using JWT, you can decode it here
      // const payload = JSON.parse(atob(this.token.split('.')[1]));
      // return payload.userId;
      // For now, return a placeholder - implement actual token decoding as needed
      return null;
    } catch (e) {
      console.error('Error parsing token:', e);
      return null;
    }
  }
}

// Create a single instance of SocketManager to ensure it persists across the app
export const socketManager = new SocketManager();
export default socketManager;