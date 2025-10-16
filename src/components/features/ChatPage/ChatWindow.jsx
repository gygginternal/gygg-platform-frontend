import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Paperclip, ArrowLeft } from 'lucide-react';
import apiClient from '@api/axiosConfig';
import styles from './ChatWindow.module.css';
import { useSocket } from '@contexts/SocketContext';
import { checkMessageContent, showContentWarning } from '@utils/contentFilter';
import { decodeHTMLEntities } from '@utils/htmlEntityDecoder';

const ChatWindow = ({
  contact,
  messages,
  onMessageSent,
  onLoadMore,
  hasMore,
  loadingMore,
  onMobileBack,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [contentWarning, setContentWarning] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const { socket, typingUser } = useSocket();
  const messagesEndRef = useRef(null);
  const messagesListRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const lastScrollTop = useRef(0);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom when contact changes (opening new chat)
  useEffect(() => {
    if (contact && messages.length > 0) {
      setShouldAutoScroll(true);
      setIsUserScrolling(false);
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [contact?.id]);

  // Auto-scroll to bottom when new messages arrive, but only if user hasn't scrolled up
  useEffect(() => {
    if (messages.length > 0 && shouldAutoScroll && !isUserScrolling) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [messages, shouldAutoScroll, isUserScrolling]);

  const handleSendMessage = async e => {
    e.preventDefault();
    if (newMessage.trim()) {
      // Check content before sending
      const contentCheck = checkMessageContent(newMessage);
      if (!contentCheck.isClean) {
        showContentWarning(contentCheck.reason);
        return;
      }

      const messageText = newMessage.trim();
      setNewMessage(''); // Clear input immediately
      setContentWarning('');

      // Add optimistic message immediately (Facebook style)
      const tempId = onMessageSent ? onMessageSent(messageText, 'text') : null;

      // Ensure auto-scroll when user sends a message
      setShouldAutoScroll(true);
      setIsUserScrolling(false);

      try {
        await apiClient.post('/chat/send', {
          receiverId: contact.id,
          message: messageText,
          type: 'text',
        });
        // Success - the real-time handler will replace the optimistic message
      } catch (err) {
        // On error, remove the optimistic message and show error
        if (tempId && onMessageSent) {
          // You could implement a removeOptimisticMessage function here
        }
        const errorMessage =
          err.response?.data?.message || 'Failed to send message';
        setContentWarning(errorMessage);
        setNewMessage(messageText); // Restore message on error
      }
    }
  };

  // Emit typing event and check content
  const handleTyping = e => {
    const { value } = e.target;
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
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Emit typing indicator
      if (value.trim().length > 0) {
        socket.emit('chat:typing', {
          to: contact.id,
          userId: socket.user?.id,
          isTyping: true,
        });

        // Stop typing after 2 seconds of no activity
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit('chat:typing', {
            to: contact.id,
            userId: socket.user?.id,
            isTyping: false,
          });
        }, 2000);
      } else {
        socket.emit('chat:typing', {
          to: contact.id,
          userId: socket.user?.id,
          isTyping: false,
        });
      }
    }
  };

  // Handle image upload
  const handleImageUpload = async event => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setContentWarning(
        'Please select a valid image file (JPG, PNG, GIF, WEBP)'
      );
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

      const uploadResponse = await apiClient.post(
        '/chat/upload-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const { url, fileName, fileType, fileSize } = uploadResponse.data.data;

      // Add optimistic image message
      const tempId = onMessageSent
        ? onMessageSent(fileName, 'image', {
            url,
            fileName,
            fileType,
            fileSize,
          })
        : null;

      // Ensure auto-scroll when user sends an image
      setShouldAutoScroll(true);
      setIsUserScrolling(false);

      // Send image message
      await apiClient.post('/chat/send', {
        receiverId: contact.id,
        message: fileName,
        type: 'image',
        attachment: {
          url,
          fileName,
          fileType,
          fileSize,
        },
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to upload image';
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

  // Handle scroll events for auto-scroll behavior and infinite scroll
  const handleScroll = () => {
    const el = messagesListRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
    const isScrollingUp = scrollTop < lastScrollTop.current;

    lastScrollTop.current = scrollTop;

    // Update auto-scroll behavior based on user's scroll position
    if (isAtBottom) {
      setShouldAutoScroll(true);
      setIsUserScrolling(false);
    } else if (isScrollingUp) {
      setShouldAutoScroll(false);
      setIsUserScrolling(true);
    }

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set user as not actively scrolling after 1 second of no scroll activity
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 1000);

    // Infinite scroll: load more when scrolled to top
    if (scrollTop === 0 && hasMore && !loadingMore) {
      const previousScrollHeight = scrollHeight;
      onLoadMore && onLoadMore();

      // Maintain scroll position after loading more messages
      setTimeout(() => {
        if (el) {
          const newScrollHeight = el.scrollHeight;
          const scrollDifference = newScrollHeight - previousScrollHeight;
          el.scrollTop = scrollDifference;
        }
      }, 100);
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>
        {onMobileBack && (
          <button
            className={styles.mobileBackButton}
            onClick={onMobileBack}
            aria-label="Back to contacts"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className={styles.contactInfo}>
          <img
            src={contact.avatar}
            alt={contact.name}
            className={styles.avatar}
          />
          <div className={styles.contactDetails}>
            <span className={styles.contactName}>
              {decodeHTMLEntities(contact.name)}
            </span>
            {contact.isOnline && (
              <span className={styles.onlineStatus}>Online</span>
            )}
          </div>
        </div>
        {/* MoreVertical className={styles.moreIcon} - Commented out until delete chat functionality is implemented */}
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
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div
                      className={styles.imageError}
                      style={{ display: 'none' }}
                    >
                      📷 Image failed to load
                    </div>
                  </div>
                ) : (
                  <span className={styles.messageText}>
                    {decodeHTMLEntities(message.text)}
                  </span>
                )}
                <div className={styles.messageFooter}>
                  <span className={styles.messageTime}>
                    {message.displayTime || message.timestamp}
                  </span>
                  {message.isSent && (
                    <span
                      className={`${styles.messageStatus} ${styles[message.status || 'sent']}`}
                    >
                      {message.status === 'sending' ? '⏳' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {/* Typing indicator */}
          {typingUser === contact.id && (
            <div className={styles.typingIndicator}>Typing...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {!shouldAutoScroll && (
          <button
            className={styles.scrollToBottomBtn}
            onClick={() => {
              setShouldAutoScroll(true);
              setIsUserScrolling(false);
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            title="Go to latest messages"
          >
            ↓
          </button>
        )}
      </div>

      <div className={styles.inputContainer}>
        {contentWarning && (
          <div className={styles.contentWarning}>⚠️ {contentWarning}</div>
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
            placeholder={
              uploadingImage
                ? 'Uploading image...'
                : 'Type your message here...'
            }
            className={`${styles.messageInput} ${contentWarning ? styles.warningInput : ''}`}
            disabled={uploadingImage}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button
            type="submit"
            className={`${styles.sendButton} ${newMessage.trim() ? styles.sendButtonActive : ''}`}
            disabled={!newMessage.trim() || sending || uploadingImage}
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
