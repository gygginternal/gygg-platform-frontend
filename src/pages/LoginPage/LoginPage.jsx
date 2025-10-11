// src/pages/LoginPage.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Use react-router-dom
import styles from './LoginPage.module.css'; // Create this CSS Module
import InputField from '../../components/common/InputField'; // Adjust path if needed
import ErrorDisplay from '../../components/common/ErrorDisplay';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
import apiClient from '../../api/axiosConfig'; // Adjust path if needed
import logger from '../../utils/logger'; // Optional: Adjust path if needed
import { useToast } from '../../contexts/ToastContext';
import useErrorHandler from '../../hooks/useErrorHandler';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { errors, hasErrors, setError, handleApiError, clearOnInputChange } =
    useErrorHandler();
  const navigate = useNavigate();
  const { login, selectSessionRole } = useAuth();
  const location = useLocation();
  const selectedRole = location.state?.selectedRole || null;
  const { showToast } = useToast();

  // Handler expected by our InputField component
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    clearOnInputChange(); // Clear errors on input change
  };

  const handleSubmit = async e => {
    e.preventDefault();
    clearOnInputChange();

    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    const payload = { email: formData.email, password: formData.password };

    try {
      logger.info('Attempting login...');
      const response = await apiClient.post('/users/login', payload);
      logger.info('Login successful:', response.data);

      if (response.data.data.token && response.data.data.user) {
        const userRoles = response.data.data.user.role || [];
        if (selectedRole && !userRoles.includes(selectedRole)) {
          setError(
            `You do not have access as a ${selectedRole === 'tasker' ? 'Tasker' : 'Provider'}. Please log in with the correct role.`
          );
          return;
        }
        login(response.data.data.token, response.data.data.user); // Update auth context
        if (selectedRole) {
          selectSessionRole(selectedRole);
        }
        if (response.data.redirectToOnboarding) {
          logger.info(
            `Redirecting to onboarding: ${response.data.redirectToOnboarding}`
          );
          return navigate(response.data.redirectToOnboarding); // Navigate to onboarding path
        }
        navigate('/feed'); // Redirect to dashboard
      } else {
        logger.error(
          'Login failed: Invalid response structure.',
          response.data
        );
        showToast('Login failed. Unexpected response from server.', {
          type: 'error',
        });
      }
    } catch (err) {
      logger.error('Login error:', err.response?.data || err.message);
      handleApiError(err);
      showToast(
        err.response?.data?.message ||
          'Login failed. Please check credentials or network.',
        { type: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // Use standard div or main, not next/image directly here for logo link
    <main className={styles.container}>
      <Link to="/" className={styles.logo}>
        {/* Link logo to home */}
        <img
          src="/assets/gygg-logo.svg" // Ensure this is in public folder
          alt="GYGG logo"
          width={100} // Adjust size
          height={60}
        />
      </Link>

      <section className={styles.formContainer}>
        <h1 className={styles.title}>
          Log In
          {selectedRole
            ? ` as ${selectedRole === 'tasker' ? 'Tasker' : 'Provider'}`
            : ''}
        </h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <InputField
            label="Email"
            name="email"
            type="email"
            placeholder="ex. email@domain.com"
            value={formData.email}
            onChange={handleChange}
            required
            labelColor="#fff"
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            icon="password"
            required // Use icon prop
            labelColor="#fff"
          />

          {/* Error display */}
          {hasErrors && <ErrorDisplay errors={errors} variant="inline" />}

          <div className={styles.footer}>
            {/* Forgot Password Link */}
            <div className={styles.forgotPasswordWrapper}>
              {/* Make sure /forgot-password route exists in App.js */}
              <Link to="/forgot-password" className={styles.forgotPassword}>
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading
                ? 'Logging in...'
                : `Login${
                    selectedRole
                      ? ` as ${selectedRole === 'tasker' ? 'Tasker' : 'Provider'}`
                      : ''
                  }`}
            </button>

            {/* Sign Up Link */}
            <p className={styles.signupText}>
              Don&apos;t have an account yet?{' '}
              {/* Use /join as the entry point for signup flow */}
              <Link to="/join" className={styles.link}>
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
