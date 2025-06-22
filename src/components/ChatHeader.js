// src/components/ChatPage/ChatHeader.js
import { useState } from 'react';
import styles from './ChatHeader.module.css'; // Your CSS Module
import PropTypes from 'prop-types';

// Props for the user you're chatting with
// interface ChatHeaderProps {
//   userName: string;
//   profileImage?: string | null;
//   isOnline?: boolean; // Example status
// }

function ChatHeader({ chatPartner, onBack, isMobile }) {
  // Pass the other user object
  if (!chatPartner) {
    return (
      // Placeholder or empty state when no chat is selected
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <h2 className={styles.userName}>Select a conversation</h2>
        </div>
      </header>
    );
  }

  const handleImageError = e => {
    // e.target.src = "/default.png";
  };
  const name =
    chatPartner.fullName ||
    `${chatPartner.firstName} ${chatPartner.lastName}`.trim();

  // Online status: fallback to true for demo, or use chatPartner.isOnline if available
  const isOnline =
    chatPartner.isOnline !== undefined ? chatPartner.isOnline : true;

  // Show back button on mobile or if onBack is provided
  const showBack = isMobile || typeof onBack === 'function';

  return (
    <header className={styles.header}>
      {showBack && (
        <button
          type="button"
          onClick={onBack}
          className={styles.backButton}
          aria-label="Go back"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="#3d4d55"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      <img
        src={chatPartner.profileImage || '/default.png'}
        alt={name}
        className={styles.avatar}
        width={40}
        height={40}
        onError={handleImageError}
      />
      <div className={styles.userInfo}>
        <h2 className={styles.userName}>{name}</h2>
        <div className={styles.status}>
          <span
            className={styles.statusIndicator}
            aria-label={isOnline ? 'Online' : 'Offline'}
          />
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
      {/* Placeholder for action icons (call, info, etc.) */}
      <div className={styles.actions}>
        {/* Example: Info icon */}
        <button
          type="button"
          className={styles.actionButton}
          aria-label="Conversation info"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#3d4d55" strokeWidth="2" />
            <rect x="11" y="10" width="2" height="6" rx="1" fill="#3d4d55" />
            <rect x="11" y="7" width="2" height="2" rx="1" fill="#3d4d55" />
          </svg>
        </button>
      </div>
    </header>
  );
}

ChatHeader.propTypes = {
  chatPartner: PropTypes.shape({
    fullName: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    profileImage: PropTypes.string,
    isOnline: PropTypes.bool,
  }),
  onBack: PropTypes.func,
  isMobile: PropTypes.bool,
};

export default ChatHeader;
