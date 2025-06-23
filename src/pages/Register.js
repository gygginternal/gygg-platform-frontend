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
import styles from './Register.module.css';

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
        className={styles.flexContainer}
      >
        <Card className={styles.card}>
          <Heading as="h1" className={styles.heading}>
            Create Account
          </Heading>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <Text as="label" htmlFor="name" className={styles.label}>
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
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <Text as="label" htmlFor="email" className={styles.label}>
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
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <Text as="label" htmlFor="password" className={styles.label}>
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
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <Text
                as="label"
                htmlFor="confirmPassword"
                className={styles.label}
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
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <Text as="label" htmlFor="role" className={styles.label}>
                I want to
              </Text>
              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className={styles.select}
              >
                <option value="freelancer">Find Work</option>
                <option value="client">Hire Talent</option>
              </Select>
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <Text className={styles.text}>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>
              Login here
            </Link>
          </Text>
        </Card>
      </Flex>
    </Container>
  );
};

export default Register;
