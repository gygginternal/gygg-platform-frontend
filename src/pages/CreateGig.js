import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  Container,
  Card,
  Button,
  Heading,
  Text,
  Flex,
  Input,
  TextArea,
  Select,
  Grid,
} from '../styles/components';
import apiClient from '../api/axiosConfig';

const CreateGig = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: 0,
    category: '',
    skills: [],
    duration: '',
    experience: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = e => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setFormData(prev => ({ ...prev, skills }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post('/gigs', formData);
      showToast('Gig created successfully', 'success');
      navigate(`/gigs/${response.data.id}`);
    } catch (error) {
      showToast('Failed to create gig', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'client') {
    return (
      <Container>
        <Card>
          <Flex
            direction="column"
            align="center"
            gap="md"
            style={{ padding: '48px 0' }}
          >
            <Heading as="h1">Access Denied</Heading>
            <Text color="text.secondary">
              Only clients can create gigs. Please switch to a client account to
              continue.
            </Text>
            <Button as="a" href="/profile">
              Go to Profile
            </Button>
          </Flex>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Flex direction="column" gap="lg" style={{ padding: '24px 0' }}>
        <Card>
          <Heading as="h1" style={{ marginBottom: '24px' }}>
            Create a New Gig
          </Heading>

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="lg">
              {/* Basic Information */}
              <div>
                <Text
                  as="label"
                  color="text.secondary"
                  style={{ marginBottom: '4px' }}
                >
                  Title
                </Text>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a clear, descriptive title"
                  required
                />
              </div>

              <div>
                <Text
                  as="label"
                  color="text.secondary"
                  style={{ marginBottom: '4px' }}
                >
                  Description
                </Text>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the gig in detail..."
                  rows={6}
                  required
                />
              </div>

              <Grid columns={2} gap="lg">
                <div>
                  <Text
                    as="label"
                    color="text.secondary"
                    style={{ marginBottom: '4px' }}
                  >
                    Budget ($)
                  </Text>
                  <Input
                    name="budget"
                    type="number"
                    value={formData.budget}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                <div>
                  <Text
                    as="label"
                    color="text.secondary"
                    style={{ marginBottom: '4px' }}
                  >
                    Category
                  </Text>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="web-development">Web Development</option>
                    <option value="mobile-development">
                      Mobile Development
                    </option>
                    <option value="design">Design</option>
                    <option value="writing">Writing</option>
                    <option value="marketing">Marketing</option>
                  </Select>
                </div>

                <div>
                  <Text
                    as="label"
                    color="text.secondary"
                    style={{ marginBottom: '4px' }}
                  >
                    Duration
                  </Text>
                  <Select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select duration</option>
                    <option value="less-than-1-week">Less than 1 week</option>
                    <option value="1-2-weeks">1-2 weeks</option>
                    <option value="2-4-weeks">2-4 weeks</option>
                    <option value="1-3-months">1-3 months</option>
                    <option value="3-6-months">3-6 months</option>
                    <option value="more-than-6-months">
                      More than 6 months
                    </option>
                  </Select>
                </div>

                <div>
                  <Text
                    as="label"
                    color="text.secondary"
                    style={{ marginBottom: '4px' }}
                  >
                    Experience Level
                  </Text>
                  <Select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select experience level</option>
                    <option value="entry">Entry Level</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </Select>
                </div>
              </Grid>

              <div>
                <Text
                  as="label"
                  color="text.secondary"
                  style={{ marginBottom: '4px' }}
                >
                  Required Skills (comma-separated)
                </Text>
                <Input
                  name="skills"
                  value={formData.skills.join(', ')}
                  onChange={handleSkillsChange}
                  placeholder="e.g., React, Node.js, UI/UX Design"
                />
              </div>

              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Gig'}
              </Button>
            </Flex>
          </form>
        </Card>
      </Flex>
    </Container>
  );
};

export default CreateGig;
