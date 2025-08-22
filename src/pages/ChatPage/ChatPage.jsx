import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatSidebar from '../../components/ChatPage/ChatSidebar';
import ChatWindow from '../../components/ChatPage/ChatWindow';
import ChatEmptyState from '../../components/ChatPage/ChatEmptyState';
import styles from './ChatPage.module.css';
import apiClient from '../../api/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const ChatPage = () => {
  const { user } = useAuth();
  const { userId: routeUserId } = useParams();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const {
    socket,
    onlineUsers,
    unreadCount,
    notification,
    registerNewMessageHandler,
    registerMessageUpdateHandler,
  } = useSocket();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper function to sort contacts by most recent message timestamp
  const sortContactsByTimestamp = (contactsArray) => {
    return contactsArray.sort((a, b) => {
      // Parse timestamps with validation
      const timestampA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp) : new Date(0);
      const timestampB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp) : new Date(0);
      
      // Validate dates
      const validTimestampA = isNaN(timestampA.getTime()) ? new Date(0) : timestampA;
      const validTimestampB = isNaN(timestampB.getTime()) ? new Date(0) : timestampB;
      
      // Debug logging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Sorting: ${a.name} (${validTimestampA.toISOString()}) vs ${b.name} (${validTimestampB.toISOString()})`);
      }
      
      return validTimestampB - validTimestampA; // Descending order (newest first)
    });
  };

  // Fetch contacts (conversations)
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await apiClient.get('/chat/conversations');
        // Map backend data to ChatSidebar format
        const mappedContacts = res.data.data.conversations.map(conv => ({
          id: conv.otherParty._id,
          name: `${conv.otherParty.firstName} ${conv.otherParty.lastName}`,
          avatar: conv.otherParty.profileImage || '/default-avatar.png',
          lastMessage: conv.lastMessage?.type === 'image' 
            ? '📷 Image' 
            : conv.lastMessage?.content || '',
          timestamp: conv.lastMessage?.timestamp
            ? new Date(conv.lastMessage.timestamp).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
          lastMessageTimestamp: conv.lastMessage?.timestamp || new Date(0).toISOString(), // Keep raw timestamp for sorting
          isOnline: false, // Optionally, implement online status
          unreadCount: conv.unreadCount || 0,
        }));
        
        // Sort contacts by last message timestamp (most recent first)
        const sortedContacts = sortContactsByTimestamp(mappedContacts);
        
        setContacts(sortedContacts);
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
        console.error('Failed to load contacts:', err);
      }
    };
    fetchContacts();
  }, [routeUserId]);

  // Fetch messages for selected contact (with pagination) - Facebook style
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
        type: msg.type || 'text',
        attachment: msg.attachment || null,
        timestamp: msg.timestamp, // Keep original timestamp for sorting
        displayTime: new Date(msg.timestamp).toLocaleString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isSent: msg.sender._id === user.id,
        status: 'sent', // All fetched messages are sent
        tempId: null // No temp ID for real messages
      }));
      
      if (prepend) {
        // For pagination (loading older messages), prepend to beginning
        setMessages(prev => {
          // Remove duplicates and maintain chronological order
          const existingIds = new Set(prev.map(m => m.id));
          const newMessages = mappedMessages.filter(m => !existingIds.has(m.id));
          return [...newMessages, ...prev];
        });
      } else {
        // For initial load, replace all messages
        setMessages(mappedMessages);
      }
      
      setHasMore(mappedMessages.length === 50); // Has more if we got full page
      setPage(pageOverride);
    } catch (err) {
      console.error('Failed to load messages:', err);
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
      const room = `chat:${user.id}:${selectedContact.id}`;
      socket.emit('join', room);
      return () => {
        socket.emit('leave', room);
      };
    }
  }, [socket, selectedContact, user.id]);

  // Facebook-style message handling with optimistic updates
  useEffect(() => {
    if (!selectedContact) return;
    
    // Handler for new messages - Facebook Messenger style
    const handleNewMessage = message => {
      // Check if message is for current conversation
      const isForCurrentChat = 
        (message.sender && message.sender._id === selectedContact.id && message.receiver === user.id) ||
        (message.sender && message.sender._id === user.id && message.receiver === selectedContact.id);
      
      if (isForCurrentChat) {
        const newMsg = {
          id: message._id,
          text: message.content,
          type: message.type || 'text',
          attachment: message.attachment || null,
          timestamp: message.timestamp,
          displayTime: new Date(message.timestamp).toLocaleString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isSent: message.sender._id === user.id,
          status: 'sent',
          tempId: null
        };
        
        setMessages(prevMsgs => {
          // Check for duplicates by ID or tempId
          const existsById = prevMsgs.some(msg => msg.id === newMsg.id);
          if (existsById) return prevMsgs;
          
          // If this is our own message, replace any temp message
          if (newMsg.isSent) {
            const withoutTemp = prevMsgs.filter(msg => 
              !(msg.tempId && msg.isSent && !msg.id && 
                Math.abs(new Date(msg.timestamp) - new Date(newMsg.timestamp)) < 5000)
            );
            return [...withoutTemp, newMsg].sort((a, b) => 
              new Date(a.timestamp) - new Date(b.timestamp)
            );
          }
          
          // For received messages, just add and sort
          return [...prevMsgs, newMsg].sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
          );
        });
      }
      
      // Update sidebar for current conversation
      if (selectedContact && (
        message.sender._id === selectedContact.id || 
        message.receiver === selectedContact.id
      )) {
        setContacts(prevContacts => {
          const updatedContacts = prevContacts.map(contact => {
            if (contact.id === selectedContact.id) {
              return {
                ...contact,
                lastMessage: message.type === 'image' ? '📷 Image' : message.content,
                timestamp: new Date(message.timestamp).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                lastMessageTimestamp: message.timestamp,
                unreadCount: message.sender._id === user.id ? 0 : (contact.unreadCount || 0)
              };
            }
            return contact;
          });
          
          // Re-sort contacts by last message timestamp (most recent first)
          const sortedContacts = sortContactsByTimestamp(updatedContacts);
          
          // Debug logging
          if (process.env.NODE_ENV === 'development') {
            console.log('Updated contacts order:', sortedContacts.map(c => ({ name: c.name, timestamp: c.lastMessageTimestamp })));
          }
          
          return sortedContacts;
        });
      }
    };
    
    // Handler for message updates
    const handleMessageUpdate = updatedMsg => {
      setMessages(prevMsgs =>
        prevMsgs.map(msg =>
          msg.id === updatedMsg._id
            ? {
                ...msg,
                text: updatedMsg.content,
                timestamp: updatedMsg.timestamp,
                displayTime: new Date(updatedMsg.timestamp).toLocaleString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                status: 'sent'
              }
            : msg
        )
      );
    };
    
    // Register handlers
    const unregisterNew = registerNewMessageHandler(handleNewMessage);
    const unregisterUpdate = registerMessageUpdateHandler(handleMessageUpdate);
    
    return () => {
      unregisterNew();
      unregisterUpdate();
    };
  }, [selectedContact, user.id, registerNewMessageHandler, registerMessageUpdateHandler]);

  // Optimistic message sending function
  const addOptimisticMessage = (content, type = 'text', attachment = null) => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const optimisticMsg = {
      id: null,
      tempId,
      text: content,
      type,
      attachment,
      timestamp: new Date().toISOString(),
      displayTime: new Date().toLocaleString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isSent: true,
      status: 'sending'
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    return tempId;
  };

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

  // Global message handler for updating sidebar (messages from other conversations)
  useEffect(() => {
    const handleGlobalNewMessage = message => {
      // Update sidebar for messages not in current conversation
      const isCurrentChat = selectedContact && 
        ((message.sender && message.sender._id === selectedContact.id) ||
         (message.receiver === selectedContact.id));
      
      if (!isCurrentChat) {
        // Find the contact in sidebar and update
        const otherUserId = message.sender._id === user.id ? message.receiver : message.sender._id;
        
        setContacts(prevContacts => {
          const existingContactIndex = prevContacts.findIndex(c => c.id === otherUserId);
          
          if (existingContactIndex >= 0) {
            // Update existing contact
            const updatedContacts = [...prevContacts];
            const contact = updatedContacts[existingContactIndex];
            updatedContacts[existingContactIndex] = {
              ...contact,
              lastMessage: message.type === 'image' ? '📷 Image' : message.content,
              timestamp: new Date(message.timestamp).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              lastMessageTimestamp: message.timestamp,
              unreadCount: message.sender._id === user.id ? 0 : (contact.unreadCount || 0) + 1
            };
            
            // Re-sort all contacts by last message timestamp (most recent first)
            return sortContactsByTimestamp(updatedContacts);
          } else if (message.sender._id !== user.id) {
            // Add new contact if message is from someone not in contacts
            const newContact = {
              id: message.sender._id,
              name: message.sender.firstName + ' ' + (message.sender.lastName || ''),
              avatar: message.sender.profileImage?.url || '/default-avatar.png',
              lastMessage: message.type === 'image' ? '📷 Image' : message.content,
              timestamp: new Date(message.timestamp).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              lastMessageTimestamp: message.timestamp, // Add this for proper sorting
              isOnline: false,
              unreadCount: 1
            };
            return sortContactsByTimestamp([newContact, ...prevContacts]);
          }
          
          return prevContacts;
        });
      }
    };
    
    const unregisterGlobal = registerNewMessageHandler(handleGlobalNewMessage);
    return () => unregisterGlobal();
  }, [selectedContact, user.id, registerNewMessageHandler]);

  // Notification handling (popup removed)
  useEffect(() => {
    if (notification) {
      // New notification received and processed
      // You can add other notification handling here if needed
      // like updating a notification badge or showing a toast
    }
  }, [notification]);

  // Debug: Log contacts order when it changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && contacts.length > 0) {
      console.log('Current contacts order:', contacts.map(c => ({ 
        name: c.name, 
        lastMessage: c.lastMessage,
        timestamp: c.lastMessageTimestamp,
        displayTime: c.timestamp 
      })));
    }
  }, [contacts]);

  // Handle mobile back navigation
  const handleMobileBack = () => {
    setSelectedContact(null);
  };

  return (
    <div className={`${styles.container} ${selectedContact && isMobile ? styles.chatOpen : ''}`}>
      {(!isMobile || !selectedContact) && (
        <ChatSidebar
          contacts={contacts}
          selectedContact={selectedContact}
          onContactSelect={setSelectedContact}
        />
      )}
      
      {(!isMobile || selectedContact) && (
        <div className={styles.chatArea}>
          {selectedContact ? (
            <ChatWindow
              contact={selectedContact}
              messages={messages}
              loading={loadingMessages}
              onMessageSent={addOptimisticMessage}
              onLoadMore={loadMoreMessages}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onMobileBack={isMobile ? handleMobileBack : null}
            />
          ) : (
            <ChatEmptyState />
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
