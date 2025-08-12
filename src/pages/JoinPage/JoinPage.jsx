// src/pages/JoinPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Use react-router-dom hooks/components
import styles from './JoinPage.module.css'; // Create this CSS module
// Assuming you have the logo in public/
// import logo from '/gygg-logo.svg';

// Card Component (can be extracted if used elsewhere)
const RoleCard = ({
  roleName,
  imageSrc,
  title,
  description,
  selected,
  onClick,
}) => (
  <div
    className={`${styles.card} ${selected ? styles.selected : ''}`}
    onClick={() => onClick(roleName)} // Pass roleName on click
    role="button" // Accessibility
    tabIndex={0} // Accessibility
    onKeyPress={e => {
      if (e.key === 'Enter' || e.key === ' ') onClick(roleName);
    }} // Accessibility
  >
    {/* Use standard img tag */}
    <img
      src={imageSrc}
      alt={title}
      className={styles.cardLogo}
      height={64} // These fixed attributes are overridden by CSS for responsiveness
      width={64} // The CSS `width: 50px; height: 50px;` (and media queries) controls the actual size
    />
    <h3 className={styles.cardTitle}>{title}</h3>
    <p className={styles.cardDescription}>{description}</p>
  </div>
);

function JoinPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(''); // State to track selected role
  const [message, setMessage] = useState('');

  const handleContinueClick = () => {
    if (!selectedRole) {
      setMessage('Please select a role to continue.');
      return;
    }
    // Navigate to the signup page, passing the selected role in the state
    navigate('/signup', { state: { selectedRole } });
  };

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.logo}>
        <img
          src="/assets/gygg-logo.svg"
          alt="GYGG logo"
          width={100}
          height={60}
        />
      </Link>
      <div className={styles.content}>
        <h2 className={styles.title}>Join as a Tasker or Provider</h2>
        <div className={styles.cardContainer}>
          <RoleCard
            roleName="tasker" // Value to pass
            imageSrc="/assets/briefcase.svg" // Ensure this exists in public/assets
            title="Tasker (Task Executor)"
            description="Find flexible work that fits your skills and schedule. Help others and earn money."
            selected={selectedRole === 'tasker'}
            onClick={setSelectedRole}
          />
          <RoleCard
            roleName="provider" // Value to pass
            imageSrc="/assets/user.svg" // Ensure this exists in public/assets
            title="Provider (Service Provider)"
            description="Get help with your tasks. Find reliable taskers for anything from errands to skilled work."
            selected={selectedRole === 'provider'}
            onClick={setSelectedRole}
          />
        </div>
        <button
          className={styles.continueButton}
          onClick={handleContinueClick}
          disabled={!selectedRole}
        >
          {/* Button text changes based on selection */}
          {selectedRole
            ? `Sign Up as ${selectedRole === 'tasker' ? 'a Tasker' : 'a Provider'}`
            : 'Select a Role'}
        </button>
        {message && <p className={styles.message}>{message}</p>}
        <p className={styles.loginText}>
          Already have an account?{' '}
          <Link to="/choose" className={styles.link}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default JoinPage;
