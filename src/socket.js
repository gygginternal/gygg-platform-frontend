import io from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_BACKEND_URL?.replace('/api/v1', '') ||
  'http://localhost:5000';

const socket = io(SOCKET_URL, {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  autoConnect: false, // Don't auto-connect, let SocketContext handle this
  withCredentials: true,
});

socket.on('connect_error', error => {
  console.error('Socket connection error:', error.message);
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
