import React, { useState, useMemo } from 'react';
import { Search, MoreVertical } from 'lucide-react';
import styles from './ChatSidebar.module.css';

const ChatSidebar = ({ contacts, selectedContact, onContactSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter contacts based on search term
  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) {
      return contacts;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    return contacts.filter(contact => {
      const nameMatch = contact.name.toLowerCase().includes(searchLower);
      const messageMatch = contact.lastMessage?.toLowerCase().includes(searchLower);
      return nameMatch || messageMatch;
    });
  }, [contacts, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search or start new chat"
            className={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              className={styles.clearButton}
              onClick={clearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className={styles.contactsList}>
        {filteredContacts.length === 0 ? (
          <div className={styles.noResults}>
            {searchTerm ? (
              <>
                <div className={styles.noResultsIcon}>🔍</div>
                <p className={styles.noResultsText}>No chats found</p>
                <p className={styles.noResultsSubtext}>
                  Try searching for a different name or message
                </p>
              </>
            ) : (
              <>
                <div className={styles.noResultsIcon}>💬</div>
                <p className={styles.noResultsText}>No conversations yet</p>
                <p className={styles.noResultsSubtext}>
                  Start a new chat to begin messaging
                </p>
              </>
            )}
          </div>
        ) : (
          filteredContacts.map(contact => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
