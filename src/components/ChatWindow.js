// src/components/ChatPage/ChatWindow.js
import React, { useState, useEffect, useCallback } from "react";
import styles from "./ChatWindow.module.css"; // Your CSS Module
import ChatHeader from "./ChatHeader";
import MessageThread from "./MessageThread";
import MessageInput from "./MessageInput";
import apiClient from "../api/axiosConfig"; // Adjust path
import logger from "../utils/logger"; // Optional, adjust path

// Props: selectedContractId and info about the chat partner
// interface ChatWindowProps {
//   selectedContractId: string | null;
//   chatPartner: { id: string; firstName: string; lastName: string; profileImage?: string; fullName?: string } | null;
// }

function ChatWindow({ selectedContractId, chatPartner }) {
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [error, setError] = useState('');

    // Fetch messages when a contract is selected
    const fetchMessages = useCallback(async () => {
        if (!selectedContractId) {
            setMessages([]); // Clear messages if no contract selected
            return;
        }
        setLoadingMessages(true);
        setError('');
        try {
            logger.info(`Fetching messages for contract: ${selectedContractId}`);
            const response = await apiClient.get(`/chat/contracts/${selectedContractId}/messages`);
            setMessages(response.data.data.messages || []);
            logger.debug("Fetched messages:", response.data.data.messages);
        } catch (err) {
            logger.error("Error fetching messages:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Failed to load messages.");
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    }, [selectedContractId]); // Dependency: refetch when selectedContractId changes

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]); // Call fetchMessages

    // Handler for sending a new message
    const handleSendMessage = async (messageText) => {
        if (!selectedContractId) {
            setError("No conversation selected to send message.");
            throw new Error("No conversation selected."); // Let MessageInput handle its sending state
        }
        setError('');
        try {
            logger.info(`Sending message to contract ${selectedContractId}: ${messageText}`);
            const response = await apiClient.post(`/chat/contracts/${selectedContractId}/messages`, {
                message: messageText // Backend expects 'message' field
            });
            // Add new message to the local state optimistically or after confirmation
            // The response.data.data.message should be the newly created message object
            setMessages(prevMessages => [...prevMessages, response.data.data.message]);
            logger.debug("Message sent successfully:", response.data.data.message);
        } catch (err) {
            logger.error("Error sending message:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Failed to send message.");
            throw err; // Re-throw to let MessageInput know it failed
        }
    };

    return (
        <section className={styles.chatWindow}>
            <div className={styles.container}>
                {/* Search placeholder can be removed or implemented later */}
                {/* <div className={styles.searchPlaceholder} /> */}
                <div className={styles.chatContent}>
                    <ChatHeader chatPartner={chatPartner} /> {/* Pass the chatPartner object */}

                    {error && <p className="error-message" style={{padding: '10px'}}>{error}</p>}

                    {loadingMessages ? (
                        <div style={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <p>Loading messages...</p>
                        </div>
                    ) : selectedContractId ? ( // Only show thread and input if a chat is selected
                        <>
                            <MessageThread messages={messages} />
                            <MessageInput onSendMessage={handleSendMessage} disabled={!selectedContractId} />
                        </>
                    ) : (
                         <div style={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777'}}>
                            <p>Select a conversation to start chatting.</p>
                         </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default ChatWindow;