import React from 'react';
import { Search, MoreVertical } from 'lucide-react';
import styles from './ChatSidebar.module.css';

const ChatSidebar = ({ contacts, selectedContact, onContactSelect }) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.searchContainer}>
          {/* <Search className={styles.searchIcon} /> */}
          <input
            type="text"
            placeholder="Search or start new chat"
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.contactsList}>
        {contacts.map(contact => (
          <div
            key={contact.id}
            className={`${styles.contactItem} ${
              selectedContact && selectedContact.id === contact.id
                ? styles.selected
                : ''
            }`}
            onClick={() => onContactSelect(contact)}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                onContactSelect(contact);
              }
            }}
          >
            <div className={styles.avatarContainer}>
              <img
                src={contact.avatar}
                alt={contact.name}
                className={styles.avatar}
              />
              {contact.isOnline && <div className={styles.onlineIndicator} />}
            </div>

            <div className={styles.contactInfo}>
              <div className={styles.contactHeader}>
                <span className={styles.contactName}>{contact.name}</span>
                <span className={styles.timestamp}>{contact.timestamp}</span>
              </div>
              <div className={styles.lastMessageContainer}>
                <span className={styles.lastMessage}>
                  {contact.lastMessage}
                </span>
                {contact.unreadCount ? (
                  <div className={styles.unreadBadge}>
                    {contact.unreadCount}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
