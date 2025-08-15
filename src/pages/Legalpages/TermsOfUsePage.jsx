// src/pages/TermsOfUsePage.js
import React from 'react';
import styles from './LegalPages.module.css'; // Shared CSS for legal pages
import { Link } from 'react-router-dom';

function TermsOfUsePage() {
  // Replace this with your actual Terms of Use content
  const termsContent = `
        <h2>Terms of Use</h2>
        <p><strong>Last Updated: August 12, 2025 </strong></p>

        <p>Welcome to Gygg! These Terms of Use (“Terms”) govern your access to and use of our website, mobile applications, and services (collectively, the “Service”). Please review these Terms carefully. By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you disagree with any part, do not use the Service.</p>

        <h3>1. Acceptance of Terms</h3>
        <ul>
        <li>By using Gygg, you confirm you are at least 50 years old and have the legal capacity to enter into contracts in your jurisdiction.</li>
        <li>You are responsible for compliance with all local laws and regulations while using the Service.</li>
        </ul>

        <h3>2. Service Description</h3>
        <ul>
        <li>Gygg is an online platform acting solely as an intermediary to connect users seeking to obtain help (“Providers”) with users offering such services (“Taskers”).</li>
        <li>Gygg does not employ, supervise, or guarantee the actions of any Provider or Tasker. You agree that all services are provided under independent relationships between users.</li>
        </ul>

        <h3>3. User Accounts & Verification</h3>
        <ul>
        <li>Account creation may require identity verification, age confirmation, and eligibility screening; Gygg may use third-party services for these checks.</li>
        <li>You are solely responsible for account confidentiality and all activities under your account.</li>
        <li>Gygg does not routinely perform criminal or background checks. Users are advised to use their own judgment when interacting with others on the platform.</li>
        </ul>

        <h3>4. Platform Role & Liability</h3>
        <ul>
            <li>Gygg is not a party to any agreement for services between users and does not control the quality, timing, legality, or failure to provide services.</li>
            <li>Gygg is not responsible for, and disclaims all liability regarding, user conduct or the outcome of any services arranged through the platform.</li>
        </ul>

        <h3>Gigs, Payments, Fees, and Taxes</h3>
        <ul> 
        <li>Payment Processing: Payments are facilitated using a third-party payment provider. Gygg does not hold funds. See Payment FAQ for current providers.</li>
        <li>Fees: Users agree to Gygg’s fees (currently, $5 per gig booking plus 5% of total gig cost).</li>
        <li>Refunds & Cancellations: Refund and cancellation terms for gigs are detailed within the platform, and may involve, but are not limited to, partial or full refund policies depending on circumstances. Users agree to check these before posting or accepting gigs.</li>
        <li>Taxes: Taskers are solely responsible for determining, collecting, reporting, and remitting any and all applicable taxes, HST/GST, or regulatory costs resulting from use of the Service.</li>
        <li>No Employer Status: No agency, employment, partnership, or joint venture is created by use of this platform.</li>
        </ul>

        <h3>6. Indemnification</h3>
        <ul> 
        <li>You agree to indemnify and hold harmless Gygg Inc. and its affiliates, directors, employees, and agents from any claims, suits, liabilities, damages, costs or expenses (including reasonable legal fees) arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.</li>
        </ul>

        <h3>7. Assumption of Risk & Safety</h3>
        <ul>
        <li>Users acknowledge that in-person meetings and transactions carry inherent risks, including but not limited to property damage, physical or mental harm, or loss. You voluntarily assume all such risks.</li>
        <li>Users are responsible for ensuring their own safety and conducting their own due diligence prior to participating in any gig.</li>
        <li>Gygg provides safety tips but cannot guarantee user safety.</li>
        </ul>

        <h3>8. Dispute Resolution & Arbitration</h3>
        <ul>
        <li>If a dispute arises, users must first attempt to resolve it in good faith through the platform’s dispute resolution process.</li>
        <li>For unresolved disputes, all parties agree to submit to binding arbitration, waiving the right to initiate or participate in class actions or jury trials, to the maximum extent permitted by law.</li>
        <li>Arbitration venue will be in Ontario, Canada.</li>
        </ul>

        <h3>9. User Conduct and Content</h3>
        <ul>
        <li>You agree not to use the Service for any unlawful, fraudulent, or harmful purposes, or post any offensive, infringing, or misleading content.</li>
        <li>Gygg reserves the right to remove or restrict content or accounts at its sole discretion.</li>
        </ul>

        <h3>10. Account Suspension & Termination</h3>
        <ul>
        <li>Gygg may suspend or terminate your access to the Service at any time, with or without notice, for breach of these Terms or any applicable law.</li>
        </ul>

        <h3>11. Intellectual Property</h3>
        <ul>
        <li>The Service, including all intellectual property, is owned by Gygg Inc. or its licensors. Users may not copy, modify, or distribute content except as permitted under these Terms.</li>
        </ul>

        <h3>12. Privacy & Data Use</h3>
        <ul>
        <li>Your data is processed per our Privacy Policy, including data collected for identification or security.</li>
        <li>Gygg may share information as required by law or for safety, fraud prevention, or compliance purposes.</li>
        </ul>

        <h3>13. Changes to Terms</h3>
        <ul>
        <li>Gygg reserves the right to amend these Terms at any time. Material changes will be communicated via email or platform notice with at least 30 days’ advance notice.</li>
        </ul>

        <h3>14. Governing Law</h3>
        <ul>
        <li>These Terms are governed by the laws of Ontario, Canada, without regard to its conflicts of law principles.</li>
        </ul>

        <h3>15. Contact</h3>
        <ul>
        <li>For questions about these Terms, contact: hello@gygg.co</li>
        </ul>
    `;

  return (
    <div className={styles.legalPageContainer}>
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
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default TermsOfUsePage;
