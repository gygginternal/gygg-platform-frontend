import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_BACKEND_URL, { path: '/socketio' });

export default socket;
