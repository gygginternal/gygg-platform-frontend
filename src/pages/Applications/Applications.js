import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../api/axiosConfig';
import styles from './Applications.module.css';
import {
  Container,
  Card,
  Button,
  Heading,
  Text,
  Flex,
  Grid,
  Select,
} from '../../styles/components';

const Applications = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [_applications, setApplications] = useState([]);
  const [_loading, setLoading] = useState(false);
  const [_error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await apiClient.get('/applications');
        setApplications(response.data);
      } catch (error) {
        showToast('Failed to load applications', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [showToast]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await apiClient.patch(`/applications/${applicationId}`, {
        status: newStatus,
      });
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      showToast(
        `Application ${newStatus === 'accepted' ? 'accepted' : 'rejected'} successfully`,
        'success'
      );
    } catch (error) {
      showToast('Failed to update application status', 'error');
    }
  };

  const filteredApplications = _applications.filter(
    app => statusFilter === 'all' || app.status === statusFilter
  );

  const isClient = user?.role === 'client';

  return (
    <Container>
      <Flex direction="column" gap="lg" className={styles.padding24}>
        {/* Header */}
        <Card>
          <Flex justify="space-between" align="center">
            <div>
              <Heading as="h1" className={styles.marginBottom8}>
                {isClient ? 'Received Applications' : 'My Applications'}
              </Heading>
              <Text color="text.secondary">
                {isClient
                  ? 'Review and manage applications for your gigs'
                  : 'Track the status of your applications'}
              </Text>
            </div>
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={styles.width200}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </Select>
          </Flex>
        </Card>

        {/* Applications List */}
        <Flex direction="column" gap="md">
          {_loading ? (
            <Text color="text.secondary">Loading applications...</Text>
          ) : filteredApplications.length === 0 ? (
            <Text color="text.secondary">No applications found</Text>
          ) : (
            filteredApplications.map(application => (
              <Card key={application.id}>
                <Grid columns={3} gap="lg">
                  {/* Application Info */}
                  <Flex
                    direction="column"
                    gap="sm"
                    className={styles.gridColumnSpan2}
                  >
                    <Link
                      to={`/gigs/${application.gig.id}`}
                      className={styles.textDecorationNone}
                    >
                      <Heading as="h3" className={styles.marginBottom8}>
                        {application.gig.title}
                      </Heading>
                    </Link>
                    <Text color="text.secondary">
                      {isClient
                        ? `From ${application.freelancer.name}`
                        : `Applied on ${new Date(application.createdAt).toLocaleDateString()}`}
                    </Text>
                    <Text className={styles.marginTop8}>
                      {application.proposal}
                    </Text>
                  </Flex>

                  {/* Actions */}
                  <Flex direction="column" gap="md" justify="center">
                    {isClient && application.status === 'pending' ? (
                      <Flex gap="sm">
                        <Button
                          variant="primary"
                          onClick={() =>
                            handleStatusChange(application.id, 'accepted')
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleStatusChange(application.id, 'rejected')
                          }
                        >
                          Reject
                        </Button>
                      </Flex>
                    ) : (
                      <Text
                        color={
                          application.status === 'accepted'
                            ? 'success'
                            : application.status === 'rejected'
                              ? 'error'
                              : 'text.secondary'
                        }
                      >
                        {application.status.charAt(0).toUpperCase() +
                          application.status.slice(1)}
                      </Text>
                    )}
                    {application.status === 'accepted' && (
                      <Button
                        variant="outline"
                        as={Link}
                        to={`/chat/${application.freelancer.id}`}
                      >
                        Message{' '}
                        {isClient ? application.freelancer.name : 'Client'}
                      </Button>
                    )}
                  </Flex>
                </Grid>
              </Card>
            ))
          )}
        </Flex>
      </Flex>
    </Container>
  );
};

export default Applications;
