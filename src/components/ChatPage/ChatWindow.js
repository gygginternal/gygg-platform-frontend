import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Smile, Paperclip, Mic } from 'lucide-react';
import apiClient from '../../api/axiosConfig';
import styles from './ChatWindow.module.css';
import { useSocket } from '../../contexts/SocketContext';

const ChatWindow = ({
  contact,
  messages,
  onMessageSent,
  onLoadMore,
  hasMore,
  loadingMore,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { socket, typingUser } = useSocket();
  const messagesEndRef = useRef(null);
  const messagesListRef = useRef(null);

  // Auto-scroll to bottom when messages change, but only if user is near the bottom
  useEffect(() => {
    const messagesList = messagesEndRef.current?.parentNode;
    if (messagesList) {
      const threshold = 120; // px from bottom to auto-scroll
      const isNearBottom =
        messagesList.scrollHeight -
          messagesList.scrollTop -
          messagesList.clientHeight <
        threshold;
      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleSendMessage = async e => {
    e.preventDefault();
    if (newMessage.trim()) {
      setSending(true);
      try {
        await apiClient.post('/chat/send', {
          receiverId: contact.id,
          message: newMessage,
          type: 'text',
        });
        setNewMessage('');
        if (onMessageSent) onMessageSent();
      } catch (err) {
        alert('Failed to send message');
      } finally {
        setSending(false);
      }
    }
  };

  // Emit typing event
  const handleTyping = e => {
    setNewMessage(e.target.value);
    if (socket && contact) {
      socket.emit('chat:typing', { to: contact.id });
    }
  };

  // Infinite scroll: load more when scrolled to top
  const handleScroll = () => {
    const el = messagesListRef.current;
    if (el && el.scrollTop === 0 && hasMore && !loadingMore) {
      onLoadMore && onLoadMore();
    }
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>
        <div className={styles.contactInfo}>
          <img
            src={contact.avatar}
            alt={contact.name}
            className={styles.avatar}
          />
          <div className={styles.contactDetails}>
            <span className={styles.contactName}>{contact.name}</span>
            {contact.isOnline && (
              <span className={styles.onlineStatus}>Online</span>
            )}
          </div>
        </div>
        <MoreVertical className={styles.moreIcon} />
      </div>

      <div className={styles.messagesContainer}>
        <div
          className={styles.messagesList}
          ref={messagesListRef}
          onScroll={handleScroll}
        >
          {loadingMore && (
            <div className={styles.loadingMore}>Loading more...</div>
          )}
          {messages.map(message => (
            <div
              key={message.id}
              className={`${styles.messageWrapper} ${
                message.isSent ? styles.sent : styles.received
              }`}
            >
              <div className={styles.message}>
                <span className={styles.messageText}>{message.text}</span>
                <span className={styles.messageTime}>{message.timestamp}</span>
              </div>
            </div>
          ))}
          {/* Typing indicator */}
          {typingUser === contact.id && (
            <div className={styles.typingIndicator}>Typing...</div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={styles.inputContainer}>
        <form onSubmit={handleSendMessage} className={styles.inputForm}>
          <Paperclip className={styles.attachIcon} />
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type your message here..."
            className={styles.messageInput}
          />
          <Smile className={styles.emojiIcon} />
          <Mic className={styles.micIcon} />
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
