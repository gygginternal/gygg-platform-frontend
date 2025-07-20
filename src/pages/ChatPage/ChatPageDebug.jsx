import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const ChatPageDebug = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [debugInfo, setDebugInfo] = useState({
    user: null,
    socket: null,
    error: null,
    apiTest: 'Not tested'
  });

  useEffect(() => {
    const runDebug = async () => {
      try {
        console.log('=== CHAT DEBUG START ===');
        
        // Test 1: User authentication
        console.log('User:', user);
        
        // Test 2: Socket connection
        console.log('Socket:', socket);
        
        // Test 3: API test (simple fetch)
        try {
          const response = await fetch('/api/v1/chat/conversations', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('API Response Status:', response.status);
          const data = await response.json();
          console.log('API Response Data:', data);
          
          setDebugInfo({
            user: user ? 'Authenticated' : 'Not authenticated',
            socket: socket ? 'Connected' : 'Not connected',
            error: null,
            apiTest: response.ok ? 'Success' : `Failed: ${response.status}`
          });
        } catch (apiError) {
          console.error('API Test Error:', apiError);
          setDebugInfo({
            user: user ? 'Authenticated' : 'Not authenticated',
            socket: socket ? 'Connected' : 'Not connected',
            error: apiError.message,
            apiTest: `Error: ${apiError.message}`
          });
        }
        
        console.log('=== CHAT DEBUG END ===');
      } catch (error) {
        console.error('Debug Error:', error);
        setDebugInfo({
          user: 'Error',
          socket: 'Error',
          error: error.message,
          apiTest: 'Error'
        });
      }
    };

    runDebug();
  }, [user, socket]);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace', 
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>🔧 Chat System Debug</h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h3>System Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px' }}>
          <strong>User Auth:</strong>
          <span style={{ color: user ? 'green' : 'red' }}>
            {debugInfo.user} {user && `(${user.firstName} ${user.lastName})`}
          </span>
          
          <strong>Socket:</strong>
          <span style={{ color: socket ? 'green' : 'red' }}>
            {debugInfo.socket}
          </span>
          
          <strong>API Test:</strong>
          <span style={{ color: debugInfo.apiTest.includes('Success') ? 'green' : 'red' }}>
            {debugInfo.apiTest}
          </span>
          
          {debugInfo.error && (
            <>
              <strong>Error:</strong>
              <span style={{ color: 'red' }}>{debugInfo.error}</span>
            </>
          )}
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h3>Browser Console</h3>
        <p>Open your browser's developer tools (F12) and check the Console tab for detailed logs.</p>
        <p>Look for any red error messages that might indicate what's causing the white screen.</p>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h3>Troubleshooting Steps</h3>
        <ol>
          <li><strong>Check Authentication:</strong> Make sure you're logged in</li>
          <li><strong>Check Backend:</strong> Ensure your backend server is running</li>
          <li><strong>Check API Endpoints:</strong> Verify the API is responding</li>
          <li><strong>Check Browser Console:</strong> Look for JavaScript errors</li>
          <li><strong>Check Network Tab:</strong> See if API calls are failing</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Reload Page
        </button>
        
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear Storage & Reload
        </button>
      </div>
    </div>
  );
};

export default ChatPageDebug;