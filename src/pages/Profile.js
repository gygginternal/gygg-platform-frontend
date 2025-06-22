import React, { useState, useEffect } from 'react';
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
  TextArea,
  Select,
} from '../styles/components';
import apiClient from '../api/axiosConfig';
import DeleteAccountButton from '../components/DeleteAccountButton';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    skills: [],
    hourlyRate: 0,
    availability: 'full-time',
    location: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/users/me');
        setFormData(prev => ({ ...prev, ...response.data.data.user }));
      } catch (error) {
        showToast('Failed to load profile data', 'error');
      }
    };

    fetchProfile();
  }, [showToast]);

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
      await updateProfile(formData);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Flex direction="column" gap="lg" style={{ padding: '24px 0' }}>
        <Card>
          <Heading as="h1" style={{ marginBottom: '24px' }}>
            Profile Settings
          </Heading>

          <form onSubmit={handleSubmit}>
            <Grid columns={2} gap="lg">
              {/* Basic Information */}
              <Card>
                <Heading as="h2" style={{ marginBottom: '16px' }}>
                  Basic Information
                </Heading>
                <Flex direction="column" gap="md">
                  <div>
                    <Text
                      as="label"
                      color="text.secondary"
                      style={{ marginBottom: '4px' }}
                    >
                      Full Name
                    </Text>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Text
                      as="label"
                      color="text.secondary"
                      style={{ marginBottom: '4px' }}
                    >
                      Email
                    </Text>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Text
                      as="label"
                      color="text.secondary"
                      style={{ marginBottom: '4px' }}
                    >
                      Location
                    </Text>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                    />
                  </div>
                </Flex>
              </Card>

              {/* Professional Information */}
              <Card>
                <Heading as="h2" style={{ marginBottom: '16px' }}>
                  Professional Information
                </Heading>
                <Flex direction="column" gap="md">
                  <div>
                    <Text
                      as="label"
                      color="text.secondary"
                      style={{ marginBottom: '4px' }}
                    >
                      Bio
                    </Text>
                    <TextArea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Text
                      as="label"
                      color="text.secondary"
                      style={{ marginBottom: '4px' }}
                    >
                      Skills (comma-separated)
                    </Text>
                    <Input
                      name="skills"
                      value={formData.skills.join(', ')}
                      onChange={handleSkillsChange}
                      placeholder="e.g., Web Development, UI/UX Design"
                    />
                  </div>
                  <div>
                    <Text
                      as="label"
                      color="text.secondary"
                      style={{ marginBottom: '4px' }}
                    >
                      Hourly Rate ($)
                    </Text>
                    <Input
                      name="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                  <div>
                    <Text
                      as="label"
                      color="text.secondary"
                      style={{ marginBottom: '4px' }}
                    >
                      Availability
                    </Text>
                    <Select
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="freelance">Freelance</option>
                    </Select>
                  </div>
                </Flex>
              </Card>
            </Grid>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              style={{ marginTop: '24px' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
          <div
            style={{
              marginTop: '32px',
              borderTop: '1px solid #eee',
              paddingTop: '24px',
            }}
          >
            <DeleteAccountButton />
          </div>
        </Card>
      </Flex>
    </Container>
  );
};

export default Profile;
