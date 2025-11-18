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

        <p>Gygg Inc. (“<strong>Gygg</strong>”, “we”, “our”, “us”) operates an online marketplace platform that connects individuals aged 50 and older who seek to offer services (“<strong>Taskers</strong>”) with individuals seeking to hire them (“<strong>Provider</strong>”). Gygg provides only the digital infrastructure to facilitate discovery, communication, scheduling, and payment processing.</p>

        <p>Gygg is not a service provider, employer, co-employer, recruiter, placement agency, joint venture partner, franchisor, or manager of any Tasker or Provider. Gygg does not supervise, control, train, direct, evaluate, or monitor the work performed by Taskers.</p>

        <h3>1. Acceptance of Terms</h3>
        <p>By accessing or using the Gygg platform, you agree to be bound by these Terms of Service and our Privacy Policy.</p>

        <h3>2. Description of Service</h3>
        <ol type="a" class="tab">
          <li>Gygg operates solely as a <strong>marketplace</strong>. We do not provide, perform, or guarantee any services offered by users. All services are performed by independent individuals who are not employed by Gygg.</li>
          <li><p>Taskers are independent contractors and are not employees, agents, or representatives of Gygg. Gygg does not set hours, assign tasks, supply tools or equipment, supervise work, or evaluate performance.</p>
          <p>Taskers retain full control over:</p>
          <ul class="tab">
            <li>whether to accept jobs</li>
            <li>how work is performed</li>
            <li>their schedule</li>
            <li>their tools, equipment, and methods</li>
          </ul>
          </li>
          <li><p>Gygg does not provide Workplace Safety and Insurance Board (WSIB) coverage, workers’ compensation, or any employment benefits.</p>
          <p>Users agree:</p>
          <ul>
          <li>Gygg is not the “employer” of any Tasker under Ontario law.</li>
          <li>Gygg has no WSIB obligations.</li>
          <li>Users waive any right to assert a WSIB claim against Gygg.</li>
          <li>Posters are not “employers” of Gygg.</li>
          </ul>
          </li>
        </ol>

        <p>Taskers are solely responsible for their own insurance coverage, tax compliance, and safety.</p>
        
        <h3>3. Eligibility</h3>
        <p>You must be at least 50 years old to use the Platform. By using Gygg, you represent and
warrant that you have the legal capacity to enter into this agreement.</p>

        <h3>4. User Accounts</h3>
        <p>To access certain features of the Platform, you must register for an account. You are
responsible for maintaining the confidentiality of your account credentials and all activities that
occur under your account.</p>

        <h3>5. User Conduct</h3>
        <p>You agree not to:</p>
        <ul class="tab">
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
          <ul class="tab">
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
