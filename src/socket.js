import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  path: '/socketio',
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  autoConnect: true,
  withCredentials: true,
  forceNew: true,
});

socket.on('connect_error', error => {
  console.error('Socket connection error:', error);
});

socket.on('connect', () => {
  console.log('Socket connected successfully');
});

socket.on('disconnect', reason => {
  console.log('Socket disconnected:', reason);
});

socket.on('error', error => {
  console.error('Socket error:', error);
});

export default socket;
