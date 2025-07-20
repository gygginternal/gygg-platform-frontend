import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/axiosConfig';

const ChatPageSimple = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState('Loading...');
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const testAPI = async () => {
      try {
        setStatus('Testing API connection...');
        console.log('Testing API...');
        
        const response = await apiClient.get('/api/v1/chat/conversations');
        console.log('API Response:', response);
        
        if (response.data && response.data.data && response.data.data.conversations) {
          setContacts(response.data.data.conversations);
          setStatus(`Success! Found ${response.data.data.conversations.length} conversations`);
        } else {
          setStatus('API connected but no conversations found');
        }
      } catch (error) {
        console.error('API Error:', error);
        setStatus(`Error: ${error.message}`);
      }
    };

    if (user) {
      testAPI();
    } else {
      setStatus('No user logged in');
    }
  }, [user]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Chat System Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <strong>Status:</strong> {status}
      </div>

      {user ? (
        <div style={{ marginBottom: '20px' }}>
          <h3>User Info:</h3>
          <p>Name: {user.firstName} {user.lastName}</p>
          <p>Email: {user.email}</p>
          <p>ID: {user._id || user.id}</p>
        </div>
      ) : (
        <div style={{ color: 'red' }}>
          <p>❌ No user logged in</p>
        </div>
      )}

      <div>
        <h3>API Test Results:</h3>
        {contacts.length > 0 ? (
          <div>
            <p>✅ Found {contacts.length} conversations</p>
            <ul>
              {contacts.slice(0, 3).map((conv, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>
                  <strong>Conversation {index + 1}:</strong>
                  <br />
                  Type: {conv.type || 'unknown'}
                  <br />
                  Participants: {conv.participants?.length || 0}
                  <br />
                  Last Message: {conv.lastMessage?.content || 'None'}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No conversations to display</p>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '10px', backgroundColor: '#e8f4fd', borderRadius: '5px' }}>
        <h4>Troubleshooting:</h4>
        <ol>
          <li>Check browser console for errors (F12)</li>
          <li>Verify backend server is running</li>
          <li>Check if user is properly authenticated</li>
          <li>Test API endpoints manually</li>
        </ol>
      </div>
    </div>
  );
};

export default ChatPageSimple;