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
import styles from './NotFound.module.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Flex
        direction="column"
        align="center"
        justify="center"
        className={styles.container}
      >
        <Card className={styles.card}>
          <Heading as="h1" className={styles.heading}>
            404
          </Heading>
          <Heading as="h2" className={styles.subHeading}>
            Page Not Found
          </Heading>
          <Text className={styles.text}>
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
