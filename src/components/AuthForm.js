import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import styles from './AuthForm.module.css'; // 👈 CSS Module import

function AuthForm({ isLogin }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        passwordConfirm: '',
        role: ['tasker']
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const url = isLogin ? '/users/login' : '/users/signup';
        let payload;

        if (isLogin) {
            // Login payload is fine
            payload = { email: formData.email, password: formData.password };
            console.log("Login Payload being sent:", payload); // Keep for debugging
             if (!payload.password) {
                  setError("Frontend Check: Password seems empty before sending!");
                  setLoading(false);
                  return;
              }
        } else { // Signup
            // Frontend check for password match
            if (formData.password !== formData.passwordConfirm) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }
            // Create payload for signup, including passwordConfirm
            payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                passwordConfirm: formData.passwordConfirm, // <<< MUST be included
                role: formData.role
                // Add other fields like phoneNo if needed:
                // phoneNo: formData.phoneNo
            };
            // delete payload.passwordConfirm; // <<< --- REMOVE THIS LINE ---

            console.log("Signup Payload being sent:", payload); // Keep for debugging
             if (!payload.passwordConfirm) { // This check should now pass if input field is correct
                  setError("Frontend Check: Password confirmation seems empty before sending!");
                  setLoading(false);
                  return;
              }
        }

        try {
            console.log(`Sending ${isLogin ? 'Login' : 'Signup'} request to ${url} with payload...`);
            const response = await apiClient.post(url, payload);
            console.log(`${isLogin ? 'Login' : 'Signup'} successful.`);
            if (response.data.token && response.data.data.user) {
                login(response.data.token, response.data.data.user);
                navigate('/feed');
            } else {
                setError('Request failed: Invalid server response.');
            }
        } catch (err) {
            console.error(`Error during ${isLogin ? 'login' : 'signup'}:`, err.response?.data || err.message);
            setError(err.response?.data?.message || `Failed to ${isLogin ? 'login' : 'sign up'}.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            {!isLogin && (
                <>
                    <div className={styles.inputGroup}>
                        <label htmlFor="firstName">First Name</label>
                        <input id="firstName" type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="lastName">Last Name</label>
                        <input id="lastName" type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="role">Sign up as:</label>
                        <select id="role" name="role" value={formData.role[0]} onChange={(e) => setFormData(prev => ({ ...prev, role: [e.target.value] }))}>
                            <option value="tasker">Tasker</option>
                            <option value="provider">Provider</option>
                        </select>
                    </div>
                </>
            )}
            <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            {!isLogin && (
                <div className={styles.inputGroup}>
                    <label htmlFor="passwordConfirm">Confirm Password</label>
                    <input id="passwordConfirm" type="password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} required />
                </div>
            )}
            {error && <p className={styles.errorMessage}>{error}</p>}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
        </form>
    );
}

export default AuthForm;
