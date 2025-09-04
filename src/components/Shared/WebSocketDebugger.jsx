import React, { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

const WebSocketDebugger = () => {
  const { socket, connected, notification, notifications } = useSocket();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), { timestamp, message, type }]);
  };

  useEffect(() => {
    if (socket) {
      addLog('Socket instance created', 'success');

      // Listen to all socket events for debugging
      socket.onAny((eventName, ...args) => {
        addLog(`Event received: ${eventName}`, 'info');
        console.log(`[WebSocket Debug] Event: ${eventName}`, args);
      });

      socket.on('connect', () => {
        addLog('Socket connected', 'success');
      });

      socket.on('disconnect', reason => {
        addLog(`Socket disconnected: ${reason}`, 'error');
      });

      socket.on('connect_error', error => {
        addLog(`Connection error: ${error.message}`, 'error');
      });

      return () => {
        socket.offAny();
      };
    } else {
      addLog('No socket instance', 'warning');
    }
  }, [socket]);

  useEffect(() => {
    if (notification) {
      addLog(`New notification received: ${notification.message}`, 'success');
    }
  }, [notification]);

  useEffect(() => {
    addLog(
      `Notifications array updated: ${notifications.length} items`,
      'info'
    );
  }, [notifications]);

  const testNotification = () => {
    if (socket && connected) {
      addLog('Testing notification emission...', 'info');
      // This would typically be done from the backend, but we can test the socket connection
      socket.emit('test', { message: 'Test from frontend' });
    } else {
      addLog('Socket not connected', 'error');
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        width: '300px',
        maxHeight: '400px',
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
        WebSocket Debug Panel
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong>{' '}
        {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>User ID:</strong> {user?._id || 'Not logged in'}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Socket ID:</strong> {socket?.id || 'No socket'}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Notifications:</strong> {notifications.length}
      </div>

      <button
        onClick={testNotification}
        style={{
          padding: '5px 10px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '10px',
        }}
      >
        Test Connection
      </button>

      <div
        style={{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #eee',
          padding: '5px',
          borderRadius: '4px',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Logs:</div>
        {logs.map((log, index) => (
          <div
            key={index}
            style={{
              color:
                log.type === 'error'
                  ? 'red'
                  : log.type === 'success'
                    ? 'green'
                    : log.type === 'warning'
                      ? 'orange'
                      : 'black',
              fontSize: '11px',
              marginBottom: '2px',
            }}
          >
            [{log.timestamp}] {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebSocketDebugger;
