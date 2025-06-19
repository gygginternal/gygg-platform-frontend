import React, { useState } from 'react';
import ConversationsList from '../components/ConversationsList';
import ChatWindow from '../components/ChatWindow';
import styles from '../components/ChatWindow.module.css';

const Messages = () => {
  // You may want to manage selected conversation/contractId and chatPartner here
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);

  // Example: handle conversation selection from sidebar
  const handleConversationSelect = (contractId, partner) => {
    setSelectedContractId(contractId);
    setChatPartner(partner);
  };

  return (
    <div className={styles.chatLayout}>
      <aside className={styles.sidebarArea}>
        <ConversationsList onSelect={handleConversationSelect} />
      </aside>
      <main className={styles.mainChatArea}>
        <ChatWindow
          selectedContractId={selectedContractId}
          chatPartner={chatPartner}
          layoutClasses={{
            thread: styles.messageThreadArea,
            input: styles.messageInputArea,
          }}
        />
      </main>
    </div>
  );
};

export default Messages;
