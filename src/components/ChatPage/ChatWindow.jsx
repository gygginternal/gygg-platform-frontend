import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Smile, Paperclip, Mic } from 'lucide-react';
import apiClient from '../../api/axiosConfig';
import styles from './ChatWindow.module.css';
import { useSocket } from '../../contexts/SocketContext';
import { checkMessageContent, showContentWarning } from '../../utils/contentFilter';

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
  const [contentWarning, setContentWarning] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const { socket, typingUser } = useSocket();
  const messagesEndRef = useRef(null);
  const messagesListRef = useRef(null);
  const fileInputRef = useRef(null);

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
      // Check content before sending
      const contentCheck = checkMessageContent(newMessage);
      if (!contentCheck.isClean) {
        showContentWarning(contentCheck.reason);
        return;
      }

      setSending(true);
      setContentWarning('');
      try {
        await apiClient.post('/chat/send', {
          receiverId: contact.id,
          message: newMessage,
          type: 'text',
        });
        setNewMessage('');
        if (onMessageSent) onMessageSent();
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to send message';
        setContentWarning(errorMessage);
      } finally {
        setSending(false);
      }
    }
  };

  // Emit typing event and check content
  const handleTyping = e => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Real-time content checking for warnings
    if (value.trim()) {
      const contentCheck = checkMessageContent(value);
      if (!contentCheck.isClean) {
        setContentWarning(contentCheck.reason);
      } else {
        setContentWarning('');
      }
    } else {
      setContentWarning('');
    }
    
    if (socket && contact) {
      socket.emit('chat:typing', { to: contact.id });
    }
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setContentWarning('Please select a valid image file (JPG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setContentWarning('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      // Upload image to S3
      const formData = new FormData();
      formData.append('chatImage', file);

      const uploadResponse = await apiClient.post('/chat/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { url, fileName, fileType, fileSize } = uploadResponse.data.data;

      // Send image message
      await apiClient.post('/chat/send', {
        receiverId: contact.id,
        message: fileName, // Use filename as message content
        type: 'image',
        attachment: {
          url,
          fileName,
          fileType,
          fileSize,
        },
      });

      if (onMessageSent) onMessageSent();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to upload image';
      setContentWarning(errorMessage);
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle attachment icon click
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
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
                {message.type === 'image' && message.attachment ? (
                  <div className={styles.imageMessage}>
                    <img
                      src={message.attachment.url}
                      alt={message.attachment.fileName || 'Image'}
                      className={styles.messageImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className={styles.imageError} style={{ display: 'none' }}>
                      📷 Image failed to load
                    </div>
                  </div>
                ) : (
                  <span className={styles.messageText}>{message.text}</span>
                )}
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
        {contentWarning && (
          <div className={styles.contentWarning}>
            ⚠️ {contentWarning}
          </div>
        )}
        <form onSubmit={handleSendMessage} className={styles.inputForm}>
          <Paperclip 
            className={`${styles.attachIcon} ${uploadingImage ? styles.uploading : ''}`}
            onClick={handleAttachmentClick}
            title="Upload image"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder={uploadingImage ? "Uploading image..." : "Type your message here..."}
            className={`${styles.messageInput} ${contentWarning ? styles.warningInput : ''}`}
            disabled={uploadingImage}
          />
          <Smile className={styles.emojiIcon} />
          <Mic className={styles.micIcon} />
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
