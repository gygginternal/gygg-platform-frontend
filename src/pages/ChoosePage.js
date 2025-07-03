import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../components/JoinPage/JoinPage.module.css'; // Will copy to ChoosePage.module.css

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
    onClick={() => onClick(roleName)}
    role="button"
    tabIndex={0}
    onKeyPress={e => {
      if (e.key === 'Enter' || e.key === ' ') onClick(roleName);
    }}
  >
    <img
      src={imageSrc}
      alt={title}
      className={styles.cardLogo}
      height={64}
      width={64}
    />
    <h3 className={styles.cardTitle}>{title}</h3>
    <p className={styles.cardDescription}>{description}</p>
  </div>
);

function ChoosePage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [message, setMessage] = useState('');

  const handleContinueClick = () => {
    if (!selectedRole) {
      setMessage('Please select a role to continue.');
      return;
    }
    // Navigate to the login page, passing the selected role in the state
    navigate('/login', { state: { selectedRole } });
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
        <h2 className={styles.title}>Choose Your Role to Log In</h2>
        <div className={styles.cardContainer}>
          <RoleCard
            roleName="tasker"
            imageSrc="/assets/briefcase.svg"
            title="Tasker (Task Executor)"
            description="Find flexible work that fits your skills and schedule. Help others and earn money."
            selected={selectedRole === 'tasker'}
            onClick={setSelectedRole}
          />
          <RoleCard
            roleName="provider"
            imageSrc="/assets/user.svg"
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
          {selectedRole
            ? `Continue as ${selectedRole === 'tasker' ? 'Tasker' : 'Provider'}`
            : 'Select a Role'}
        </button>
        {message && <p className={styles.message}>{message}</p>}
        <p className={styles.loginText}>
          Don&apos;t have an account?{' '}
          <Link to="/join" className={styles.link}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ChoosePage;
