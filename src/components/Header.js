import React, { useState } from "react"; // Import useState
import { Link, useNavigate } from 'react-router-dom'; // Use react-router-dom
import styles from "./Header.module.css";   // Your Header CSS
import Sidebar from "./Sidebar";          // The collapsible sidebar
import { useAuth } from '../context/AuthContext'; // Adjust path

function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar
  // Dropdown state - simplified for this example
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // Add separate state for other dropdowns if needed

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
      logout();
      navigate('/');
      setIsProfileOpen(false); // Close dropdown
  };

  const handleNavigation = (route) => {
     navigate(route);
     // Close any open dropdowns after navigation
     setIsProfileOpen(false);
     // Add similar logic for other dropdowns
  };

  // Close dropdowns if clicking outside (basic implementation)
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     // Add logic to check if click is outside dropdown areas
  //     // setIsProfileOpen(false); ...
  //   };
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);


  return (
    <> {/* Use Fragment to return Header and Sidebar */}
      <header className={styles.header}>
        {/* Menu Button to toggle Sidebar */}
        <button onClick={toggleSidebar} className={styles.menuButton} aria-label="Toggle Menu">
          <img src="/assets/menu.svg" alt="Menu" className={styles.menuIcon} width={32} height={32} />
        </button>

        {/* Logo */}
        <Link to={user ? "/" : "/"} className={styles.logoLink}>
          <img src="/assets/gygg-logo.svg" alt="Gygg Logo" className={styles.headerLogo} height={50}/>
        </Link>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <img src="/assets/search-outline.svg" alt="Search" width={20} height={20} />
            <input type="text" placeholder="Search Tasks (Not Implemented)" className={styles.searchInput} />
          </div>
          <button className={styles.searchButton} onClick={() => alert('Search not implemented')}>Search</button>
        </div>

        {/* Header Controls */}
        <div className={styles.headerControls}>
           {user ? ( // Only show controls if logged in
               <>
                   {/* Adjustments Icon/Dropdown Placeholder */}
                   <button className={styles.iconButton} aria-label="Adjustments"><img src="/assets/adjustments.svg" alt="Adjustments" width={28} height={28} /></button>

                   {/* Notification Icon/Dropdown Placeholder */}
                   <button className={styles.iconButton} aria-label="Notifications"><img src="/assets/notification.svg" alt="Notification" width={28} height={28} /></button>

                   {/* Profile Icon/Dropdown */}
                   <div className={styles.iconWithDropdown}>
                       <button className={styles.iconButton} onClick={() => setIsProfileOpen(!isProfileOpen)} aria-label="Profile Menu">
                          <img src={user.profileImage || '/assets/profile.svg'} alt="Profile" width={32} height={32} style={{ borderRadius: '50%' }}/>
                       </button>
                       {isProfileOpen && (
                       <div className={styles.dropdown}>
                           <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setIsProfileOpen(false)}>
                               {/* Use a generic profile icon or user's avatar small */}
                               <img src="/assets/user.svg" alt="" width={18} height={18} />
                               <p>My Dashboard</p>
                           </Link>
                           {/* Add link to actual profile page if separate */}
                            {/* <Link to={`/users/${user._id}`} className={styles.dropdownItem} onClick={() => setIsProfileOpen(false)}> ... My Profile ... </Link> */}
                           <div className={styles.dropdownItem} onClick={() => { handleNavigation("/settings"); }}>
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
           ) : ( // Show Login/Signup if not logged in
                 <>
                     <Link to="/login" style={{color: 'white', fontWeight:'500'}}>Login</Link>
                     <Link to="/join" style={{color: 'white', fontWeight:'500'}}>Sign Up</Link>
                 </>
           )}
        </div>
      </header>
       {/* Render Sidebar, passing state and toggle function */}
       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </>
  );
}

export default Header;