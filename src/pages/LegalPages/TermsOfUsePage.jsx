// src/pages/TermsOfUsePage.js
import React from 'react';
import styles from './LegalPages.module.css'; // Shared CSS for legal pages
import { Link } from 'react-router-dom';

function TermsOfUsePage() {
  // Replace this with your actual Terms of Use content
  const termsContent = `
        <h2>Terms of Use</h2>
        <p><strong>Last Updated: June 13, 2025 </strong></p>

        <p>Welcome to Gygg Platform! These Terms of Use ("Terms") govern your access to and use of our website, mobile applications, and services (collectively, the "Service"). Please read these Terms carefully before using the Service.</p>

        <h3>1. Acceptance of Terms</h3>
        <p>By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to all of these Terms, do not use the Service.</p>

        <h3>2. Description of Service</h3>
        <p>Gygg Platform provides an online platform that connects users seeking to obtain short-term services ("Providers") with users seeking to provide such services ("Taskers").</p>

        <h3>3. User Accounts</h3>
        <p>To access certain features of the Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>

        <h3>4. User Conduct</h3>
        <p>You agree not to use the Service to:</p>
        <ul>
            <li>Violate any local, state, national, or international law.</li>
            <li>Post any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
            <li>Impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
        </ul>

        <h3>5. Gigs and Payments</h3>
        <p>Details regarding gig posting, acceptance, payment processing, and fees are outlined within the platform and are considered part of these Terms. Platform fees are 5$ fees for booking the gig and 5% of variable fees applied based on charges to be paid to users seeking to provide services ("Taskers").</p>

        <h3>6. Intellectual Property</h3>
        <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Gygg Inc. and its licensors.</p>

        <h3>7. Termination</h3>
        <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>

        <h3>8. Disclaimer of Warranties</h3>
        <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Your use of the Service is at your sole risk. The Service is provided without warranties of any kind, whether express or implied.</p>

        <h3>9. Limitation of Liability</h3>
        <p>In no event shall Gygg Inc., nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.</p>

        <h3>10. Governing Law</h3>
        <p>These Terms shall be governed and construed in accordance with the laws of Ontario, Canada, without regard to its conflict of law provisions.</p>

        <h3>11. Changes to Terms</h3>
        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

        <h3>12. Contact Us</h3>
        <p>If you have any questions about these Terms, please contact us at: hello@gygg.co</p>
    `;

  return (
    <div className={styles.legalContainer}>
      <div className={styles.logo}>
        <Link to="/">
          <img
            src="/assets/gygg-logo.svg"
            alt="GYGG Logo"
            width={100}
            height={60}
          />
        </Link>
      </div>
      <article
        className={styles.legalContent}
        dangerouslySetInnerHTML={{ __html: termsContent }}
      />
      <div className={styles.footerActions}>
        <Link to="/" className={styles.backToHomeButton}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.backIcon}
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default TermsOfUsePage;
