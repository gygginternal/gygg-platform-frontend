import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import styles from "./Header.module.css";
import Sidebar from "./Sidebar";
import { useAuth } from '../context/AuthContext';

function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const profileDropdownRef = useRef(null); // Ref for profile dropdown

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const handleNavigation = (route) => {
    navigate(route);
    setIsProfileOpen(false);
  };

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className={styles.header}>
        <button onClick={toggleSidebar} className={styles.menuButton} aria-label="Toggle Menu">
          <img src="/assets/menu.svg" alt="Menu" className={styles.menuIcon} width={32} height={32} />
        </button>

        <Link to={user ? "/" : "/"} className={styles.logoLink}>
          <img src="/assets/gygg-logo.svg" alt="Gygg Logo" className={styles.headerLogo} height={50}/>
        </Link>

        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <img src="/assets/search-outline.svg" alt="Search" width={20} height={20} />
            <input type="text" placeholder="Search Tasks" className={styles.searchInput} />
          </div>
          <button className={styles.searchButton} onClick={() => alert('Search not implemented')}>Search</button>
        </div>

        <div className={styles.headerControls}>
          {user ? (
            <>
              <button className={styles.iconButton} aria-label="Adjustments">
                <img src="/assets/adjustments.svg" alt="Adjustments" width={28} height={28} />
              </button>

              <button className={styles.iconButton} aria-label="Notifications">
                <img src="/assets/notification.svg" alt="Notification" width={28} height={28} />
              </button>

              <div className={styles.iconWithDropdown} ref={profileDropdownRef}>
                <button className={styles.iconButton} onClick={() => setIsProfileOpen(!isProfileOpen)} aria-label="Profile Menu">
                  { <img src={'/assets/profile.svg'} alt="Profile" width={36} height={36} style={{ borderRadius: '50%' }}/> /* user.profileImage ||  */}
                </button>
                {isProfileOpen && (
                  <div className={styles.dropdown}>
                    <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setIsProfileOpen(false)}>
                      <img src="/assets/user.svg" alt="" width={18} height={18} />
                      <p>My Dashboard</p>
                    </Link>
                    <div className={styles.dropdownItem} onClick={() => handleNavigation("/settings")}>
                      <img src="/assets/settings.svg" alt="" width={18} height={18} />
                      <p>Settings</p>
                    </div>
                    <div className={styles.dropdownItem} onClick={handleLogout}>
                      <img src="/assets/logout.svg" alt="" width={18} height={18} />
                      <p>Log out</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{color: 'white', fontWeight:'500'}}>Login</Link>
              <Link to="/join" style={{color: 'white', fontWeight:'500'}}>Sign Up</Link>
            </>
          )}
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </>
  );
}

export default Header;
