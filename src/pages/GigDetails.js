import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  TextArea,
} from '../styles/components';
import apiClient from '../api/axiosConfig';

const GigDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [proposal, setProposal] = useState('');

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await apiClient.get(`/gigs/${id}`);
        setGig(response.data);
      } catch (error) {
        showToast('Failed to load gig details', 'error');
        navigate('/gigs');
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [id, showToast, navigate]);

  const handleApply = async () => {
    if (!proposal.trim()) {
      showToast('Please provide a proposal', 'error');
      return;
    }

    setApplying(true);
    try {
      await apiClient.post(`/gigs/${id}/apply`, { proposal });
      showToast('Application submitted successfully', 'success');
      navigate('/applications');
    } catch (error) {
      showToast('Failed to submit application', 'error');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <Text color="text.secondary">Loading gig details...</Text>
        </Card>
      </Container>
    );
  }

  if (!gig) {
    return null;
  }

  const isClient = user?.role === 'client';
  const isFreelancer = user?.role === 'freelancer';
  const isOwner = isClient && user?.id === gig.client.id;

  return (
    <Container>
      <Flex direction="column" gap="lg" style={{ padding: '24px 0' }}>
        {/* Gig Header */}
        <Card>
          <Flex direction="column" gap="md">
            <Flex justify="space-between" align="center">
              <Heading as="h1">{gig.title}</Heading>
              {isOwner && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/gigs/${id}/edit`)}
                >
                  Edit Gig
                </Button>
              )}
            </Flex>
            <Flex gap="md" style={{ flexWrap: 'wrap' }}>
              <Text color="text.secondary">
                Posted by {gig.client.name} •{' '}
                {new Date(gig.createdAt).toLocaleDateString()}
              </Text>
              <Text color="text.secondary">
                {gig.applications}{' '}
                {gig.applications === 1 ? 'proposal' : 'proposals'}
              </Text>
            </Flex>
          </Flex>
        </Card>

        <Grid columns={3} gap="lg">
          {/* Main Content */}
          <Flex direction="column" gap="lg" style={{ gridColumn: 'span 2' }}>
            <Card>
              <Heading as="h2" style={{ marginBottom: '16px' }}>
                Description
              </Heading>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{gig.description}</Text>
            </Card>

            <Card>
              <Heading as="h2" style={{ marginBottom: '16px' }}>
                Required Skills
              </Heading>
              <Flex gap="sm" style={{ flexWrap: 'wrap' }}>
                {gig.skills.map(skill => (
                  <Text
                    key={skill}
                    style={{
                      backgroundColor: 'var(--color-neutral-100)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {skill}
                  </Text>
                ))}
              </Flex>
            </Card>

            {isFreelancer && gig.status === 'open' && (
              <Card>
                <Heading as="h2" style={{ marginBottom: '16px' }}>
                  Submit a Proposal
                </Heading>
                <Flex direction="column" gap="md">
                  <TextArea
                    value={proposal}
                    onChange={e => setProposal(e.target.value)}
                    placeholder="Describe why you're the best fit for this gig..."
                    rows={6}
                    required
                  />
                  <Button
                    onClick={handleApply}
                    disabled={applying || !proposal.trim()}
                  >
                    {applying ? 'Submitting...' : 'Submit Proposal'}
                  </Button>
                </Flex>
              </Card>
            )}
          </Flex>

          {/* Sidebar */}
          <Flex direction="column" gap="lg">
            <Card>
              <Flex direction="column" gap="md">
                <div>
                  <Text color="text.secondary" style={{ marginBottom: '4px' }}>
                    Budget
                  </Text>
                  <Heading as="h3">${gig.budget}</Heading>
                </div>
                <div>
                  <Text color="text.secondary" style={{ marginBottom: '4px' }}>
                    Category
                  </Text>
                  <Text>{gig.category}</Text>
                </div>
                <div>
                  <Text color="text.secondary" style={{ marginBottom: '4px' }}>
                    Duration
                  </Text>
                  <Text>{gig.duration}</Text>
                </div>
                <div>
                  <Text color="text.secondary" style={{ marginBottom: '4px' }}>
                    Experience Level
                  </Text>
                  <Text>{gig.experience}</Text>
                </div>
                <div>
                  <Text color="text.secondary" style={{ marginBottom: '4px' }}>
                    Status
                  </Text>
                  <Text
                    style={{
                      color:
                        gig.status === 'open'
                          ? 'var(--color-success-500)'
                          : gig.status === 'in-progress'
                            ? 'var(--color-warning-500)'
                            : 'var(--color-neutral-500)',
                    }}
                  >
                    {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                  </Text>
                </div>
              </Flex>
            </Card>

            <Card>
              <Heading as="h3" style={{ marginBottom: '16px' }}>
                About the Client
              </Heading>
              <Flex direction="column" gap="md">
                <div>
                  <Text weight="medium">{gig.client.name}</Text>
                  <Text size="sm" color="text.secondary">
                    {gig.client.completedGigs} completed gigs
                  </Text>
                </div>
                <div>
                  <Text size="sm" color="text.secondary">
                    Rating: {gig.client.rating}/5
                  </Text>
                </div>
              </Flex>
            </Card>
          </Flex>
        </Grid>
      </Flex>
    </Container>
  );
};

export default GigDetails;
