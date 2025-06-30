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
  Input,
  Select,
} from '../styles/components';
import apiClient from '../api/axiosConfig';
import styles from './GigList.module.css';

const GigList = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const response = await apiClient.get('/gigs');
        setGigs(response.data.data.gigs);
      } catch (error) {
        showToast('Failed to load gigs', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, [showToast]);

  const filteredGigs = gigs
    .filter(gig => {
      const matchesSearch =
        gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gig.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || gig.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'budget-high':
          return b.budget - a.budget;
        case 'budget-low':
          return a.budget - b.budget;
        default:
          return 0;
      }
    });

  return (
    <Container>
      <Flex direction="column" gap="lg" className={styles.padding}>
        {/* Header */}
        <Card>
          <Flex justify="space-between" align="center">
            <div>
              <Heading as="h1" className={styles.marginBottom}>
                Available Gigs
              </Heading>
              <Text color="text.secondary">
                Find your next opportunity from our curated list of gigs
              </Text>
            </div>
            {user?.role === 'client' && (
              <Button as={Link} to="/create-gig" variant="primary">
                Post a Gig
              </Button>
            )}
          </Flex>
        </Card>

        {/* Filters */}
        <Card>
          <Grid columns={3} gap="md">
            <div>
              <Text
                as="label"
                color="text.secondary"
                className={styles.marginBottom}
              >
                Search
              </Text>
              <Input
                placeholder="Search gigs..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Text
                as="label"
                color="text.secondary"
                className={styles.marginBottom}
              >
                Category
              </Text>
              <Select
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="web-development">Web Development</option>
                <option value="mobile-development">Mobile Development</option>
                <option value="design">Design</option>
                <option value="writing">Writing</option>
                <option value="marketing">Marketing</option>
              </Select>
            </div>
            <div>
              <Text
                as="label"
                color="text.secondary"
                className={styles.marginBottom}
              >
                Sort By
              </Text>
              <Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="budget-high">Highest Budget</option>
                <option value="budget-low">Lowest Budget</option>
              </Select>
            </div>
          </Grid>
        </Card>

        {/* Gig List */}
        <Grid columns={2} gap="lg">
          {loading ? (
            <Text color="text.secondary">Loading gigs...</Text>
          ) : filteredGigs.length === 0 ? (
            <Text color="text.secondary">
              No gigs found matching your criteria
            </Text>
          ) : (
            filteredGigs.map(gig => (
              <Card key={gig.id}>
                <Flex direction="column" gap="md">
                  <div>
                    <Heading as="h3" className={styles.marginBottom}>
                      {gig.title}
                    </Heading>
                    <Text
                      color="text.secondary"
                      style={{ marginBottom: '16px' }}
                    >
                      {gig.description.length > 150
                        ? `${gig.description.substring(0, 150)}...`
                        : gig.description}
                    </Text>
                  </div>
                  <Flex justify="space-between" align="center">
                    <div>
                      <Text weight="medium">Budget: ${gig.budget}</Text>
                      <Text size="sm" color="text.secondary">
                        Posted by {gig.client.name}
                      </Text>
                    </div>
                    <Button as={Link} to={`/gigs/${gig.id}`}>
                      View Details
                    </Button>
                  </Flex>
                  <Flex gap="sm" style={{ flexWrap: 'wrap' }}>
                    {gig.skills.map(skill => (
                      <Text
                        key={skill}
                        size="sm"
                        style={{
                          backgroundColor: '#f0f0f0',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          marginRight: '4px',
                        }}
                      >
                        {skill}
                      </Text>
                    ))}
                  </Flex>
                </Flex>
              </Card>
            ))
          )}
        </Grid>
      </Flex>
    </Container>
  );
};

export default GigList;
