import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import * as Styled from '../../styles/components';
import apiClient from '../../api/axiosConfig';
import styles from './Dashboard.module.css';

function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalGigs: 0,
    activeGigs: 0,
    completedGigs: 0,
    totalEarnings: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        showToast('Failed to load dashboard stats', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showToast]);

  const isFreelancer = user?.role === 'freelancer';

  return (
    <Styled.Container>
      <div className={`${styles.flexColumnGapLg} ${styles.padding}`}>
        {/* Welcome Section */}
        <Styled.Card>
          <div className={styles.justifyBetween}>
            <div>
              <Styled.Heading as="h1" className={styles.marginBottom}>
                Welcome back, {user?.name}!
              </Styled.Heading>
              <Styled.Text className={styles.marginBottom}>
                {isFreelancer
                  ? 'Find your next opportunity or manage your active gigs'
                  : 'Post new gigs or manage your hiring needs'}
              </Styled.Text>
            </div>
            <Styled.Button
              variant={isFreelancer ? 'primary' : 'secondary'}
              as={Link}
              to={isFreelancer ? '/gigs' : '/create-gig'}
            >
              {isFreelancer ? 'Browse Gigs' : 'Post a Gig'}
            </Styled.Button>
          </div>
        </Styled.Card>

        {/* Stats Section */}
        <div className={styles.grid3}>
          <Styled.Card>
            <Styled.Text className={styles.marginBottom}>
              {isFreelancer ? 'Total Gigs' : 'Posted Gigs'}
            </Styled.Text>
            <Styled.Heading as="h2" className={styles.marginBottom}>
              {loading ? '...' : stats.totalGigs}
            </Styled.Heading>
            <Styled.Text size="sm">
              {isFreelancer
                ? `Gigs you have worked on`
                : `Gigs you have posted`}
            </Styled.Text>
          </Styled.Card>

          <Styled.Card>
            <Styled.Text className={styles.marginBottom}>
              Active Gigs
            </Styled.Text>
            <Styled.Heading as="h2" className={styles.marginBottom}>
              {loading ? '...' : stats.activeGigs}
            </Styled.Heading>
            <Styled.Text size="sm" color="text.secondary">
              Currently ongoing projects
            </Styled.Text>
          </Styled.Card>

          <Styled.Card>
            <Styled.Text className={styles.marginBottom}>
              {isFreelancer ? 'Total Earnings' : 'Total Spent'}
            </Styled.Text>
            <Styled.Heading as="h2" className={styles.marginBottom}>
              {loading
                ? '...'
                : `$${isFreelancer ? stats.totalEarnings : stats.totalSpent}`}
            </Styled.Heading>
            <Styled.Text size="sm">
              {isFreelancer
                ? 'Your total earnings to date'
                : 'Total amount spent on gigs'}
            </Styled.Text>
          </Styled.Card>
        </div>

        {/* Recent Activity Section */}
        <Styled.Card>
          <Styled.Heading as="h2" className={styles.marginBottom}>
            Recent Activity
          </Styled.Heading>
          <div className={styles.flexColumnGapLg}>
            <Styled.Text className={`${styles.textAlignCenter} ${styles.p32}`}>
              No recent activity to show
            </Styled.Text>
          </div>
        </Styled.Card>

        {/* Quick Actions Section */}
        <Styled.Card>
          <Styled.Heading as="h2" className={styles.marginBottom}>
            Quick Actions
          </Styled.Heading>
          <div className={styles.grid2}>
            <Styled.Button
              variant="outline"
              as={Link}
              to="/profile"
              className={styles.height}
            >
              <Styled.Flex direction="column" align="center" gap="sm">
                <Styled.Text weight="medium">Update Profile</Styled.Text>
                <Styled.Text size="sm" color="text.secondary">
                  Manage your account settings
                </Styled.Text>
              </Styled.Flex>
            </Styled.Button>

            <Styled.Button
              variant="outline"
              as={Link}
              to="/chat"
              className={styles.height}
            >
              <Styled.Flex direction="column" align="center" gap="sm">
                <Styled.Text weight="medium">Messages</Styled.Text>
                <Styled.Text size="sm" color="text.secondary">
                  View your conversations
                </Styled.Text>
              </Styled.Flex>
            </Styled.Button>

            <Styled.Button
              variant="outline"
              as={Link}
              to="/notifications"
              className={styles.height}
            >
              <Styled.Flex direction="column" align="center" gap="sm">
                <Styled.Text weight="medium">Notifications</Styled.Text>
                <Styled.Text size="sm" color="text.secondary">
                  View your notifications
                </Styled.Text>
              </Styled.Flex>
            </Styled.Button>

            <Styled.Button
              variant="outline"
              as={Link}
              to="/contracts"
              className={styles.height}
            >
              <Styled.Flex direction="column" align="center" gap="sm">
                <Styled.Text weight="medium">My Contracts</Styled.Text>
                <Styled.Text size="sm" color="text.secondary">
                  View your contracts
                </Styled.Text>
              </Styled.Flex>
            </Styled.Button>
          </div>
        </Styled.Card>
      </div>
    </Styled.Container>
  );
}

export default Dashboard;
