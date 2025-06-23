import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useSocket } from '../contexts/SocketContext';
import {
  Container,
  Card,
  Button,
  Heading,
  Text,
  Flex,
  Input,
} from '../styles/components';
import apiClient from '../api/axiosConfig';
import styles from './Chat.module.css';

const Chat = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const [messagesResponse, userResponse] = await Promise.all([
          apiClient.get(`/chat/${id}/messages`),
          apiClient.get(`/users/${id}`),
        ]);

        if (!messagesResponse.ok || !userResponse.ok) {
          throw new Error('Failed to load chat data');
        }

        const [messagesData, userData] = await Promise.all([
          messagesResponse.data,
          userResponse.data,
        ]);

        setMessages(messagesData);
        setChatUser(userData);
      } catch (error) {
        showToast('Failed to load chat data', 'error');
        navigate('/messages');
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [id, showToast, navigate]);

  useEffect(() => {
    if (!socket || !id) return;

    // Join the chat room
    socket.emit('join-chat', id);

    // Listen for new messages
    socket.on('new-message', message => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.emit('leave-chat', id);
      socket.off('new-message');
    };
  }, [socket, id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !id) return;

    try {
      await apiClient.post(`/chat/${id}/messages`, { content: newMessage });
      setNewMessage('');
      // Refresh messages after sending
      const messagesResponse = await apiClient.get(`/chat/${id}/messages`);
      setMessages(messagesResponse.data);
    } catch (error) {
      showToast('Failed to send message', 'error');
    }
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <Text color="text.secondary">Loading chat...</Text>
        </Card>
      </Container>
    );
  }

  if (!chatUser) {
    return null;
  }

  return (
    <Container>
      <Flex direction="column" gap="lg" className={styles.padding}>
        {/* Chat Header */}
        <Card>
          <Flex justify="space-between" align="center">
            <div>
              <Heading as="h1" className={styles.marginBottom}>
                Chat with {chatUser.name}
              </Heading>
              <Text color="text.secondary">
                {chatUser.role.charAt(0).toUpperCase() + chatUser.role.slice(1)}
              </Text>
            </div>
            <Button variant="outline" as="a" href={`/profile/${chatUser.id}`}>
              View Profile
            </Button>
          </Flex>
        </Card>

        {/* Messages */}
        <Card className={styles.heightCalc}>
          <Flex direction="column" gap="md" className={styles.height}>
            {messages.length === 0 ? (
              <Text color="text.secondary" style={{ textAlign: 'center' }}>
                No messages yet. Start the conversation!
              </Text>
            ) : (
              messages.map(message => {
                const isOwnMessage = message.senderId === user?.id;
                return (
                  <Flex
                    key={message.id}
                    justify={isOwnMessage ? 'flex-end' : 'flex-start'}
                  >
                    <Card
                      className={`${styles.maxWidth} ${isOwnMessage ? styles.backgroundColorPrimary : styles.backgroundColorNeutral}`}
                    >
                      <Text>{message.content}</Text>
                      <Text
                        size="sm"
                        color="text.secondary"
                        className={styles.marginTop}
                      >
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </Text>
                    </Card>
                  </Flex>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </Flex>
        </Card>

        {/* Message Input */}
        <Card>
          <form onSubmit={handleSendMessage}>
            <Flex gap="md">
              <Input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className={styles.flex}
              />
              <Button type="submit" variant="primary">
                Send
              </Button>
            </Flex>
          </form>
        </Card>
      </Flex>
    </Container>
  );
};

export default Chat;
