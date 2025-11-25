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
          <li><p>Marketplace only</p>
          <p>Gygg operates solely as a <strong>marketplace</strong>. We do not provide, perform, or guarantee any services offered by users. All services are performed by independent individuals who are not employed by Gygg.</p></li>
          <li><p>No employment relationship</p>
          <p>Taskers are independent contractors and are not employees, agents, or representatives of Gygg. Gygg does not set hours, assign tasks, supply tools or equipment, supervise work, or evaluate performance.</p>
          <p>Taskers retain full control over:</p>
          <ul class="tab">
            <li>whether to accept jobs</li>
            <li>how work is performed</li>
            <li>their schedule</li>
            <li>their tools, equipment, and methods</li>
          </ul>
          </li>
          <li><p>No WSIB coverage</p>
          <p>Gygg does not provide Workplace Safety and Insurance Board (WSIB) coverage, workers’ compensation, or any employment benefits.</p>
          <p>Users agree:</p>
          <ul>
          <li>Gygg is not the “employer” of any Tasker under Ontario law.</li>
          <li>Gygg has no WSIB obligations.</li>
          <li>Users waive any right to assert a WSIB claim against Gygg.</li>
          <li>Providers are not “employers” of Gygg.</li>
          </ul>
          </li>
        </ol>

        <p>Taskers are solely responsible for their own insurance coverage, tax compliance, and safety.</p>

        <h3>3. Payments</h3>
        <ol type="a" class="tab">
          <li><p>Stripe Connect</p>
          <p>Gygg uses Stripe and Stripe Connect to manage payments, store payment credentials, verify identities, and facilitate payouts. By using Gygg, all users agree to comply with Stripe’s Terms of Service, Privacy Policy, onboarding procedures, KYC, AML, and any information requests.</p></li>
          <li><p>Gygg does not handle or hold money</p>
          <p>All funds are held by Stripe on behalf of the relevant users. Gygg never holds, manages, or transfers funds.</p></li>
          <li><p>Authorization</p>
          <p>Providers authorize Stripe to charge the payment method on file when a job is approved as complete. Taskers authorize Stripe to issue payouts and consent to delays or reversals based on Stripe’s fraud or dispute processes.</p></li>
          <li><p>Chargebacks</p>
          <p>Stripe’s decision is final. Gygg is not liable for chargebacks, disputes, reversals, payment failures, fraud flags, or bank-related delays.</p></li>
        </ol>

        <h3>4. Fees and Comission Structure</h3>
        <p>Providers pay a non-refundable booking fee of [$X] per job posting.</p>
        <p>Taskers pay a commission based on the final job price:</p>
        <ul class="tab">
          <li>15 percent for jobs up to $X</li>
          <li>10 percent for jobs between $X and $Y</li>
          <li>5 percent for jobs above $Y</li>
        </ul>
        <p>These fees may change with notice.</p>
        <p>All Gygg fees are non-refundable unless required by law.</p>

        <h3>5. Identity Verification and Background Checks</h3>
        <ol type="a" class="tab">
          <li><p>Verification tools</p>
          <p>Gygg may use Stripe Identity, Veriff, Persona, Trulioo, or similar services to verify identity and age.</p></li>
          <li><p>Background checks</p>
          <p>If performed, background checks:</p>
          <ul class="tab">
            <li>are name-based, not fingerprint-based</li>
            <li>rely on third-party databases</li>
            <li>may be incomplete or inaccurate</li>
            <li>do not eliminate risk</li>
            <li>are not a guarantee of user safety</li>
          </ul>
          <p>Users acknowledge that verification is a risk-reduction tool only, not a security guarantee.</p>
          </li>
          <li><p>No reliance</p>
          <p>Users agree that Gygg is not responsible for the completeness, accuracy, timeliness, or validity of background checks or identity data.</p></li>
        </ol>
        
        <h3>6. User Conduct and Assumption of Risk</h3>
        <ol type="a" class="tab">
          <li><p>User responsibility</p>
          <p>Gygg does not screen, supervise, or monitor users. Users are fully responsible for their own decisions, interactions, and safety.</p></li>
          <li><p>Customer-side risk assumption</p>
          <p>Provider acknowledge:</p>
          <ul class="tab">
            <li>allowing a stranger into their home is at their own risk</li>
            <li>Gygg is not responsible for vetting, qualifications, behaviour, or trustworthiness of Taskers</li>
            <li>Provider must take reasonable precautions</li>
          </ul>
          </li>
          <li><p>Tasker-side responsibility</p>
          <p>Tasker acknowledge:</p>
          <ul class="tab">
            <li>they perform work at their own risk</li>
            <li>they are solely responsible for their conduct, safety, tools, and actions</li>
            <li>they assume all risks of entering a Provider’s home or property</li>
          </ul>
          </li>
        </ol>

        <h3>7. Liability Disclaimers</h3>
        <p>To the maximum extent permitted by law:</p>
        <p>Gygg is not liable for any:</p>
        <ul class="tab">
          <li>property damage</li>
          <li>theft, loss, or disappearance of items</li>
          <li>bodily injury, accidents, or illness</li>
          <li>negligence or misconduct by users</li>
          <li>intentional or criminal acts</li>
          <li>harassment, discrimination, or inappropriate behaviour</li>
          <li>inaccurate identity information</li>
          <li>incomplete background checks</li>
          <li>disputes between Providers and Taskers</li>
          <li>service outcomes, quality, or timeliness</li>
          <li>payments, chargebacks, or bank errors</li>
          <li>data breaches affecting Stripe or third parties</li>
        </ul>

        <p>Users waive all claims against Gygg arising from the actions, omissions, or negligence of any user.</p>

        <p>Gygg does not guarantee the safety, skills, suitability, identity, qualifications, behaviour, or performance of any user.</p>

        <h3>8. Dispute Resolution Between Users</h3>
        <p>Gygg may offer optional mediation but is not obligated to resolve disputes. Payments disputes are handled through Stripe.</p>

        <p>Gygg does not guarantee refunds, reimbursements, or resolutions.</p>

        <h3>9. Indemnification</h3>
        <p>Users agree to indemnify and hold harmless Gygg and its directors, founders, employees, and partners from any claims, losses, damages, liabilities, legal fees, or expenses arising from:</p>
        <ul class="tab">
          <li>user actions or omissions</li>
          <li>property damage or injury</li>
          <li>Stripe disputes</li>
          <li>WSIB or employment-related claims</li>
          <li>criminal acts</li>
          <li>breach of these Terms</li>
          <li>misuse of the platform</li>
        </ul>

        <p>This indemnity survives termination of the user’s account.</p>

        <h3>10. No Control Over Work</h3>
        <p>Gygg does not:</p>
        <ul class="tab">
          <li>supervise work</li>
          <li>direct work methods</li>
          <li>train Taskers</li>
          <li>supply tools</li>
          <li>evaluate performance</li>
          <li>require hours</li>
          <li>guarantee work quality</li>
        </ul>

        <p>This is intentional and legally required for marketplace classification.</p>

        <h3>11. Fraud Prevention</h3>
        <p>Gygg may use internal and third-party tools for fraud detection including:</p>
        <ul class="tab">
          <li>device fingerprinting</li>
          <li>behavioural analytics</li>
          <li>pattern recognition</li>
          <li>identity risk modelling</li>
          <li>payment behaviour monitoring</li>
        </ul>

        <p>Gygg may suspend or terminate accounts flagged for elevated risk.</p>

        <h3>12. Prohibited Activities</h3>
        <p>Users may not use Gygg for activities that:</p>
        <ul class="tab">
          <li>violate Canadian law or Stripe’s Acceptable Use Policy</li>
          <li>involve illegal services, fraud, or scams</li>
          <li>involve minors</li>
          <li>involve dangerous, regulated, or licensed work unless legally qualified</li>
          <li>involve harassment, discrimination, weapons, or exploitation</li>
          <li>include sexual services or adult content</li>
          <li>are unsafe or inappropriate for older adults</li>
        </ul>

        <h3>13. Insurance</h3>
        <p>Gygg may maintain its own general liability insurance.</p>
        <p>Any optional user-facing guarantees (if introduced) are strictly limited, narrow in scope, and subject to exclusions such as:</p>
        <ul class="tab">
          <li>intentional acts</li>
          <li>theft</li>
          <li>harassment or assault</li>
          <li>criminal conduct</li>
          <li>unsafe environments</li>
          <li>high-risk activities</li>
        </ul>

        <p>Users acknowledge insurance is primarily to protect Gygg, not users.</p>

        <h3>14. Binding Arbitration and Class Action Waiver</h3>
        <p>To the extent permitted by Ontario and Canadian law:</p>
        <ul class="tab">
          <li>All disputes between users and Gygg must be resolved through binding arbitration.</li>
          <li>Users waive the right to sue Gygg in court.</li>
          <li>Users waive the right to participate in class actions, class arbitrations, or joint claims.</li>
        </ul>

        <h3>15. Termination</h3>
        <p>Gygg may terminate or suspend accounts at any time for any reason including:</p>
        <ul class="tab">
          <li>fraud or risk indicators</li>
          <li>failed identity verification</li>
          <li>user complaints</li>
          <li>safety concerns</li>
          <li>Stripe violations</li>
        </ul>

        <h3>16. Governing Law</h3>
        <p>These Terms are governed by the laws of Ontario and the federal laws of Canada.</p>

        <h3>17. Amendments</h3>
        <p>Gygg may update these Terms at any time. Continued use after changes constitutes acceptance.</p>

        <h3>18. Contact Us</h3>
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
