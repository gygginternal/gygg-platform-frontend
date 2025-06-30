import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatSidebar from '../components/ChatPage/ChatSidebar';
import ChatWindow from '../components/ChatPage/ChatWindow';
import ChatEmptyState from '../components/ChatPage/ChatEmptyState';
import styles from './ChatPage.module.css';
import apiClient from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const ChatPage = () => {
  const { user } = useAuth();
  const { userId: routeUserId } = useParams();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const {
    socket,
    newMessage,
    onlineUsers,
    unreadCount,
    notification,
    registerNewMessageHandler,
    registerMessageUpdateHandler,
  } = useSocket();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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
        // Auto-select contact if routeUserId is present
        if (routeUserId) {
          const found = mappedContacts.find(c => c.id === routeUserId);
          if (found) {
            setSelectedContact(found);
          } else {
            // Fetch user info if not in contacts
            try {
              const userRes = await apiClient.get(
                `/users/public/${routeUserId}`
              );
              const u = userRes.data.data.user;
              setSelectedContact({
                id: u._id,
                name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
                avatar: u.profileImage || '/default-avatar.png',
                lastMessage: '',
                timestamp: '',
                isOnline: false,
                unreadCount: 0,
              });
            } catch (e) {
              setSelectedContact(null);
            }
          }
        }
      } catch (err) {
        setError('Failed to load contacts');
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();
  }, [routeUserId]);

  // Fetch messages for selected contact (with pagination)
  const fetchMessages = async (pageOverride = 1, prepend = false) => {
    if (!selectedContact) return;
    if (pageOverride > 1) setLoadingMore(true);
    else setLoadingMessages(true);
    try {
      const res = await apiClient.get(
        `/chat/history?userId=${selectedContact.id}&page=${pageOverride}`
      );
      const mappedMessages = res.data.data.messages.map(msg => ({
        id: msg._id,
        text: msg.content,
        timestamp: new Date(msg.timestamp).toLocaleString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isSent: msg.sender._id === user.id,
      }));
      if (prepend) {
        setMessages(prev => [...mappedMessages, ...prev]);
      } else {
        setMessages(mappedMessages);
      }
      setHasMore(mappedMessages.length > 0 && mappedMessages.length === 50); // 50 is the backend default limit
      setPage(pageOverride);
    } catch (err) {
      setError('Failed to load messages');
      if (!prepend) setMessages([]);
    } finally {
      if (pageOverride > 1) setLoadingMore(false);
      else setLoadingMessages(false);
    }
  };

  // Load more messages (for infinite scroll)
  const loadMoreMessages = () => {
    if (!hasMore || loadingMore) return;
    fetchMessages(page + 1, true);
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchMessages(1);
  }, [selectedContact, user]);

  // Join chat room for real-time updates when selectedContact changes
  useEffect(() => {
    if (socket && selectedContact) {
      const room = [user.id, selectedContact.id].sort().join(':');
      socket.emit('join', room);
      return () => {
        socket.emit('leave', room);
      };
    }
  }, [socket, selectedContact, user.id]);

  // Register real-time message handlers for the selected contact
  useEffect(() => {
    if (!selectedContact) return;
    // Handler for new messages
    const handleNewMessage = message => {
      if (
        (message.sender && message.sender._id === selectedContact.id) ||
        message.receiver === selectedContact.id
      ) {
        fetchMessages(); // Always fetch latest messages for perfect sync
      }
    };
    // Handler for message updates (e.g., edits, read receipts)
    const handleMessageUpdate = updatedMsg => {
      setMessages(prevMsgs =>
        prevMsgs.map(msg =>
          msg.id === updatedMsg._id
            ? {
                ...msg,
                text: updatedMsg.content,
                // Optionally update timestamp or other fields if needed
              }
            : msg
        )
      );
    };
    // Register handlers
    const unregisterNew = registerNewMessageHandler(handleNewMessage);
    const unregisterUpdate = registerMessageUpdateHandler(handleMessageUpdate);
    // Cleanup
    return () => {
      unregisterNew();
      unregisterUpdate();
    };
  }, [
    selectedContact,
    user.id,
    registerNewMessageHandler,
    registerMessageUpdateHandler,
  ]);

  // Update contacts' online status and unread count in real time
  useEffect(() => {
    if (contacts.length && onlineUsers) {
      setContacts(prevContacts =>
        prevContacts.map(c => ({
          ...c,
          isOnline: onlineUsers.includes(c.id),
          unreadCount: c.unreadCount, // will be updated below
        }))
      );
    }
  }, [onlineUsers]);

  useEffect(() => {
    if (contacts.length && typeof unreadCount === 'number' && selectedContact) {
      setContacts(prevContacts =>
        prevContacts.map(c =>
          c.id === selectedContact.id ? { ...c, unreadCount } : c
        )
      );
    }
  }, [unreadCount, selectedContact]);

  // Show notification (simple alert for now)
  useEffect(() => {
    if (notification) {
      alert(notification.message || 'You have a new notification!');
    }
  }, [notification]);

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
            onMessageSent={() => fetchMessages(1)}
            onLoadMore={loadMoreMessages}
            hasMore={hasMore}
            loadingMore={loadingMore}
          />
        ) : (
          <ChatEmptyState />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
