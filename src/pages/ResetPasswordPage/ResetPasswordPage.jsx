import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import { useToast } from '../contexts/ToastContext';
import styles from './ResetPasswordPage.module.css';

function ResetPasswordPage() {
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from either URL params or query params
    const resetToken = paramToken || searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      showToast('Invalid reset link. Please request a new password reset.', 'error');
      navigate('/forgot-password');
    }
  }, [paramToken, searchParams, navigate, showToast]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.patch(`/users/resetPassword/${token}`, {
        password,
        passwordConfirm,
      });
      showToast('Password reset successful!', 'success');
      navigate('/login');
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to reset password.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={passwordConfirm}
          onChange={e => setPasswordConfirm(e.target.value)}
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
