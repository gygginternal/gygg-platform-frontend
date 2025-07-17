import React from 'react';
import PropTypes from 'prop-types';
import styles from './MessageDesign.module.css';

const MessageDesign = ({ messages, onClick }) => {
  const handleActionClick = message => {
    // Handle action click - you can customize this based on your needs
    if (onClick) {
      onClick(message);
    }
  };

  return (
    <div className={styles.outerContainer}>
      <div className={styles.flexWrapper}>
        <div className={styles.innerContainerWrapper}>
          <div className={styles.messageListContainer}>
            {messages.map((message, index) => (
              <React.Fragment key={index}>
                <div
                  className={styles.messageItem}
                  role="button"
                  tabIndex={0}
                  onClick={() => onClick(message)} // Pass the message object to the onClick handler
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') onClick(message);
                  }}
                >
                  <div className={styles.messageContentLeft}>
                    <img
                      src={message.profileImage || '/default.jpg'}
                      className={styles.profileImage}
                      alt="Profile"
                    />
                    <div className={styles.messageTextGroup}>
                      <div
                        className={`${styles.messageName} ${message.unreadCount > 0 ? styles.messageNameUnread : ''}`}
                      >
                        {message.name}
                      </div>
                      <div
                        className={`${styles.messageText} ${message.unreadCount > 0 ? styles.messageTextUnread : ''}`}
                      >
                        {message.text}
                      </div>
                    </div>
                  </div>
                  <div className={styles.messageContentRight}>
                    <div className={styles.timestamp}>{message.timestamp}</div>
                    {message.statusIcon && (
                      <img
                        src={message.statusIcon || '/default-status-icon.jpg'}
                        className={styles.statusIcon}
                        alt="Status"
                      />
                    )}
                  </div>
                </div>
                {index < messages.length - 1 && (
                  <div className={styles.messageSeparator} />
                )}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleActionClick(message)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ')
                      handleActionClick(message);
                  }}
                  className={styles.action}
                  aria-label={`Perform action on message from ${message.sender}`}
                >
                  {/* Action icon/content */}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

MessageDesign.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      profileImage: PropTypes.string,
      name: PropTypes.string,
      text: PropTypes.string,
      timestamp: PropTypes.string,
      statusIcon: PropTypes.string,
      unreadCount: PropTypes.number,
      sender: PropTypes.string,
    })
  ).isRequired,
  onClick: PropTypes.func,
};

export default MessageDesign;
