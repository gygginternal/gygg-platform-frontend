// src/pages/ChatPage.js
import React, { useState } from "react";
import styles from "./ChatPage.module.css"; // Create this CSS Module
import ConversationsList from "../components/ConversationsList";
import ChatWindow from "../components/ChatWindow";
// Header is likely rendered globally in App.js
// import Header from "../components/Shared/Header";

function ChatPage() {
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [selectedChatPartner, setSelectedChatPartner] = useState(null); // Store info about the other user

  const handleSelectConversation = (contractId, otherParty) => {
    console.log("Selected conversation:", contractId, "with:", otherParty);
    setSelectedContractId(contractId);
    setSelectedChatPartner(otherParty);
  };

  return (
    // The main layout (Header, Sidebar) is handled by App.js or a layout component
    // This page just defines the chat-specific content grid
    <div className={styles.contentGrid}>
      <ConversationsList
        onSelectConversation={handleSelectConversation}
        selectedContractId={selectedContractId}
      />
      <ChatWindow
        selectedContractId={selectedContractId}
        chatPartner={selectedChatPartner} // Pass the other user's info to ChatWindow
      />
    </div>
  );
}

export default ChatPage;