import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosConfig';
import { format } from 'date-fns';
import { BillingModal } from './BillingModal';
import { Pagination } from 'antd';
import styles from './BillingTable.module.css';

export const BillingTable = () => {
  const [selectedGig, setSelectedGig] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['payments', currentPage],
    queryFn: async () => {
      const response = await apiClient.get(
        `/payments?page=${currentPage}&limit=${pageSize}`
      );
      return response.data;
    },
    keepPreviousData: true,
  });

  const handleCloseModal = () => setSelectedGig(null);
  const handlePageChange = page => setCurrentPage(page);

  if (isLoading) {
    return <p>Loading payments...</p>;
  }

  if (isError) {
    return <p>Error loading payments: {error?.message || 'Unknown error'}</p>;
  }

  const { payments } = data.data;
  const { total } = data;

  return (
    <>
      <div className={styles.container}>
        {selectedGig && (
          <BillingModal
            isOpen={!!selectedGig}
            onClose={handleCloseModal}
            gig={selectedGig}
          />
        )}
        <table className={styles.billingTable}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.headerCell}>Hired by</th>
              <th className={styles.headerCell}>Date</th>
              <th className={styles.headerCell}>Contract detail</th>
              <th className={styles.headerCell}>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className={`${styles.bodyCell} ${styles.noPaymentsCell}`}
                >
                  No payments found.
                </td>
              </tr>
            )}
            {payments.map((row, index) => (
              <tr key={index}>
                <td className={styles.bodyCell}>
                  {[row.payer.firstName, row.payer.lastName]
                    .filter(Boolean)
                    .join(' ')}
                </td>
                <td className={styles.bodyCell}>
                  {format(new Date(row.createdAt), 'MM-dd-yyyy')}
                </td>
                <td className={styles.bodyCell}>{row?.gig?.title || 'N/A'}</td>
                <td
                  className={`${styles.bodyCell} ${styles.invoiceLink}`}
                  onClick={() => setSelectedGig(row)}
                >
                  View
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        className={styles.pagination}
        current={currentPage}
        pageSize={pageSize}
        total={total}
        onChange={handlePageChange}
        showSizeChanger={false}
      />
    </>
  );
};
