import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import styles from './VerifyEmailPromptPage.module.css';
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';

function VerifyEmailPromptPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(location.state?.email || '');
  const [resendStatus, setResendStatus] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [pageStatus, setPageStatus] = useState('prompt'); // 'prompt', 'success', 'error'
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Check for URL parameters that indicate verification result
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const urlEmail = searchParams.get('email');
    const token = searchParams.get('token');

    if (token) {
      // User clicked verification link from email - verify the token
      handleTokenVerification(token);
    } else if (error) {
      setPageStatus('error');
      setStatusMessage(message || 'Verification failed');
      if (urlEmail) {
        setEmail(decodeURIComponent(urlEmail));
      }
    } else if (message && message.includes('verified successfully')) {
      setPageStatus('success');
      setStatusMessage(message);
    } else if (message && message.includes('already verified')) {
      setPageStatus('success');
      setStatusMessage(message);
    }
  }, [searchParams]);

  const handleTokenVerification = async (token) => {
    try {
      setPageStatus('loading');
      setStatusMessage('Verifying your email...');
      
      // Call the backend API to verify the token
      const response = await apiClient.get(`/users/verifyEmail/${token}`);
      
      if (response.data.status === 'success') {
        setPageStatus('success');
        setStatusMessage('Email verified successfully! You can now log in.');
        logger.info('Email verification successful');
      }
    } catch (error) {
      logger.error('Email verification failed:', error);
      setPageStatus('error');
      
      if (error.response?.status === 400) {
        const errorMessage = error.response.data.message || 'Verification failed';
        setStatusMessage(errorMessage);
        
        // If token expired, try to extract email for resend functionality
        if (errorMessage.includes('expired')) {
          // You might want to extract email from the error response if available
          setStatusMessage('Your verification link has expired. Please request a new one.');
        }
      } else {
        setStatusMessage('Verification failed. Please try again or request a new verification email.');
      }
    }
  };

  const handleResendEmail = async () => {
    if (!email || email === 'your account email') {
      setResendStatus('Error: Please enter a valid email address');
      return;
    }

    setResendLoading(true);
    setResendStatus('');
    try {
      await apiClient.post('/users/resendVerificationEmail', { email });
      setResendStatus(
        'Verification email re-sent successfully! Check your inbox and spam folder.'
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

  const renderContent = () => {
    switch (pageStatus) {
      case 'loading':
        return (
          <>
            <h1 className={styles.title}>Verifying Your Email</h1>
            <div className={styles.iconContainer}>
              <div style={{ fontSize: '4rem', color: '#d99633', animation: 'spin 1s linear infinite' }}>⟳</div>
            </div>
            <p className={styles.instructionText}>
              {statusMessage || 'Please wait while we verify your email address...'}
            </p>
          </>
        );

      case 'success':
        return (
          <>
            <h1 className={styles.title}>Email Verified Successfully!</h1>
            <div className={styles.iconContainer}>
              <img
                src="/assets/check-circle.svg"
                alt="Success"
                width={80}
                height={80}
                onError={(e) => {
                  // Fallback to a simple checkmark if icon doesn't exist
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none', fontSize: '4rem', color: '#4ade80' }}>✓</div>
            </div>
            <p className={styles.instructionText}>
              {statusMessage}
            </p>
            <div className={styles.form}>
              <Link to="/login" className={styles.submitButton} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Continue to Login
              </Link>
            </div>
          </>
        );

      case 'error':
        return (
          <>
            <h1 className={styles.title}>Email Verification Failed</h1>
            <div className={styles.iconContainer}>
              <img
                src="/assets/error-circle.svg"
                alt="Error"
                width={80}
                height={80}
                onError={(e) => {
                  // Fallback to a simple X if icon doesn't exist
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none', fontSize: '4rem', color: '#ef4444' }}>✗</div>
            </div>
            <p className={styles.instructionText}>
              {statusMessage}
            </p>
            <div className={styles.form}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={styles.emailInput}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #555',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}
              />
              <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                className={styles.submitButton}
              >
                {resendLoading ? 'Sending...' : 'Send New Verification Email'}
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
              <Link className={styles.link} to="/login">
                Back to Login
              </Link>{' '}
              or{' '}
              <Link className={styles.link} to="/join">
                Create New Account
              </Link>
            </p>
          </>
        );

      default: // 'prompt'
        return (
          <>
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
          </>
        );
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
        {renderContent()}
      </section>
    </main>
  );
}

export default VerifyEmailPromptPage;
