import { MapPin, User, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { format } from 'date-fns'; // Import date-fns for formatting dates
import styles from '../components/ContractDetailsPage/ContractDetailsPage.module.css'; // Import CSS Modules
import ContractPayment from '../components/ContractDetailsPage/ContractPayment';

export default function ContractDetailsPage({ gig, contract, user, children }) {
  if (!gig) return null;
  const formattedDate = gig.createdAt
    ? format(new Date(gig.createdAt), 'MM-dd-yyyy')
    : 'N/A';
  // Assume contractId and user role are available
  const contractId = contract?.id || gig.contractId || gig.id;
  const isProvider = user?.role?.includes('provider');
  return (
    <div className={styles.pageContainer}>
      <Link
        // variant="ghost" // This is a prop, not a classname
        className={styles.backButton}
        to={{
          pathname: '/contracts',
        }}
      >
        <ArrowLeft className={styles.backButtonIcon} />
        Back to contract list
      </Link>
      <Card className={styles.card}>
        <CardHeader className={styles.cardHeader}>
          <div className={styles.cardHeaderContent}>
            <h1 className={styles.gigTitle}>{gig.title}</h1>
          </div>
        </CardHeader>

        <CardContent className={styles.cardContent}>
          <div className={styles.detailRow}>
            <div className={styles.detailItem}>
              <User className={styles.detailIcon} />
              <span className={styles.detailLabel}>Hired by</span>
              <span className={styles.providerName}>
                {[gig.postedBy?.firstName, gig.postedBy?.lastName]
                  .filter(Boolean)
                  .join(' ')}
              </span>
            </div>
          </div>

          <div className={styles.gigDescription}>
            <em>{gig.title}</em>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Started</span>
              <span className={styles.infoValue}>{formattedDate}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Fee</span>
              <span className={styles.feeValue}>${gig.cost}</span>
            </div>

            {/* <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Deadline</span>
              <span className="text-sm font-medium">
                {details.duration} hours
              </span>
            </div> */}
          </div>

          {contractId && (
            <ContractPayment contractId={contractId} isProvider={isProvider} />
          )}

          {children}

          {/* <div className="flex gap-3 pt-4">
            <Button
              className="flex-1 bg-gray-800 hover:bg-gray-900"
              onClick={onSubmitComplete}
            >
              Submit as Complete
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={onEndContract}
            >
              End Contract
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
