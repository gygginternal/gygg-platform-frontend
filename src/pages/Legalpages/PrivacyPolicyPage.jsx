// src/pages/PrivacyPolicyPage.js
import React from 'react';
import styles from './LegalPages.module.css'; // Shared CSS
import { Link } from 'react-router-dom';

function PrivacyPolicyPage() {
  const privacyContent = `
        <h2>Privacy Policy</h2>
        <p><strong>Last Updated: August 12, 2025</strong></p>

        <p>At Gygg Inc. ("Gygg", "we", "us", "our"), we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, how we protect it, and your rights.
By using Gygg’s website, mobile applications, or services (the “Service”), you agree to the practices described below. If you do not agree, you must stop using the Service.</p>

        <h3>1. Who We Are and How to Contact Us</h3>
        <p>Gygg Inc. is the data controller for your personal information (under PIPEDA, GDPR, or other applicable laws).</p>
        <p>Gygg Inc.</p>
        <p>Email: hello@gygg.co</p>

        <h3>2. Scope and Legal Compliance</h3>
        <p>This Privacy Policy applies to all users of Gygg worldwide.</p>
        <ul>
        <li>For Canadian residents, we comply with PIPEDA and any applicable provincial privacy laws.</li>
        <li>For EU/UK residents, we comply with GDPR.</li>
        <li>For California residents, we comply with CCPA/CPRA.</li>
        </ul>

        <h3>3. Data We Collect</h3>
        <p>We may collect the following categories of personal information:</p>
        <ul>
            <li><strong>Identity Data</strong> Name, username, gender, date of birth, government-issued ID (for verification), photo, age confirmation.</li>
            <li><strong>Contact Data</strong> Email, phone number, billing and service addresses.</li>
            <li><strong>Financial Data</strong> Bank account/payout details, partial payment card data (processed via Stripe).</li>
            <li><strong>Transaction Data</strong> Records of gigs posted, accepted, payments, refunds.</li>
            <li><strong>Technical Data</strong>  IP address, device type, operating system, browser type, location, analytics data.</li>
            <li><strong>Profile Data</strong> Skills, experience, preferences, reviews, ratings, chat/messages.</li>
            <li><strong>Background Check Data</strong> When required, identity verification results and, if applicable, criminal record check results (processed via approved third-party providers).</li>
            <li><strong>Usage Data</strong> Pages viewed, features used, time on site/app.</li>
            <li><strong>Marketing and Communications Data</strong> Marketing preferences, opt-ins, unsubscribes.
We may also use Aggregated Data (non-identifiable statistics) for analytics and marketing.</li>
        </ul>
        
        <h3>4. How We Collect Data</h3>
        <ul>
            <li>Directly from you (registration, gig posting, profile creation, communications)</li>
            <li>Automatically (cookies, analytics tools, server logs)</li>
            <li>From third parties (payment processors, ID verification providers, public records)</li>
        </ul>

        <h3>5. How We Use Your Data</h3>
        <p>We use your personal information to:</p>
        <ol style="margin-left: 40px;">
            <li>Create and manage your account</li>
            <li>Facilitate gig postings, matches, communication, and payments</li>
            <li>Verify your identity and eligibility to use the Service</li>
            <li>Process payments and send payouts</li>
            <li>Ensure safety and prevent fraud</li>
            <li>Send service updates, policy changes, and marketing (if opted in)</li>
            <li>Meet legal, tax, and compliance obligations</li>
        </ol>
        <p>We do not sell your personal information</p>

        <h3>6. When We Share Your Data</h3>
        <p>We may share your information with:</p>
        <ul>
            <li><strong>Other Users:</strong> Limited profile data (e.g., name, photo, skills, city, reviews) to facilitate gigs</li>
            <li><strong>Service Providers:</strong> Stripe, AWS, identity verification providers, customer support systems</li>
            <li><strong>Legal Authorities:</strong> When required by law or to protect safety</li>
            <li><strong>Advisors/Insurers:</strong> For legal, accounting, or insurance purposes</li>
        </ul>

        <h3>7. Location of Storage & Transfers</h3>
        <p>Your data may be stored in Canada, the United States, or other countries where our service providers operate.
        If transferred outside Canada, we ensure adequate safeguards under PIPEDA, GDPR, or other applicable frameworks.</p>

        <h3>8. Cookies & Tracking</h3>
        <p>We use cookies and similar tools for:</p>
        <ul>
              <li>Essential site functions</li>
              <li>Analytics (e.g., Google Analytics, Mixpanel)</li>
              <li>Security and fraud prevention</li>
        </ul>
        <p>You can adjust cookie settings in your browser, but disabling them may affect site functionality.</p>

        <h3>9. Retention of Your Data</h3>
        <ul>
                <li><strong>Account data:</strong> kept while actively using the Service and for up to 2 years after closure</li>
                <li><strong>Financial and transaction records:</strong> kept for 7 years to comply with tax and legal requirements</li>
                <li><strong>Verification records:</strong> kept for 90 days after completion, unless dispute or claim is pending</li>        
        </ul>

        <h3>10. Your Rights</h3>
        <p>Under applicable laws, you may:</p>
        <ul>
                  <li>Access your data</li>
                  <li>Request correction or deletion</li>
                  <li>Object to processing</li>
                  <li>Withdraw consent for marketing</li>
                  <li>Request data portability (GDPR)</li>
                  <li>File a complaint with the relevant privacy authority</li>
        </ul>
        <p>Requests can be made at hello@gygg.co.</p>
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
