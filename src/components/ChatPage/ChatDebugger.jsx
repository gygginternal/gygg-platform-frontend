import React, { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

const ChatDebugger = ({ selectedContact }) => {
  const {
    socket,
    connected,
    newMessage,
    unreadCount,
    typingUser,
    onlineUsers,
  } = useSocket();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), { timestamp, message, type }]);
  };

  useEffect(() => {
    if (socket) {
      addLog('Socket instance available', 'success');

      // Listen to all chat-related events for debugging
      const events = [
        'chat:newMessage',
        'newChatMessage',
        'chat:unreadCountUpdated',
        'chat:typing',
        'chat:onlineUsers',
      ];

      events.forEach(eventName => {
        socket.on(eventName, data => {
          addLog(`Event: ${eventName}`, 'info');
          console.log(`[Chat Debug] ${eventName}:`, data);
        });
      });

      return () => {
        events.forEach(eventName => {
          socket.off(eventName);
        });
      };
    } else {
      addLog('No socket instance', 'error');
    }
  }, [socket]);

  useEffect(() => {
    if (newMessage) {
      addLog(
        `New message received from: ${newMessage.sender?._id || 'unknown'}`,
        'success'
      );
    }
  }, [newMessage]);

  useEffect(() => {
    if (selectedContact && socket) {
      const room = `chat:${user.id}:${selectedContact.id}`;
      addLog(`Joined room: ${room}`, 'info');
      socket.emit('join', room);

      return () => {
        addLog(`Left room: ${room}`, 'info');
        socket.emit('leave', room);
      };
    }
  }, [selectedContact, socket, user.id]);

  const testMessage = () => {
    if (socket && selectedContact) {
      const testData = {
        receiverId: selectedContact.id,
        message: 'Test message from debugger',
        type: 'text',
      };
      addLog('Sending test message...', 'info');
      socket.emit('chat:sendMessage', testData);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
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
        Chat WebSocket Debug
      </div>

      <div style={{ marginBottom: '5px' }}>
        <strong>Status:</strong>{' '}
        {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      <div style={{ marginBottom: '5px' }}>
        <strong>User ID:</strong> {user?.id || 'Not logged in'}
      </div>

      <div style={{ marginBottom: '5px' }}>
        <strong>Selected Contact:</strong> {selectedContact?.id || 'None'}
      </div>

      <div style={{ marginBottom: '5px' }}>
        <strong>Unread Count:</strong> {unreadCount}
      </div>

      <div style={{ marginBottom: '5px' }}>
        <strong>Typing User:</strong> {typingUser || 'None'}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Online Users:</strong> {onlineUsers?.length || 0}
      </div>

      <button
        onClick={testMessage}
        disabled={!selectedContact || !connected}
        style={{
          padding: '5px 10px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '10px',
          fontSize: '11px',
        }}
      >
        Test Message
      </button>

      <div
        style={{
          maxHeight: '150px',
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
                    : 'black',
              fontSize: '10px',
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

export default ChatDebugger;
