// src/components/ChatPage/ConversationsList.js
import React, { useState, useEffect } from "react";
import styles from "./ConversationsList.module.css"; // Your CSS Module
import apiClient from "../api/axiosConfig"; // Adjust path
import logger from "../utils/logger"; // Optional, adjust path
import { useAuth } from "../context/AuthContext"; // Adjust path

// Interface for the data structure coming from /chat/conversations
// This needs to match what your backend actually sends for each item in the 'conversations' array
// interface ConversationBackendData {
//     contractId: string;
//     gigTitle: string | null | undefined;
//     otherParty: { // The user you are chatting with
//         id: string;
//         firstName: string;
//         lastName: string;
//         profileImage: string | null | undefined;
//         fullName?: string;
//     } | null;
//     lastUpdatedAt: string; // Or a specific lastMessageTimestamp if available
//     lastMessageSnippet?: string; // Optional: backend provides this
//     unreadCount?: number; // Optional: backend provides this
// }

// This component will now take a prop to notify parent about selected conversation
function ConversationsList({ onSelectConversation, selectedContractId }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) {
        setLoading(false);
        return;
      } // Don't fetch if no user

      setLoading(true);
      setError("");
      try {
        logger.info("Fetching conversations for user:", user._id);
        const response = await apiClient.get("/chat/conversations");
        setConversations(response.data.data.conversations || []);
        logger.debug(
          "Fetched conversations:",
          response.data.data.conversations
        );
      } catch (err) {
        logger.error(
          "Error fetching conversations:",
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message || "Failed to load conversations."
        );
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user]); // Refetch if user changes

  const handleImageError = (e) => {
    e.target.src = "/default.png";
  }; // Fallback in public folder

  if (loading)
    return (
      <aside className={styles.sidebar}>
        <p>Loading conversations...</p>
      </aside>
    );
  if (error)
    return (
      <aside className={styles.sidebar}>
        <p className="error-message">{error}</p>
      </aside>
    );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        {" "}
        {/* Added a header for the list */}
        <h3>Messages</h3>
        {/* TODO: Add search/filter for conversations */}
      </div>
      <div className={styles.conversationsList}>
        {conversations.length > 0 ? (
          conversations.map((convo) => {
            // Determine the 'other' user in the conversation
            const otherPartyName =
              convo.otherParty?.fullName ||
              `${convo.otherParty?.firstName} ${convo.otherParty?.lastName}`.trim() ||
              "Unknown User";
            const lastMessage =
              convo.lastMessageSnippet || "No messages yet..."; // Placeholder
            const timestamp = convo.lastUpdatedAt
              ? new Date(convo.lastUpdatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <React.Fragment key={convo.contractId}>
                <article
                  className={`${styles.conversation} ${
                    selectedContractId === convo.contractId
                      ? styles.selectedConversation
                      : ""
                  }`}
                  onClick={() =>
                    onSelectConversation(convo.contractId, convo.otherParty)
                  } // Pass ID and other party info
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    onSelectConversation(convo.contractId, convo.otherParty)
                  }
                >
                  <img // Use standard img
                    src={convo.otherParty?.profileImage || "/default.png"}
                    alt={otherPartyName}
                    width={48} // Match your CSS
                    height={48}
                    className={styles.avatar}
                    onError={handleImageError}
                  />
                  <div className={styles.messagePreview}>
                    <h3 className={styles.userName}>{otherPartyName}</h3>
                    <p className={styles.lastMessage}>
                      {convo.gigTitle || "Contract Discussion"}
                    </p>
                    {/* Optionally, show actual last message snippet if backend provides it */}
                    {/* <p className={styles.lastMessageSnippet}>{lastMessage}</p> */}
                  </div>
                  <div className={styles.messageInfo}>
                    <time className={styles.timestamp}>{timestamp}</time>
                    {/* More icon placeholder, add functionality if needed */}
                    {/* <img src="/more.svg" alt="More" className={styles.moreIcon} width={16} height={16}/> */}
                  </div>
                </article>
                <hr className={styles.divider} />
              </React.Fragment>
            );
          })
        ) : (
          <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            No conversations found.
          </p>
        )}
      </div>
    </aside>
  );
}

export default ConversationsList;
