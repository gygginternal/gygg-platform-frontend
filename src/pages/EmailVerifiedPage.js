// src/pages/EmailVerifiedPage.js
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import logger from '../utils/logger';
import ResendVerificationButton from '../components/ResendVerificationButton';
// import styles from './VerifyEmailPromptPage.module.css'; // Reuse styles or create new
import styles from './EmailVerifiedPage.module.css'; // New dedicated styles

function EmailVerifiedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = searchParams.get('token');
  const email = searchParams.get('email') || location.state?.email || '';

  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, failed
  const [message, setMessage] = useState(
    'Verifying your email, please wait...'
  );

  useEffect(() => {
    if (!token) {
      setMessage('Invalid verification link: Token is missing.');
      setVerificationStatus('failed');
      return;
    }

    const verifyTokenApiCall = async () => {
      try {
        logger.info(
          'EmailVerifiedPage: Attempting email verification with token:',
          token
        );
        // The backend route is /api/v1/users/verifyEmail/:token
        // The 'token' variable here is the actual token value from the URL query.
        await apiClient.get(`/users/verifyEmail/${token}`); // API call

        setMessage('Email successfully verified! Redirecting to login...');
        setVerificationStatus('success');

        // Redirect to login immediately
          navigate('/login', {
            state: { message: 'Email verified! Please log in.' },
        });
      } catch (err) {
        logger.error(
          'EmailVerifiedPage: Verification API call failed:',
          err.response?.data || err.message
        );
        setMessage(
          err.response?.data?.message ||
            'Email verification failed. The link may be invalid or expired. Please try resending the verification email.'
        );
        setVerificationStatus('failed');
      }
    };

    verifyTokenApiCall();
  }, [token, navigate]); // Depend on token and navigate

  return (
    <main className={styles.container}>
      <Link to="/" className={styles.logo}>
        <img src="/gygg-logo.svg" alt="GYGG logo" width={100} height={60} />
      </Link>
      <section className={styles.promptBox}>
        <h1 className={styles.title}>
          {verificationStatus === 'success' && 'Email Verified!'}
          {verificationStatus === 'failed' && 'Verification Failed'}
          {verificationStatus === 'verifying' && 'Verifying Your Email...'}
        </h1>
        <p
          className={`${styles.instruction} ${verificationStatus === 'failed' ? styles.failedInstruction : verificationStatus === 'success' ? styles.successInstruction : styles.verifyingInstruction}`}
        >
          {message}
        </p>
        {(verificationStatus === 'success' ||
          verificationStatus === 'failed') &&
          !message.toLowerCase().includes('redirecting') && (
            <Link to="/login" className={styles.button}>
              Go to Login
            </Link>
          )}
        {verificationStatus === 'failed' && (
          <div style={{ marginTop: '16px' }}>
            <ResendVerificationButton email={email} />
          </div>
        )}
        {verificationStatus === 'failed' && (
          <p className={styles.note}>
            If issues persist, try{' '}
            <Link to="/join" className={styles.link}>
              signing up again
            </Link>{' '}
            or contact support.
          </p>
        )}
      </section>
    </main>
  );
}

export default EmailVerifiedPage;
