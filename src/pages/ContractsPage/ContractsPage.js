import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import apiClient from '../../api/axiosConfig';
import ContractCard from '../../components/ContractsPage/ContractCard';
import ContractDetail from '../../components/ContractsPage/ContractDetail';
import BillingPayments from '../../components/ContractsPage/BillingPayments';
import SearchHeader from '../../components/ContractsPage/SearchHeader';
import styles from './ContractsPage.module.css';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const searchTerm = '';
const error = '';

function ContractsPage() {
  const [activeTab, setActiveTab] = useState('contracts');
  const [view, setView] = useState('list');
  const [selectedContract, setSelectedContract] = useState(null);
  const [billingData, setBillingData] = useState({
    inProgress: 0,
    available: 0,
    entries: [],
  });

  const queryClient = useQueryClient();

  // Fetch contracts from backend
  const { data: contractsData, isLoading: contractsLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => apiClient.get('/contracts'),
  });

  const { data: _statsData } = useQuery({
    queryKey: ['contractStats'],
    queryFn: async () => {
      const response = await apiClient.get('/contracts/stats');
      const { data } = response;
      const _totalEarned = data?.totalEarned || 0;
      return response.data;
    },
  });

  const { data: balanceData } = useQuery({
    queryKey: ['balance'],
    queryFn: () =>
      apiClient
        .get('/payments/balance')
        .catch(() => ({ data: { data: { available: 0, pending: 0 } } })),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const contracts = contractsData?.data?.data?.contracts || [];
  const _balance = balanceData?.data?.data || { available: 0, pending: 0 };

  // Fetch billing data and balance
  useEffect(() => {
    async function fetchBillingData() {
      try {
        const [paymentsRes, balanceRes] = await Promise.all([
          apiClient.get('/payments'),
          apiClient
            .get('/payments/balance')
            .catch(() => ({ data: { data: { available: 0, pending: 0 } } })),
        ]);

        const payments = paymentsRes.data.data.payments || [];
        const balance = balanceRes.data.data;

        // Calculate totals from payments
        const _totalEarned =
          payments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;
        const inProgress = balance.pending || 0;
        const available = balance.available || 0;

        const entries = payments.map(p => ({
          paymentId: p._id,
          hiredBy:
            `${p.payer?.firstName || ''} ${p.payer?.lastName || ''}`.trim() ||
            'Unknown',
          date: format(new Date(p.createdAt), 'MM-dd-yyyy'),
          contractDetail: p.contract?.title || p.gig?.title || 'Contract',
          invoice: 'View',
          totalEarnings: (p.amount || 0) / 100,
          feesAndTaxes:
            ((p.taxAmount || 0) + (p.applicationFeeAmount || 0)) / 100,
          netEarnings: (p.amountReceivedByPayee || 0) / 100,
        }));

        setBillingData({
          inProgress,
          available,
          entries,
        });
      } catch (err) {
        // console.error('Error fetching billing data:', err);
      }
    }
    fetchBillingData();
  }, []);

  const handleContractClick = contract => {
    setSelectedContract(contract);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedContract(null);
  };

  const handleWithdraw = async amount => {
    try {
      await apiClient.post('/payments/withdraw', { amount });
      queryClient.invalidateQueries(['balance']);
      toast.success('Withdrawal initiated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    }
  };

  const _handleInvoiceDownload = async _invoiceId => {
    // Implementation for invoice download
  };

  const handleSearch = _searchValue => {
    // Implementation for search
  };

  // Filter contracts based on search term
  const filteredContracts = contracts.filter(
    contract =>
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.hiredBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (contractsLoading) {
    return (
      <div className={styles.background}>
        <div className={styles.container}>
          <div className={styles.cardWrapper}>
            <div className={styles.contentArea}>
              <div className={styles.loadingState}>
                <p>Loading contracts...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.background}>
        <div className={styles.container}>
          <div className={styles.cardWrapper}>
            <div className={styles.contentArea}>
              <div className={styles.errorState}>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <div className={styles.cardWrapper}>
          <div className={styles.tabs}>
            <button
              onClick={() => {
                setActiveTab('contracts');
                setView('list');
              }}
              className={`${styles.tabButton} ${
                activeTab === 'contracts' ? styles.activeTab : ''
              }`}
            >
              All Contracts
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`${styles.tabButton} ${
                activeTab === 'billing' ? styles.activeTab : ''
              }`}
            >
              Billing and payment
            </button>
          </div>

          <div className={styles.contentArea}>
            {activeTab === 'contracts' && (
              <>
                <SearchHeader onSearch={handleSearch} />
                {view === 'list' ? (
                  <div className={styles.grid}>
                    {filteredContracts.length === 0 ? (
                      <div className={styles.emptyState}>
                        <p>No contracts found.</p>
                      </div>
                    ) : (
                      filteredContracts.map(contract => (
                        <ContractCard
                          key={contract.id}
                          contract={contract}
                          onClick={() => handleContractClick(contract)}
                        />
                      ))
                    )}
                  </div>
                ) : (
                  selectedContract && (
                    <ContractDetail
                      contract={selectedContract}
                      onBack={handleBackToList}
                    />
                  )
                )}
              </>
            )}

            {activeTab === 'billing' && (
              <>
                <SearchHeader onSearch={handleSearch} />
                <BillingPayments
                  billingData={billingData}
                  onWithdraw={handleWithdraw}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContractsPage;
