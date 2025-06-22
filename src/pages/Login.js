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
        style={{ minHeight: '100vh', padding: '20px' }}
      >
        <Card style={{ width: '100%', maxWidth: '400px' }}>
          <Heading
            as="h1"
            style={{ textAlign: 'center', marginBottom: '24px' }}
          >
            Welcome Back
          </Heading>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <Text
                as="label"
                htmlFor="email"
                style={{ display: 'block', marginBottom: '8px' }}
              >
                Email
              </Text>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <Text
                as="label"
                htmlFor="password"
                style={{ display: 'block', marginBottom: '8px' }}
              >
                Password
              </Text>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {error && <ErrorText>{error}</ErrorText>}
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <Text style={{ textAlign: 'center', marginTop: '16px' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)' }}>
              Register here
            </Link>
          </Text>
        </Card>
      </Flex>
    </Container>
  );
};

export default Login;
