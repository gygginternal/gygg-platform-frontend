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
  Select,
} from '../styles/components';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'freelancer',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.name,
        formData.role
      );
      showToast('Successfully registered!', 'success');
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
      showToast('Failed to register. Please try again.', 'error');
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
            Create Account
          </Heading>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <Text
                as="label"
                htmlFor="name"
                style={{ display: 'block', marginBottom: '8px' }}
              >
                Full Name
              </Text>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
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
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text
                as="label"
                htmlFor="password"
                style={{ display: 'block', marginBottom: '8px' }}
              >
                Password
              </Text>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text
                as="label"
                htmlFor="confirmPassword"
                style={{ display: 'block', marginBottom: '8px' }}
              >
                Confirm Password
              </Text>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <Text
                as="label"
                htmlFor="role"
                style={{ display: 'block', marginBottom: '8px' }}
              >
                I want to
              </Text>
              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="freelancer">Find Work</option>
                <option value="client">Hire Talent</option>
              </Select>
            </div>
            {error && <ErrorText>{error}</ErrorText>}
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <Text style={{ textAlign: 'center', marginTop: '16px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)' }}>
              Login here
            </Link>
          </Text>
        </Card>
      </Flex>
    </Container>
  );
};

export default Register;
