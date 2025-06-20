import React, { useState, useEffect } from 'react';
// import cn from "classnames"; // No longer needed
import styles from './ConversationsList.module.css'; // Your CSS Module
import apiClient from '../api/axiosConfig'; // Adjust path
import logger from '../utils/logger'; // Optional, adjust path
import { useAuth } from '../context/AuthContext'; // Adjust path
import MessageDesign from './MessageDesign'; // Import MessageDesign component
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const ConversationsList = ({ onSelect }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/chat/conversations');
      setConversations(response.data.data.conversations);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = conversation => {
    if (onSelect) {
      // Pass contractId and chat partner object to parent
      onSelect(conversation._id, conversation.otherParty);
    } else {
      navigate(`/messages/${conversation._id}`);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading conversations...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Messages</h2>
      {conversations.length === 0 ? (
        <div className={styles.emptyState}>No conversations yet</div>
      ) : (
        <div className={styles.conversationsList}>
          {conversations.map(conversation => (
            <div
              key={conversation._id}
              role="button"
              tabIndex={0}
              onClick={() => handleConversationClick(conversation)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ')
                  handleConversationClick(conversation);
              }}
              className={styles.conversationItem}
              aria-label={`Open conversation with ${conversation.otherParty.firstName} ${conversation.otherParty.lastName}`}
            >
              <img
                src={
                  conversation.otherParty.profileImage || '/default-avatar.png'
                }
                alt={`${conversation.otherParty.firstName}'s profile`}
                className={styles.profileImage}
              />
              <div className={styles.conversationInfo}>
                <div className={styles.nameAndTime}>
                  <h3>{`${conversation.otherParty.firstName} ${conversation.otherParty.lastName}`}</h3>
                  <span className={styles.timestamp}>
                    {new Date(
                      conversation.lastMessage.timestamp
                    ).toLocaleTimeString()}
                  </span>
                </div>
                <div className={styles.lastMessage}>
                  {conversation.lastMessage.type === 'text' ? (
                    <p>{conversation.lastMessage.content}</p>
                  ) : conversation.lastMessage.type === 'image' ? (
                    <p>📷 Image</p>
                  ) : (
                    <p>📎 File</p>
                  )}
                </div>
              </div>
              {conversation.unreadCount > 0 && (
                <div className={styles.unreadBadge}>
                  {conversation.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

ConversationsList.propTypes = {
  onSelect: PropTypes.func,
};

export default ConversationsList;
