import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './VerifyEmailPromptPage.module.css';
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';

function VerifyEmailPromptPage() {
  const location = useLocation();
  const email = location.state?.email || 'your account email';
  const [resendStatus, setResendStatus] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendStatus('');
    try {
      await apiClient.post('/users/resendVerificationEmail', { email });
      setResendStatus(
        'Verification email re-sent successfully! Check your inbox.'
      );
      logger.info('Resent verification email for:', email);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to re-send email. Please try again later.';
      setResendStatus(`Error: ${errorMessage}`);
      logger.error(
        'Failed to resend verification email:',
        error.response?.data || error.message
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <Link to="/" className={styles.logo}>
        <img
          src="/assets/gygg-logo.svg"
          alt="GYGG logo"
          width={100}
          height={60}
        />
      </Link>
      <section className={styles.formContainer}>
        <h1 className={styles.title}>Verify Your Email</h1>
        <div className={styles.iconContainer}>
          <img
            src="/assets/mail-notification.svg"
            alt="Mail Notification"
            width={80}
            height={80}
          />
        </div>
        <p className={styles.instructionText}>
          A verification email has been sent to <strong>{email}</strong>
          <br />
          Please check your inbox (and spam/junk folder!) to verify your
          account.
        </p>
        <div className={styles.form}>
          <button
            onClick={handleResendEmail}
            disabled={resendLoading}
            className={styles.submitButton}
          >
            {resendLoading ? 'Sending...' : 'Resend Verification Email'}
          </button>
          {resendStatus && (
            <p
              className={
                resendStatus.startsWith('Error')
                  ? styles.error
                  : styles.infoMessage
              }
            >
              {resendStatus}
            </p>
          )}
        </div>
        <p className={styles.retryText}>
          Didn&apos;t get an email?{' '}
          <span
            onClick={handleResendEmail}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') handleResendEmail();
            }}
            className={styles.retryLink}
            role="button"
            tabIndex={0}
            aria-label="Resend verification email"
          >
            Resend email
          </span>
          . You can also{' '}
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

export default VerifyEmailPromptPage;
