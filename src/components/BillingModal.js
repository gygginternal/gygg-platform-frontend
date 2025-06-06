import React from "react";
import { Dialog } from "@headlessui/react";
import styles from "./BillingModal.module.css";

export const BillingModal = ({ isOpen, onClose, gig }) => {
  if (!gig) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className={styles.backdrop} aria-hidden="true" />

      {/* Modal Content */}
      <div className={styles.modalWrapper}>
        <Dialog.Panel className={styles.panel}>
          {/* Header */}
          <header>
            <button
              aria-label="Close invoice"
              className={styles.closeButton}
              onClick={onClose}
            >
              X
            </button>
            <Dialog.Title className={styles.title}>
              Invoice
            </Dialog.Title>
            <p className={styles.invoiceNumber}>
              #{gig._id || "N/A"}
            </p>
          </header>

          {/* Gig Title Section */}
          <section className={styles.section}>
            <div className={styles.flexRow}>
              <p className={styles.label}>
                Gig title
              </p>
              <p className={styles.value} style={{ width: 321 }}>
                {gig.gig.title || "N/A"}
              </p>
            </div>
          </section>

          <hr className={styles.hr} style={{ top: "14rem" }} />

          {/* Earnings Section */}
          <section className={styles.section}>
            <div className={styles.flexRow}>
              <p className={styles.label} style={{ width: 178, top: "15.6rem" }}>
                Your total earnings
              </p>
              <p className={styles.value} style={{ top: "14.9rem" }}>
                ${((gig.amount || 0) / 100).toFixed(2)}
              </p>
            </div>
          </section>

          <hr className={styles.hr} style={{ top: "18.5rem" }} />

          {/* Fees and Taxes Section */}
          <section className={styles.section}>
            <div className={styles.flexRow}>
              <p className={styles.label} style={{ width: 143, top: "20.2rem" }}>
                Fees and taxes
              </p>
              <p className={styles.value} style={{ top: "19.8rem", width: 80 }}>
                ${((gig.applicationFeeAmount || 0) / 100).toFixed(2)}
              </p>
            </div>
          </section>

          <section className={styles.section} style={{ marginTop: "4rem" }}>
            <div className={styles.flexRow}>
              <p className={styles.bigLabel} style={{ top: "25.6rem" }}>
                Your earnings after fees and taxes
              </p>
              <p className={styles.bigValue} style={{ top: "24.9rem" }}>
                ${((gig.amountReceivedByPayee || 0) / 100).toFixed(2)}
              </p>
            </div>
          </section>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
