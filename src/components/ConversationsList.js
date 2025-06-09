import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./ConversationsList.module.css"; // Your CSS Module
import apiClient from "../api/axiosConfig"; // Adjust path
import logger from "../utils/logger"; // Optional, adjust path
import { useAuth } from "../context/AuthContext"; // Adjust path
import MessageDesign from "./MessageDesign"; // Import MessageDesign component

function ConversationsList({ onSelectConversation, selectedContractId }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        logger.info("Fetching conversations for user:", user._id);
        const response = await apiClient.get("/chat/conversations");
        const fetchedConversations = response.data.data.conversations || [];
        setConversations(fetchedConversations);
        setFilteredConversations(fetchedConversations); // Initialize filtered conversations
        logger.debug("Fetched conversations:", fetchedConversations);
      } catch (err) {
        logger.error(
          "Error fetching conversations:",
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message || "Failed to load conversations."
        );
        setConversations([]);
        setFilteredConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user]);

  useEffect(() => {
    // Filter conversations based on search text
    const filtered = conversations.filter((convo) =>
      (
        convo.otherParty?.fullName ||
        `${convo.otherParty?.firstName} ${convo.otherParty?.lastName}` ||
        ""
      )
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
    setFilteredConversations(filtered);
  }, [searchText, conversations]);

  const handleImageError = (e) => {
    e.target.src = "/default.png";
  };

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

  // Format conversations for MessageDesign
  const formattedConversations = filteredConversations.map((convo) => ({
    name:
      convo.otherParty?.fullName ||
      `${convo.otherParty?.firstName} ${convo.otherParty?.lastName}`.trim() ||
      "Unknown User",
    profileImage: convo.otherParty?.profileImage || "/default.png",
    text: convo.gigTitle || "Contract Discussion",
    timestamp: convo.lastUpdatedAt
      ? new Date(convo.lastUpdatedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    statusIcon: "",
    contractId: convo.contractId, // Include contractId for interaction
    otherParty: convo.otherParty, // Include otherParty for interaction
  }));

  const input = (
    <div className="flex flex-col justify-center items-start px-3 py-2.5 max-w-full bg-white rounded-2xl border border-gray-200 border-solid w-[280px] max-md:pr-5 max-md:mr-1.5">
      <div className="relative flex items-center w-full">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/d54a6d9dda44fbc7ba627166ca2d7f9a216386a8?placeholderIfAbsent=true"
          className="object-contain aspect-[0.92] w-[22px] mr-3"
          alt="Message icon"
        />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)} // Update search text
          className={cn(
            "w-full text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0 ",
            styles.input
          )}
        />
      </div>
    </div>
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h3>Messages</h3>
      </div>

      {input}

      <MessageDesign
        onClick={(message) =>
          onSelectConversation(message.contractId, message.otherParty)
        }
        messages={formattedConversations}
      />
    </aside>
  );
}

export default ConversationsList;
