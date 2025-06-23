import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/axiosConfig';
import styles from './ChatWindow.module.css';
import MessageThread from './MessageThread';
import MessageInput from './MessageInput';
import PropTypes from 'prop-types';
import socket from '../socket'; // Import the shared socket instance
import ChatHeader from './ChatHeader';

function ChatWindow({ selectedContractId, chatPartner, layoutClasses = {} }) {
  const { user } = useAuth();
  const userId = user?._id || null; // Get user ID from context, fallback to null if not available
  const chatPartnerId = chatPartner?.id || null; // Get chat partner ID from props, fallback to null if not available

  const [messages, setMessages] = useState([]);

  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');

  // Fetch messages when a contract is selected
  const fetchMessages = useCallback(async () => {
    if (!selectedContractId) {
      setMessages([]); // Clear messages if no contract selected
      return;
    }
    setLoadingMessages(true);
    setError('');
    try {
      const response = await apiClient.get(
        `/chat/contracts/${selectedContractId}/messages`
      );
      setMessages(response.data.data.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages.');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedContractId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!userId || !chatPartnerId) return;

    // Subscribe to the chat channel
    const chatChannel = `chat:${userId}:${chatPartnerId}`;
    socket.emit('subscribeToChat', {
      currentUserId: userId,
      targetUserId: chatPartnerId,
    });

    // Listen for new chat messages
    socket.on('newChatMessage', message => {
      // Only add the message if the sender is not the current user
      if (message.sender !== userId) {
        setMessages(prevMessages => [...prevMessages, message]);
      }
    });

    // Cleanup on component unmount
    return () => {
      socket.off('newChatMessage');
    };
  }, [userId, chatPartnerId]);

  // Handler for sending a new message
  const handleSendMessage = async messageText => {
    if (!selectedContractId) {
      setError('No conversation selected to send message.');
      throw new Error('No conversation selected.'); // Let MessageInput handle its sending state
    }
    setError('');
    try {
      const response = await apiClient.post(
        `/chat/contracts/${selectedContractId}/messages`,
        {
          message: messageText, // Backend expects 'message' field
        }
      );
      // Optimistically add the new message to the local state
      setMessages(prevMessages => [
        ...prevMessages,
        { ...response.data.data.message, sender: user }, // Mark as sent by the current user
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
      throw err; // Re-throw to let MessageInput know it failed
    }
  };

  const handleMessageClick = message => {
    // Implementation of handleMessageClick
  };

  return (
    <section className={styles.chatWindow}>
      <div className={styles.container}>
        <div className={styles.chatContent}>
          <ChatHeader chatPartner={chatPartner} />
          {error && <p className={styles.errorMessage}>{error}</p>}
          {loadingMessages ? (
            <div className={styles.loadingMessageContainer}>
              <p>Loading messages...</p>
            </div>
          ) : selectedContractId ? (
            <>
              <div className={layoutClasses.thread || ''}>
                <MessageThread messages={messages} />
              </div>
              <div className={layoutClasses.input || ''}>
                <MessageInput
                  onSendMessage={handleSendMessage}
                  disabled={!selectedContractId}
                />
              </div>
            </>
          ) : (
            <div className={styles.noConversationSelectedContainer}>
              <p>Select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

ChatWindow.propTypes = {
  selectedContractId: PropTypes.string,
  chatPartner: PropTypes.object,
  layoutClasses: PropTypes.object,
};

export default ChatWindow;
