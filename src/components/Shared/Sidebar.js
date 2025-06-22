// src/components/Shared/Sidebar.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useAuth } from '../../context/AuthContext';
import socket from '../../socket';
import apiClient from '../../api/axiosConfig';
import PropTypes from 'prop-types';

const Icon = ({ src, alt, className }) => (
  <img
    src={src}
    alt={alt}
    width={24}
    height={24}
    className={className}
    onError={e => (e.target.style.display = 'none')}
  />
);

Icon.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
};

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  React.useEffect(() => {
    if (!user) return;
    // Fetch unread count on mount
    const fetchUnreadCount = async () => {
      try {
        const unreadResponse = await apiClient.get('/chat/unread-count');
        setUnreadMessageCount(unreadResponse.data.data.unreadCount);
      } catch (error) {
        console.error('Error fetching unread count:', error);
        setUnreadMessageCount(0);
      }
    };
    fetchUnreadCount();

    socket.emit('subscribeToNotifications', { userId: user._id });
    socket.on('chat:newMessage', fetchUnreadCount);
    socket.on('chat:unreadCountUpdated', fetchUnreadCount);

    return () => {
      socket.emit('unsubscribeFromNotifications', { userId: user._id });
      socket.off('chat:newMessage', fetchUnreadCount);
      socket.off('chat:unreadCountUpdated', fetchUnreadCount);
    };
  }, [user]);

  const getSelectedItem = path => {
    if (path === location.pathname) return true;
    if (path === '/gigs' && location.pathname.startsWith('/gigs/')) return true;
    return false;
  };

  const navItems = [
    { key: 'home', path: '/feed', icon: '/assets/home.svg', text: 'Home' },
    {
      key: 'messages',
      path: '/messages',
      icon: '/assets/messages.svg',
      text: 'Messages',
      unread: unreadMessageCount > 0,
    },
    {
      key: 'contracts',
      path: '/contracts',
      icon: '/assets/receipt-edit.svg',
      text: 'Contracts',
    },
  ];

  if (user?.role.includes('tasker')) {
    navItems.push({
      key: 'gigs',
      path: '/gigs',
      icon: '/assets/briefcase.svg',
      text: 'Gigs',
    });
  }

  if (user?.role.includes('provider')) {
    navItems.push({
      key: 'gig helpers',
      path: '/gig-helper',
      icon: '/assets/briefcase.svg',
      text: 'Gig Helpers',
    });
  }

  const handleNavigation = path => {
    navigate(path);
    if (isOpen && window.innerWidth < 768) {
      // toggleSidebar(); // Uncomment if toggleSidebar prop is passed and works
    }
  };

  return (
    <nav
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.collapsed}`}
    >
      {navItems.map(item => {
        const isSelected = getSelectedItem(item.path);
        return (
          <div
            key={item.key}
            role="button"
            tabIndex={0}
            onClick={() => handleNavigation(item.path)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ')
                handleNavigation(item.path);
            }}
            className={`${styles.navItem} ${isSelected ? styles.selected : ''}`}
            aria-label={`Go to ${item.text}`}
          >
            <div className={styles.navItemContent}>
              <Icon
                className={
                  isSelected ? styles.selectedIcon : styles.defaultIcon
                }
                src={item.icon}
                alt={item.text}
              />
              {item.unread && (
                <span
                  style={{
                    display: 'inline-block',
                    background: '#ff3b30',
                    borderRadius: '50%',
                    width: 10,
                    height: 10,
                    marginLeft: 4,
                    verticalAlign: 'middle',
                  }}
                />
              )}
              {isOpen && <span className={styles.navText}>{item.text}</span>}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func,
};

export default Sidebar;
