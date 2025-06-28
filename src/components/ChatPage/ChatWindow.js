// import React from 'react';
import { useState } from 'react';
import { MoreVertical, Smile, Paperclip, Mic } from 'lucide-react';
import styles from './ChatWindow.module.css';
import PropTypes from 'prop-types';

const ChatWindow = ({ contact, messages }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = e => {
    e.preventDefault();
    if (newMessage.trim()) {
      // In a real app, you would send the message here
      setNewMessage('');
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
        <div className={styles.messagesList}>
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
        </div>
      </div>

      <div className={styles.inputContainer}>
        <form onSubmit={handleSendMessage} className={styles.inputForm}>
          <Paperclip className={styles.attachIcon} />
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
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

ChatWindow.propTypes = {
  contact: PropTypes.object,
  messages: PropTypes.arrayOf(PropTypes.object),
};

export default ChatWindow;
