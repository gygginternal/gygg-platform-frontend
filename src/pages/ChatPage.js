import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig';
import styles from './ChatPage.module.css';
import appStyles from '../App.module.css';
import socket from '../socket';

const ChatPage = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch chat history
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/chat/history?userId=${userId}`);
      setMessages(response.data.data.messages);
      if (response.data.data.messages.length > 0) {
        const [message] = response.data.data.messages;
        const otherUserInfo =
          message.sender._id === user.id ? message.receiver : message.sender;
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
    fetchMessages();
    // eslint-disable-next-line
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time: join room and listen for new messages
  useEffect(() => {
    if (!user || !userId) return;

    // Join user's personal channel for notifications
    socket.emit('subscribeToNotifications', { userId: user.id });

    // Join the specific chat channel
    const chatChannel = `chat:${user.id}:${userId}`;
    socket.emit('join', chatChannel);

    const handleNewMessage = msg => {
      setMessages(prev => [...prev, msg]);
    };

    const handleNotification = notification => {
      // Handle new message notification
      console.log('New message notification:', notification);
    };

    const handleUnreadCountUpdate = data => {
      // Handle unread count update
      console.log('Unread count updated:', data);
    };

    // Listen for new messages in the chat channel
    socket.on('newChatMessage', handleNewMessage);

    // Listen for notifications
    socket.on('notification:newMessage', handleNotification);
    socket.on('notification:unreadCountUpdated', handleUnreadCountUpdate);

    return () => {
      socket.emit('unsubscribeFromNotifications', { userId: user.id });
      socket.emit('leave', chatChannel);
      socket.off('newChatMessage', handleNewMessage);
      socket.off('notification:newMessage', handleNotification);
      socket.off('notification:unreadCountUpdated', handleUnreadCountUpdate);
    };
  }, [user, userId]);

  const handleSend = async e => {
    e.preventDefault();
    if (!input.trim() || uploading) return;
    try {
      const response = await apiClient.post('/chat/send', {
        message: input,
        receiverId: userId,
      });
      setMessages(prev => [...prev, response.data.data.message]);
      setInput('');
      // No need to emit via socket - backend will handle this
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  // Image upload handler
  const handleImageChange = async e => {
    const [file] = e.target.files;
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await apiClient.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = res.data.data.url;
      // Send image as a message
      const response = await apiClient.post('/chat/send', {
        message: imageUrl,
        receiverId: userId,
        type: 'image',
      });
      setMessages(prev => [...prev, response.data.data.message]);
      // No need to emit via socket - backend will handle this
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading)
    return <div className={styles.messages}>Loading messages...</div>;
  if (error) return <div className={styles.messages}>{error}</div>;

  return (
    <div className={appStyles.container}>
      <div className={styles.chatContainer}>
        <div className={styles.header}>
          <img
            className={styles.avatar}
            src={otherUser?.profileImage || '/default-avatar.png'}
            alt={otherUser?.firstName || 'User'}
            width={48}
            height={48}
          />
          <div>
            <div className={styles.username}>
              {`${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`}
            </div>
            <div className={styles.status}>Online</div>
          </div>
        </div>
        <div className={styles.messages}>
          {messages.map(msg => {
            const isSelf = msg.sender._id === user.id;
            const isImage =
              typeof msg.content === 'string' &&
              msg.content.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
            return (
              <div
                key={msg._id}
                className={isSelf ? styles.selfMessage : styles.otherMessage}
              >
                {isImage ? (
                  <div className={styles.imageMessageWrapper}>
                    <div className={styles.imageContainer}>
                      <img
                        src={msg.content}
                        alt="message"
                        className={styles.messageImage}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={styles.messageText}>{msg.content}</div>
                )}
                <div className={styles.messageTime}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <form className={styles.inputArea} onSubmit={handleSend}>
          <input
            className={styles.input}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              uploading ? 'Uploading image...' : 'Type your message here...'
            }
            disabled={uploading}
          />
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={uploading}
          />
          <button
            className={styles.sendButton}
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={uploading}
            style={{ marginRight: 8 }}
            title="Send image"
          >
            📷
          </button>
          <button
            className={styles.sendButton}
            type="submit"
            disabled={uploading || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
