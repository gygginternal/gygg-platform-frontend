// import React from 'react';
import { MessageCircle, Lock } from 'lucide-react';
import styles from './ChatEmptyState.module.css';

const ChatEmptyState = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <MessageCircle className={styles.logo} />
        </div>

        <h1 className={styles.title}>WhatsApp for Windows</h1>

        <div className={styles.description}>
          <p className={styles.mainText}>
            Send and receive messages without keeping your phone online.
          </p>
          <p className={styles.subText}>
            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </p>
        </div>
      </div>

      <div className={styles.footer}>
        <Lock className={styles.lockIcon} />
        <span className={styles.encryptedText}>End-to-end encrypted</span>
      </div>
    </div>
  );
};

export default ChatEmptyState;
