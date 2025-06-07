import React, { useState, useEffect, useCallback } from "react";
import styles from "./ChatWindow.module.css"; // Your CSS Module
import ChatHeader from "./ChatHeader";
import MessageThread from "./MessageThread";
import MessageInput from "./MessageInput";
import apiClient from "../api/axiosConfig"; // Adjust path
import { useAuth } from "../context/AuthContext"; // Adjust path as needed
import socket from "../socket"; // Import the shared socket instance

function ChatWindow({ selectedContractId, chatPartner }) {
  const { user } = useAuth();
  const userId = user?._id || null; // Get user ID from context, fallback to null if not available
  const chatPartnerId = chatPartner?.id || null; // Get chat partner ID from props, fallback to null if not available

  const [messages, setMessages] = useState([]);

  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");

  // Fetch messages when a contract is selected
  const fetchMessages = useCallback(async () => {
    if (!selectedContractId) {
      setMessages([]); // Clear messages if no contract selected
      return;
    }
    setLoadingMessages(true);
    setError("");
    try {
      console.info(`Fetching messages for contract: ${selectedContractId}`);
      const response = await apiClient.get(
        `/chat/contracts/${selectedContractId}/messages`
      );
      setMessages(response.data.data.messages || []);
      console.debug("Fetched messages:", response.data.data.messages);
    } catch (err) {
      console.error(
        "Error fetching messages:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Failed to load messages.");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedContractId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!userId || !chatPartnerId) return;

    // Subscribe to the chat channel
    const chatChannel = `chat:${userId}:${chatPartnerId}`;
    socket.emit("subscribeToChat", {
      currentUserId: userId,
      targetUserId: chatPartnerId,
    });
    console.info(`Subscribed to chat channel: ${chatChannel}`);

    // Listen for new chat messages
    socket.on("newChatMessage", (message) => {
      console.info("New chat message received:", message);

      // Only add the message if the sender is not the current user
      if (message.sender !== userId) {
        console.log("ok");

        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    // Cleanup on component unmount
    return () => {
      socket.off("newChatMessage");
    };
  }, [userId, chatPartnerId]);

  // Handler for sending a new message
  const handleSendMessage = async (messageText) => {
    if (!selectedContractId) {
      setError("No conversation selected to send message.");
      throw new Error("No conversation selected."); // Let MessageInput handle its sending state
    }
    setError("");
    try {
      console.info(
        `Sending message to contract ${selectedContractId}: ${messageText}`
      );
      const response = await apiClient.post(
        `/chat/contracts/${selectedContractId}/messages`,
        {
          message: messageText, // Backend expects 'message' field
        }
      );
      // Optimistically add the new message to the local state
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...response.data.data.message, sender: user }, // Mark as sent by the current user
      ]);
      console.debug("Message sent successfully:", response.data.data.message);
    } catch (err) {
      console.error(
        "Error sending message:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Failed to send message.");
      throw err; // Re-throw to let MessageInput know it failed
    }
  };

  return (
    <section className={styles.chatWindow}>
      <div className={styles.container}>
        <div className={styles.chatContent}>
          <ChatHeader chatPartner={chatPartner} />
          {error && (
            <p className="error-message" style={{ padding: "10px" }}>
              {error}
            </p>
          )}
          {loadingMessages ? (
            <div
              style={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p>Loading messages...</p>
            </div>
          ) : selectedContractId ? (
            <>
              <MessageThread messages={messages} />
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={!selectedContractId}
              />
            </>
          ) : (
            <div
              style={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#777",
              }}
            >
              <p>Select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ChatWindow;
