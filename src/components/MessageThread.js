// src/components/ChatPage/MessageThread.js
import React, { useState, useEffect, useRef } from 'react';
import styles from './MessageThread.module.css'; // Your CSS Module
import { useAuth } from '../context/AuthContext'; // To get current user ID
import PropTypes from 'prop-types';

// interface Message {
//   _id: string;
//   sender: { _id: string; fullName?: string; profileImage?: string; firstName?: string; }; // Or just senderId: string
//   content: string;
//   timestamp: string; // Or Date object
// }
// interface MessageThreadProps { messages: Message[]; }

function MessageThread({ messages = [] }) {
  const { user } = useAuth(); // Get current logged-in user
  const messagesEndRef = useRef(null); // To scroll to bottom

  // Function to format timestamp
  const formatTimestamp = timestamp => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); // Dependency on messages array

  const handleImageError = e => {
    e.target.src = '/default.png';
  };

  if (!user)
    return (
      <div className={styles.thread}>
        <p>Loading user...</p>
      </div>
    ); // Need user to style messages

  return (
    <div className={styles.thread}>
      {messages.map((msg, index) => {
        const isSender = msg.sender?._id === user._id; // Check if the current user is the sender

        // Check if previous message was from the same sender
        const prevMessage = messages[index - 1];
        const isContinuous =
          prevMessage && prevMessage.sender?._id === msg.sender?._id;

        return (
          <article
            key={msg._id || index}
            className={`${styles.messageWrapper} ${
              isSender ? styles.sent : styles.received
            } ${isContinuous ? styles.continuous : ''}`}
          >
            {!isContinuous && ( // Only show avatar for the first message in a group
              <img
                src={msg.sender?.profileImage || '/default.png'}
                alt={msg.sender?.firstName || 'User'}
                className={styles.avatar}
                onError={handleImageError}
              />
            )}
            <div className={styles.messageContent}>
              {!isContinuous && ( // Only show name for the first message in a group
                <div className={styles.messageHeader}>
                  <h3 className={styles.userName}>
                    {msg.sender?.firstName || 'User'}
                  </h3>
                </div>
              )}
              <p className={styles.messageText}>{msg.content}</p>
              {/* Show timestamp on hover or always */}
              <time className={styles.timestamp}>
                {formatTimestamp(msg.timestamp || msg.createdAt)}
              </time>
            </div>
          </article>
        );
      })}
      <div ref={messagesEndRef} /> {/* Empty div to scroll to */}
    </div>
  );
}

MessageThread.propTypes = {
  messages: PropTypes.array.isRequired,
};

export default MessageThread;
