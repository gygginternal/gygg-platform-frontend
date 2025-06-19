import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  Button,
  Heading,
  Text,
  Flex,
} from '../styles/components';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ minHeight: '100vh', padding: '20px' }}
      >
        <Card style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <Heading as="h1" style={{ fontSize: '6rem', marginBottom: '16px' }}>
            404
          </Heading>
          <Heading as="h2" style={{ marginBottom: '16px' }}>
            Page Not Found
          </Heading>
          <Text
            style={{
              marginBottom: '24px',
              color: 'var(--color-text-secondary)',
            }}
          >
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </Text>
          <Button onClick={() => navigate('/')}>Go to Homepage</Button>
        </Card>
      </Flex>
    </Container>
  );
};

export default NotFound;
