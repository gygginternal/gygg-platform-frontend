import React, { useState, useEffect } from 'react';
import ChatSidebar from '../components/ChatPage/ChatSidebar';
import ChatWindow from '../components/ChatPage/ChatWindow';
import ChatEmptyState from '../components/ChatPage/ChatEmptyState';
import styles from './ChatPage.module.css';
import apiClient from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  // Fetch contacts (conversations)
  useEffect(() => {
    const fetchContacts = async () => {
      setLoadingContacts(true);
      try {
        const res = await apiClient.get('/chat/conversations');
        // Map backend data to ChatSidebar format
        const mappedContacts = res.data.data.conversations.map(conv => ({
          id: conv.otherParty._id,
          name: `${conv.otherParty.firstName} ${conv.otherParty.lastName}`,
          avatar: conv.otherParty.profileImage || '/default-avatar.png',
          lastMessage: conv.lastMessage?.content || '',
          timestamp: conv.lastMessage?.timestamp
            ? new Date(conv.lastMessage.timestamp).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
          isOnline: false, // Optionally, implement online status
          unreadCount: conv.unreadCount || 0,
        }));
        setContacts(mappedContacts);
      } catch (err) {
        setError('Failed to load contacts');
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();
  }, []);

  // Fetch messages for selected contact
  useEffect(() => {
    if (!selectedContact) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await apiClient.get(
          `/chat/history?userId=${selectedContact.id}`
        );
        // Map backend messages to ChatWindow format
        const mappedMessages = res.data.data.messages.map(msg => ({
          id: msg._id,
          text: msg.content,
          timestamp: new Date(msg.timestamp).toLocaleString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isSent: msg.sender._id === user.id,
        }));
        setMessages(mappedMessages);
      } catch (err) {
        setError('Failed to load messages');
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedContact, user]);

  return (
    <div className={styles.container}>
      <ChatSidebar
        contacts={contacts}
        selectedContact={selectedContact}
        onContactSelect={setSelectedContact}
      />
      <div className={styles.chatArea}>
        {selectedContact ? (
          <ChatWindow
            contact={selectedContact}
            messages={messages}
            loading={loadingMessages}
          />
        ) : (
          <ChatEmptyState />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
