// src/pages/NotFound/NotFound.js
// import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Styled from '../../styles/components';
import styles from './NotFound.module.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Styled.Container>
      <Styled.Flex
        direction="column"
        align="center"
        justify="center"
        className={styles.container}
      >
        <Styled.Card className={styles.card}>
          <Styled.Heading as="h1" className={styles.heading}>
            404
          </Styled.Heading>
          <Styled.Heading as="h2" className={styles.subHeading}>
            Page Not Found
          </Styled.Heading>
          <Styled.Text className={styles.text}>
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </Styled.Text>
          <Styled.Button onClick={() => navigate('/')}>
            Go to Homepage
          </Styled.Button>
        </Styled.Card>
      </Styled.Flex>
    </Styled.Container>
  );
};

export default NotFound;
