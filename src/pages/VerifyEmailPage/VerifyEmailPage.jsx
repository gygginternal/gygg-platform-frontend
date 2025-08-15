import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import styles from './VerifyEmailPage.module.css';
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';
import { useToast } from '../../contexts/ToastContext';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const urlMessage = searchParams.get('message');
    const urlEmail = searchParams.get('email');

    // If there's an error parameter, it means the backend redirected with an error
    if (error) {
      setStatus('error');
      setMessage(urlMessage || 'Email verification failed.');
      if (urlEmail) {
        setEmail(decodeURIComponent(urlEmail));
      }
      return;
    }

    // If there's a success message parameter, it means verification was successful
    if (urlMessage && !error) {
      setStatus('success');
      setMessage(urlMessage);
      showToast('Email verified successfully!', { type: 'success' });
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      return;
    }

    // If there's a token, verify it via API
    if (token) {
      verifyEmailToken(token);
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [searchParams, navigate, showToast]);

  const verifyEmailToken = async (token) => {
    try {
      logger.info('Attempting email verification with token:', token);
      
      // Call the backend API endpoint
      const response = await apiClient.get(`/users/verifyEmail/${token}`);
      
      if (response.data.status === 'success') {
        setStatus('success');
        setMessage('Email verified successfully! You can now log in.');
        showToast('Email verified successfully!', { type: 'success' });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      logger.error('Email verification error:', error);
      setStatus('error');
      
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.response?.status === 400) {
        setMessage('Invalid or expired verification token. Please request a new verification email.');
      } else {
        setMessage('Email verification failed. Please try again or request a new verification email.');
      }
      
      showToast('Email verification failed', { type: 'error' });
    }
  };

  const handleResendEmail = async () => {
    if (!email || email === 'your account email' || email.trim() === '') {
      setResendStatus('Error: Please enter a valid email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setResendStatus('Error: Please enter a valid email address');
      return;
    }

    setResendLoading(true);
    setResendStatus('');
    try {
      await apiClient.post('/users/resendVerificationEmail', { email: email.trim() });
      setResendStatus(
        'Verification email re-sent successfully! Check your inbox and spam folder.'
      );
      logger.info('Resent verification email for:', email);
    } catch (error) {
      let errorMessage = 'Failed to re-send email. Please try again later.';
      
      if (error.response?.status === 429) {
        errorMessage = error.response?.data?.message || 'Too many verification attempts. Please wait before requesting another email.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
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
    switch (status) {
      case 'verifying':
        return (
          <>
            <h1 className={styles.title}>Verifying Your Email</h1>
            <div className={styles.iconContainer}>
              <div style={{ fontSize: '4rem', color: '#d99633', animation: 'spin 1s linear infinite' }}>⟳</div>
            </div>
            <p className={styles.instructionText}>
              Please wait while we verify your email address...
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
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none', fontSize: '4rem', color: '#4ade80' }}>✓</div>
            </div>
            <p className={styles.instructionText}>
              {message}
            </p>
            <p className={styles.instructionText} style={{ fontSize: '0.875rem', color: '#bbb', fontStyle: 'italic' }}>
              Redirecting you to login in 3 seconds...
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
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none', fontSize: '4rem', color: '#ef4444' }}>✗</div>
            </div>
            <p className={styles.instructionText}>
              {message}
            </p>
            <div className={styles.form}>
              {email && (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={styles.emailInput}
                />
              )}
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

      default:
        return null;
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

export default VerifyEmailPage;