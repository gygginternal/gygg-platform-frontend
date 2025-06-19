// src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Use react-router-dom Link
import styles from '../components/ForgotPasswordPage/ForgotPasswordPage.module.css'; // Create this CSS module
import InputField from '../components/Shared/InputField'; // Adjust path
import apiClient from '../api/axiosConfig'; // Adjust path
import logger from '../utils/logger'; // Optional logger
import { useToast } from '../context/ToastContext';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  // Handler expected by InputField
  const handleChange = (name, value) => {
    setEmail(value);
  };

  // Handler for form submission
  const handleSubmit = async e => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address.', { type: 'error' });
      return;
    }
    setLoading(true);

    try {
      logger.info('Requesting password reset for:', email);
      await apiClient.post('/users/forgotPassword', { email });
      showToast(
        'If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder).',
        { type: 'success' }
      );
    } catch (err) {
      logger.error('Forgot password error:', err.response?.data || err.message);
      showToast(
        'If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder).',
        { type: 'success' }
      );
    } finally {
      setLoading(false);
    }
  };

  // Simple handler for the "Re-enter" text click (just clears fields/messages)
  const handleResendClick = () => {
    setEmail('');
  };

  return (
    <main className={styles.container}>
      {/* Use standard img tag for logo */}
      <Link to="/" className={styles.logo}>
        <img
          src="/assets/gygg-logo.svg"
          alt="GYGG logo"
          width={100}
          height={60}
        />
      </Link>

      <section className={styles.formContainer}>
        {/* Only show title and icon if no message is displayed */}
        {!showToast.message && (
          <>
            <h1 className={styles.title}>Enter email to reset your password</h1>
            <div className={styles.iconContainer}>
              {/* Use standard img tag */}
              <img
                src="/assets/mail-notification.svg" // Ensure this exists in public folder
                alt="Mail Notification"
                width={80} // Adjusted size
                height={80}
              />
            </div>
          </>
        )}

        {/* Display Success/Info Message */}
        {showToast.message && (
          <p className={styles.infoMessage}>{showToast.message}</p>
        )}

        {/* Hide form after success message? Optional */}
        {!showToast.message && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="ex. email@domain.com"
              value={email}
              onChange={handleChange} // Pass the handler
              required
            />
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {/* Text shown below the form or below the success message */}
        <p className={styles.retryText}>
          Didn&apos;t get an email?{' '}
          <span onClick={handleResendClick} className={styles.retryLink}>
            Re-enter your email
          </span>{' '}
          and try again. You can also{' '}
          <Link className={styles.link} to="/login">
            Log In
          </Link>{' '}
          or{' '}
          <Link className={styles.link} to="/join">
            Sign Up
          </Link>
          .
        </p>
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
