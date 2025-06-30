import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  Container,
  Card,
  Button,
  Heading,
  Text,
  Flex,
  Grid,
} from '../styles/components';
import apiClient from '../api/axiosConfig';
import styles from './Dashboard.module.css';

const Dashboard = () => {
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
    <Container>
      <Flex direction="column" gap="lg" className={styles.padding}>
        {/* Welcome Section */}
        <Card>
          <Flex justify="space-between" align="center">
            <div>
              <Heading as="h1" className={styles.marginBottom}>
                Welcome back, {user?.name}!
              </Heading>
              <Text color="text.secondary">
                {isFreelancer
                  ? 'Find your next opportunity or manage your active gigs'
                  : 'Post new gigs or manage your hiring needs'}
              </Text>
            </div>
            <Button
              variant={isFreelancer ? 'primary' : 'secondary'}
              as={Link}
              to={isFreelancer ? '/gigs' : '/create-gig'}
            >
              {isFreelancer ? 'Browse Gigs' : 'Post a Gig'}
            </Button>
          </Flex>
        </Card>

        {/* Stats Section */}
        <Grid columns={3} gap="md">
          <Card>
            <Text color="text.secondary" className={styles.marginBottom}>
              {isFreelancer ? 'Total Gigs' : 'Posted Gigs'}
            </Text>
            <Heading as="h2" className={styles.marginBottom}>
              {loading ? '...' : stats.totalGigs}
            </Heading>
            <Text size="sm" color="text.secondary">
              {isFreelancer
                ? 'Gigs you have worked on'
                : 'Gigs you have posted'}
            </Text>
          </Card>

          <Card>
            <Text color="text.secondary" className={styles.marginBottom}>
              Active Gigs
            </Text>
            <Heading as="h2" className={styles.marginBottom}>
              {loading ? '...' : stats.activeGigs}
            </Heading>
            <Text size="sm" color="text.secondary">
              Currently ongoing projects
            </Text>
          </Card>

          <Card>
            <Text color="text.secondary" className={styles.marginBottom}>
              {isFreelancer ? 'Total Earnings' : 'Total Spent'}
            </Text>
            <Heading as="h2" className={styles.marginBottom}>
              {loading
                ? '...'
                : `$${isFreelancer ? stats.totalEarnings : stats.totalSpent}`}
            </Heading>
            <Text size="sm" color="text.secondary">
              {isFreelancer
                ? 'Your total earnings to date'
                : 'Total amount spent on gigs'}
            </Text>
          </Card>
        </Grid>

        {/* Recent Activity Section */}
        <Card>
          <Heading as="h2" className={styles.marginBottom}>
            Recent Activity
          </Heading>
          <Flex direction="column" gap="md">
            {/* Placeholder for recent activity items */}
            <Text
              color="text.secondary"
              className={styles.textAlignCenter}
              style={{ padding: '32px' }}
            >
              No recent activity to show
            </Text>
          </Flex>
        </Card>

        {/* Quick Actions Section */}
        <Card>
          <Heading as="h2" className={styles.marginBottom}>
            Quick Actions
          </Heading>
          <Grid columns={2} gap="md">
            <Button
              variant="outline"
              as={Link}
              to="/profile"
              className={styles.height}
            >
              <Flex direction="column" align="center" gap="sm">
                <Text weight="medium">Update Profile</Text>
                <Text size="sm" color="text.secondary">
                  Manage your account settings
                </Text>
              </Flex>
            </Button>
            <Button
              variant="outline"
              as={Link}
              to="/chat"
              className={styles.height}
            >
              <Flex direction="column" align="center" gap="sm">
                <Text weight="medium">Messages</Text>
                <Text size="sm" color="text.secondary">
                  View your conversations
                </Text>
              </Flex>
            </Button>
            <Button
              variant="outline"
              as={Link}
              to="/notifications"
              className={styles.height}
            >
              <Flex direction="column" align="center" gap="sm">
                <Text weight="medium">Notifications</Text>
                <Text size="sm" color="text.secondary">
                  View your notifications
                </Text>
              </Flex>
            </Button>
            <Button
              variant="outline"
              as={Link}
              to="/contracts"
              className={styles.height}
            >
              <Flex direction="column" align="center" gap="sm">
                <Text weight="medium">My Contracts</Text>
                <Text size="sm" color="text.secondary">
                  View your contracts
                </Text>
              </Flex>
            </Button>
          </Grid>
        </Card>
      </Flex>
    </Container>
  );
};

export default Dashboard;
