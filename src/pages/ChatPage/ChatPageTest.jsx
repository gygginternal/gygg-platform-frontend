import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';

const ChatPageTest = () => {
  const { user } = useAuth();
  const { userId: routeUserId } = useParams();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simple test to fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        console.log('Fetching contacts...');
        const res = await apiClient.get('/api/v1/chat/conversations');
        console.log('Response:', res.data);
        
        if (res.data && res.data.data && res.data.data.conversations) {
          const mappedContacts = res.data.data.conversations.map(conv => {
            const otherParty = conv.otherParty || (conv.participants && conv.participants[0]);
            return {
              id: conv.id || otherParty?._id,
              name: `${otherParty?.firstName || ''} ${otherParty?.lastName || ''}`.trim() || 'Unknown',
              avatar: otherParty?.profileImage || '/default-avatar.png',
              lastMessage: conv.lastMessage?.content || '',
              unreadCount: conv.unreadCount || 0,
            };
          });
          setContacts(mappedContacts);
        } else {
          setContacts([]);
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchContacts();
    }
  }, [user]);

  if (!user) {
    return <div>Please log in to access chat</div>;
  }

  if (loading) {
    return <div>Loading chat...</div>;
  }

  if (error) {
    return (
      <div>
        <h3>Error loading chat</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Chat Test Page</h2>
      <p>User: {user.firstName} {user.lastName}</p>
      <p>Route User ID: {routeUserId || 'None'}</p>
      
      <h3>Contacts ({contacts.length})</h3>
      {contacts.length === 0 ? (
        <p>No conversations found</p>
      ) : (
        <ul>
          {contacts.map(contact => (
            <li key={contact.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}>
              <strong>{contact.name}</strong>
              <br />
              <small>ID: {contact.id}</small>
              <br />
              <small>Last Message: {contact.lastMessage || 'No messages'}</small>
              <br />
              <small>Unread: {contact.unreadCount}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatPageTest;