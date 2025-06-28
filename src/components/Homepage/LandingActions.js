// src/components/LandingActions.js
import { Link } from 'react-router-dom';
import actionsStyles from './LandingActions.module.css';

const LandingActions = () => {
  return (
    <div className={actionsStyles.actions}>
      <div className={actionsStyles.card}>
        <h1 className={actionsStyles.title}>GYGG</h1>
        <Link to="/join">
          <button className={actionsStyles.signup}>Sign Up</button>
        </Link>
        <Link to="/login">
          <button className={actionsStyles.login}>Log In</button>
        </Link>
        <p className={actionsStyles.terms}>
          By Signing Up you agree to our{' '}
          <Link to="/terms" className={actionsStyles.link}>
            Terms of Use
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className={actionsStyles.link}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default LandingActions;
