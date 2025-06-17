import React from "react";
import styles from './MessageDesign.module.css';

const MessageDesign = ({ messages, onClick }) => {
  return (
    <div className={styles.outerContainer}>
      <div className={styles.flexWrapper}>
        <div className={styles.innerContainerWrapper}>
          <div className={styles.messageListContainer}>
            {messages.map((message, index) => (
              <React.Fragment key={index}>
                <div
                  className={styles.messageItem}
                  onClick={() => onClick(message)} // Pass the message object to the onClick handler
                >
                  <div className={styles.messageContentLeft}>
                    <img
                      src={message.profileImage || "/default.jpg"}
                      className={styles.profileImage}
                      alt="Profile"
                    />
                    <div className={styles.messageTextGroup}>
                      <div className={`${styles.messageName} ${message.unreadCount > 0 ? styles.messageNameUnread : ''}`}>
                        {message.name}
                      </div>
                      <div className={`${styles.messageText} ${message.unreadCount > 0 ? styles.messageTextUnread : ''}`}>
                        {message.text}
                      </div>
                    </div>
                  </div>
                  <div className={styles.messageContentRight}>
                    <div className={styles.timestamp}>{message.timestamp}</div>
                    {message.statusIcon && (
                      <img
                        src={message.statusIcon || "/default-status-icon.jpg"}
                        className={styles.statusIcon}
                        alt="Status"
                      />
                    )}
                  </div>
                </div>
                {index < messages.length - 1 && (
                  <div className={styles.messageSeparator} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDesign;