import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  Container,
  Card,
  Input,
  Button,
  Heading,
  Text,
  Flex,
  ErrorText,
} from '../styles/components';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      showToast('Successfully logged in!', 'success');
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      showToast('Failed to login. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

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
            Welcome Back
          </Heading>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <Text as="label" htmlFor="email" className={styles.label}>
                Email
              </Text>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <Text as="label" htmlFor="password" className={styles.label}>
                Password
              </Text>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className={styles.input}
              />
            </div>
            {error && (
              <ErrorText className={styles.errorText}>{error}</ErrorText>
            )}
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className={styles.button}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <Text className={styles.text}>
            Don&apos;t have an account?{' '}
            <Link to="/register" className={styles.link}>
              Register here
            </Link>
          </Text>
        </Card>
      </Flex>
    </Container>
  );
};

export default Login;
