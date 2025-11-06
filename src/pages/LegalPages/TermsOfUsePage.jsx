// src/pages/TermsOfUsePage.js
import React from 'react';
import styles from './LegalPages.module.css'; // Shared CSS for legal pages
import { Link } from 'react-router-dom';

function TermsOfUsePage() {
  // Replace this with your actual Terms of Use content
  const termsContent = `
        <h2>Terms of Use</h2>
        <p><strong>Last Updated: 2025-11-04 </strong></p>

        <p>Please read these Terms of Use (“<strong>Terms</strong>”) carefully before using the Gygg Platform (“<strong>Gygg</strong>,” “we,” “us,” or “our”), operated by Gygg Inc.</p>

        <p>By accessing or using the Gygg Platform (including any applications, websites, or services), you
agree to be bound by these Terms. If you do not agree with these Terms, you may not access or
use the Platform.</p>

        <h3>1. Acceptance of Terms</h3>
        <p>These Terms constitute a legally binding agreement between you and Gygg Inc. Your use of the
Platform signifies your agreement to these Terms and our Privacy Policy.</p>

        <h3>2. Description of Service</h3>
        <p>Gygg provides an online platform that connects users seeking to obtain short-term services
(“<strong>Providers</strong>”) with users seeking to provide such services (“<strong>Taskers</strong>”).
Gygg is <strong>not</strong> an employer, contractor, or joint venture partner of any user. We do <strong>not</strong> supervise,
direct, or control any user’s work or services. Users operate independently and are solely
responsible for the services they provide or receive.</p>
        
        <h3>3. Eligibility</h3>
        <p>You must be at least 50 years old to use the Platform. By using Gygg, you represent and
warrant that you have the legal capacity to enter into this agreement.</p>

        <h3>4. User Accounts</h3>
        <p>To access certain features of the Platform, you must register for an account. You are
responsible for maintaining the confidentiality of your account credentials and all activities that
occur under your account.</p>

        <h3>5. User Conduct</h3>
        <p>You agree not to:</p>
        <ul>
            <li>Violate any local, state, national, or international law.</li>
            <li>Post or transmit any unlawful, harmful, defamatory, obscene, or otherwise objectionable
content;​</li>
            <li>Impersonate another person or misrepresent your affiliation;​</li>
            <li>Interfere with or disrupt the Platform or any user’s experience.​</li>
        </ul>

        <h3>6. Service Agreements Between Users</h3>
        <p>All service arrangements are solely between Taskers and Providers. Gygg is not a party to any
agreement between users and does not guarantee the quality, safety, legality, or performance of
services offered.</p>

        <h3>7. Payments</h3>
        <p>Payments are processed via third-party providers (e.g., Stripe). You agree to comply with the
terms and policies of these third-party services. Gygg is not liable for any issues arising from
payment processing.</p>

        <h3>8. Ratings and Reviews</h3>
        <p>Users may leave reviews and ratings for one another after a service is completed. You agree
that such feedback must be honest, accurate, and respectful.</p>

        <h3>9. Intellectual Property</h3>
        <p>All content, trademarks, and materials on the Gygg Platform are the property of Gygg Inc. or its
licensors. You may not reproduce, distribute, or create derivative works without express written
permission.</p>

        <h3>10. Termination</h3>
        <p>Gygg reserves the right to suspend or terminate your account and access to the Platform at our
sole discretion, with or without notice, for any reason, including violations of these Terms.</p>

        <h3>11. Disclaimer: No Employment or Payment Obligation</h3>
          <p>Gygg Inc. is <strong>not</strong> an employer, payment agent, or party to any agreement between users.</p>
          <p>Taskers and Providers enter into agreements with each other directly and are responsible for
complying with applicable laws, including employment, tax, and labor regulations.</p>
          <p>Gygg does not:</p>
          <ul>
          <li>Withhold taxes;​</li>
          <li>Provide insurance, employee benefits, or workers’ compensation;​​</li>
          <li>Guarantee or verify any payments between users.​</li>
        </ul>
        <p>All financial transactions are facilitated through third-party services (e.g., Stripe), and Gygg does
<strong>not</strong> act as a principal in any transaction.</p>

        <h3>12. Limitation of Liability</h3>
        <p>Gygg is not liable for indirect, incidental, punitive, or consequential damages arising from your
use of the Platform or interactions with other users.</p>

        <h3>13. Indemnification</h3>
        <p>You agree to indemnify and hold harmless Gygg, its affiliates, officers, directors, employees, and
agents from any claims, damages, or expenses arising from your use of the Platform or your
violation of these Terms.</p>

      <h3>14. Governing Law</h3>
        <p>These Terms shall be governed by and construed in accordance with the laws of the Province of
Ontario, Canada, without regard to its conflict of laws principles.</p>

      <h3>15. Changes to Terms</h3>
      <p>Gygg may update these Terms from time to time. We will notify you of material changes, and
continued use of the Platform constitutes your acceptance of the updated Terms.</p>

      <h3>16. Contact Us</h3>
      <p>For questions or concerns, please contact:​ <strong>hello@gygg.co</strong></p>
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
