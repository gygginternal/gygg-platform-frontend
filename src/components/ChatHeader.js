// src/components/ChatPage/ChatHeader.js
import React from "react";
import styles from "./ChatHeader.module.css"; // Your CSS Module

// Props for the user you're chatting with
// interface ChatHeaderProps {
//   userName: string;
//   profileImage?: string | null;
//   isOnline?: boolean; // Example status
// }

function ChatHeader({ chatPartner }) {
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

  const handleImageError = (e) => {
    e.target.src = "/default.png";
  };
  const name =
    chatPartner.fullName ||
    `${chatPartner.firstName} ${chatPartner.lastName}`.trim();

  return (
    <header className={styles.header}>
      <img // Use standard img
        src={chatPartner.profileImage || "/default.png"} // Use actual data or fallback
        alt={name}
        className={styles.avatar}
        width={40} // Adjust based on your CSS
        height={40}
        onError={handleImageError}
      />
      <div className={styles.userInfo}>
        <h2 className={styles.userName}>{name}</h2>
        {/* Add online status logic if available */}
        {/* <div className={styles.status}>
                    <div className={styles.statusIndicator} />
                    <span>Online</span>
                </div> */}
      </div>
      {/* Add other header actions like call, video call, info icons if needed */}
    </header>
  );
}

export default ChatHeader;
