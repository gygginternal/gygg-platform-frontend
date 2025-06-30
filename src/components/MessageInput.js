// src/components/ChatPage/MessageInput.js
import { useState, useRef } from 'react';
import styles from './MessageInput.module.css'; // Your CSS Module
import PropTypes from 'prop-types';

// interface MessageInputProps {
//   onSendMessage: (messageText: string) => Promise<void>; // Or boolean for success
//   disabled?: boolean;
// }

function MessageInput({ onSendMessage, disabled = false }) {
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleInputChange = e => {
    setMessageText(e.target.value);
  };

  const handleSubmit = async e => {
    e.preventDefault(); // Prevent form submission if it's a form
    if (!messageText.trim() || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSendMessage(messageText.trim()); // Call parent handler
      setMessageText(''); // Clear input on success
    } finally {
      setIsSending(false);
    }
  };

  // Icon for send button (use SVG or an <img>)
  const SendIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
  );

  return (
    // Use a form for better accessibility (Enter key submits)
    <form onSubmit={handleSubmit} className={styles.inputContainer}>
      {/* Attachment Button (Placeholder) */}
      <button
        type="button"
        className={styles.actionButton}
        disabled={disabled || isSending}
        aria-label="Attach file"
      >
        <img
          src="/attachment.svg"
          alt="Attach"
          className={styles.actionIcon}
          width={20}
          height={20}
        />{' '}
        {/* Ensure icon in public */}
      </button>

      <input
        type="text"
        placeholder="Type your message here..."
        className={styles.input}
        value={messageText}
        onChange={handleInputChange}
        disabled={disabled || isSending}
      />

      {/* Send Button */}
      <button
        type="submit"
        className={styles.actionButton}
        disabled={disabled || isSending || !messageText.trim()}
        aria-label="Send message"
      >
        {isSending ? '...' : <SendIcon />} {/* Or use an image for send icon */}
      </button>
    </form>
  );
}

MessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default MessageInput;
