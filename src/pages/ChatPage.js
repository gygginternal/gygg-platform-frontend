import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig';
import styles from '../styles/ChatPage.module.css';

const ChatPage = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [otherUser, setOtherUser] = useState(null);

  // Fetch chat history
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/chat/history?userId=${userId}`);
      setMessages(response.data.data.messages);

      if (response.data.data.messages.length > 0) {
        const message = response.data.data.messages[0];
        const otherUserInfo = message.sender._id === user.id ? message.receiver : message.sender;
        setOtherUser(otherUserInfo);
      } else {
        const userResponse = await apiClient.get(`/users/public/${userId}`);
        setOtherUser(userResponse.data.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, [userId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await apiClient.post('/chat/send', {
        message: newMessage,
        receiverId: userId
      });

      setMessages(prev => [...prev, response.data.data.message]);
      setNewMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading messages...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatCard}>
        {/* Chat Header */}
        <div className={styles.chatHeader}>
          <img
            src={otherUser?.profileImage || '/default-avatar.png'}
            alt={`${otherUser?.firstName}'s profile`}
            className={styles.profileImage}
          />
          <div className={styles.userInfo}>
            <h2>{`${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`}</h2>
            <span className={styles.onlineStatus}>● Online</span>
          </div>
          <button className={styles.menuButton} title="More">
            &#x22EE;
          </button>
        </div>

        {/* Messages Container */}
        <div className={styles.messagesContainer}>
          {messages.map((message) => {
            const isSent = message.sender._id === user.id;
            return (
              <div key={message._id} className={styles.messageRow}>
                <img
                  src={
                    (isSent ? user.profileImage : otherUser?.profileImage) ||
                    '/default-avatar.png'
                  }
                  alt="profile"
                  className={styles.messageProfile}
                />
                <div style={{ flex: 1 }}>
                  <div className={styles.messageMeta}>
                    <span className={styles.senderName}>
                      {isSent ? 'You' : `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`}
                    </span>
                    <span className={styles.timestamp}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={styles.messageContent}>
                    {message.type === 'offer' && (
                      <div className={styles.specialHeader}>
                        You got an application!
                      </div>
                    )}
                    {message.type === 'text' ? (
                      <p>{message.content}</p>
                    ) : message.type === 'image' ? (
                      <img src={message.attachment} alt="Shared" className={styles.messageImage} />
                    ) : (
                      <a href={message.attachment} target="_blank" rel="noopener noreferrer">
                        Download File
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className={styles.inputContainer}>
          <button type="button" className={styles.inputIcon} title="Emoji">
            <span role="img" aria-label="emoji">😊</span>
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className={styles.messageInput}
          />
          <button type="button" className={styles.inputIcon} title="Attach">
            <span role="img" aria-label="attach">📎</span>
          </button>
          <button type="submit" className={styles.sendButton}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
