// src/pages/PrivacyPolicyPage.js
import React from 'react';
import styles from './LegalPages.module.css'; // Shared CSS
import { Link } from 'react-router-dom';

function PrivacyPolicyPage() {
  const privacyContent = `
        <h2>Privacy Policy</h2>
        <p><strong>Last Updated: June 13, 2025 </strong></p>

        <p>At Gygg Platform ("we", "us", "our"), we respect your privacy and are committed to protecting your personal data. This Privacy Policy will inform you as to how we look after your personal data when you visit our website or use our services (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>

        <h3>1. Important Information and Who We Are</h3>
        <p><strong>Purpose of this Privacy Policy:</strong> This Privacy Policy aims to give you information on how Gygg Platform collects and processes your personal data through your use of this platform, including any data you may provide when you sign up, post a gig, apply for a gig, or use our services.</p>
        <p><strong>Controller:</strong> Gygg Inc. is the controller and responsible for your personal data.</p>
        <p><strong>Contact Details:</strong> Gygg Inc., [Your Address], hello@gygg.co</p>

        <h3>2. The Data We Collect About You</h3>
        <p>Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
        <ul>
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier, date of birth.</li>
            <li><strong>Contact Data</strong> includes billing address, delivery address, email address, and telephone numbers.</li>
            <li><strong>Financial Data</strong> includes payment card details (processed by Stripe, we do not store full card numbers) and bank account details for payouts (managed via Stripe Connect).</li>
            <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of services you have purchased or provided through our platform.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this platform.</li>
            <li><strong>Profile Data</strong> includes your username and password, gigs posted or applied for, your interests, preferences (including peoplePreference, hobbies, skills), feedback, and review responses.</li>
            <li><strong>Usage Data</strong> includes information about how you use our website, products, and services.</li>
            <li><strong>Marketing and Communications Data</strong> includes your preferences in receiving marketing from us and our third parties and your communication preferences.</li>
        </ul>
        <p>We also collect, use, and share "Aggregated Data" such as statistical or demographic data for any purpose.</p>

        <h3>3. How Your Personal Data Is Collected</h3>
        <p>We use different methods to collect data from and about you including through:</p>
        <ul>
            <li><strong>Direct interactions.</strong> You may give us your Identity, Contact, Profile and Financial Data by filling in forms or by corresponding with us by post, phone, email or otherwise.</li>
            <li><strong>Automated technologies or interactions.</strong> As you interact with our platform, we will automatically collect Technical Data about your equipment, browsing actions and patterns.</li>
            <li><strong>Third parties or publicly available sources.</strong> We may receive personal data about you from various third parties like Stripe (for payment processing and identity verification for Connect).</li>
        </ul>

        <h3>4. How We Use Your Personal Data</h3>
        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
        <ul>
            <li>To register you as a new user.</li>
            <li>To manage your relationship with us, including notifying you about changes to our terms or privacy policy.</li>
            <li>To enable you to participate in posting or applying for gigs.</li>
            <li>To process and deliver payments, fees, and charges.</li>
            <li>To administer and protect our business and this platform (including troubleshooting, data analysis, testing, system maintenance, support, reporting and hosting of data).</li>
        </ul>

        <h3>5. Disclosures of Your Personal Data</h3>
        <p>We may share your personal data with the parties set out below for the purposes set out in this privacy policy:</p>
        <ul>
            <li>Service providers acting as processors (e.g., Stripe for payment processing, AWS for hosting).</li>
            <li>Professional advisers including lawyers, bankers, auditors, and insurers.</li>
            <li>Regulators and other authorities.</li>
        </ul>

        <h3>6. Data Security</h3>
        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>

        <h3>7. Data Retention</h3>
        <p>We will only retain your personal data for as long as reasonably necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements.</p>

        <h3>8. Your Legal Rights</h3>
        <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, or to object to processing.</p>

        <h3>9. Changes to The Privacy Policy</h3>
        <p>We keep our privacy policy under regular review. This version was last updated on June 13, 2025.</p>

        <h3>10. Contact Us</h3>
        <p>If you have any questions about this privacy policy or our privacy practices, please contact us at: hello@gygg.co</p>
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
        dangerouslySetInnerHTML={{ __html: privacyContent }}
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

export default PrivacyPolicyPage;
