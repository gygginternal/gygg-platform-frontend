import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Flex, Button, Text, Card } from '../styles/components';
import styles from './Navigation.module.css';

const GlobalOverrides = createGlobalStyle`
  .isKfud {
    background: #fff !important;
    border-bottom: none !important;
    box-shadow: none !important;
  }
  .idfBys {
    box-shadow: none !important;
    border-radius: 0 !important;
  }
`;

const NavContainer = styled(Card)`
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 16px 24px;
  background-color: #fff !important;
  border-bottom: none !important;
`;

const DesktopNav = styled(Flex)`
  display: none;
  @media (min-width: 768px) {
    display: flex;
  }
`;

const MobileNav = styled(Card)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  display: block;
  @media (min-width: 768px) {
    display: none;
  }
`;

const PostGigButton = styled(Button)`
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
`;

const MobileMenuButton = styled(Button)`
  display: block;
  @media (min-width: 768px) {
    display: none;
  }
`;

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = path => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/gigs', label: 'Gigs' },
    { path: '/applications', label: 'Applications' },
    { path: '/messages', label: 'Messages' },
  ];

  if (!user) {
    return null;
  }

  return (
    <>
      <GlobalOverrides />
      <NavContainer>
        <Flex justify="space-between" align="center">
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Text weight="bold" size="lg">
              Gygg
            </Text>
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav gap="lg">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  textDecoration: 'none',
                  color: isActive(item.path)
                    ? 'var(--color-primary-500)'
                    : 'var(--color-text-primary)',
                }}
              >
                <Text
                  weight={isActive(item.path) ? 'medium' : 'regular'}
                  style={{
                    borderBottom: isActive(item.path)
                      ? '2px solid var(--color-primary-500)'
                      : 'none',
                    padding: '4px 0',
                  }}
                >
                  {item.label}
                </Text>
              </Link>
            ))}
          </DesktopNav>

          {/* User Menu */}
          <Flex align="center" gap="md">
            {user.role === 'client' && (
              <PostGigButton as={Link} to="/create-gig" variant="primary">
                Post a Gig
              </PostGigButton>
            )}
            <div style={{ position: 'relative' }}>
              <Button
                variant="outline"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{ minWidth: '120px' }}
              >
                {user.name}
              </Button>
              {isMenuOpen && (
                <Card
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    minWidth: '200px',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <Flex direction="column" gap="sm">
                    <Button
                      as={Link}
                      to="/profile"
                      variant="text"
                      style={{ justifyContent: 'flex-start' }}
                    >
                      Profile
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      style={{
                        justifyContent: 'flex-start',
                        color: 'var(--color-error-500)',
                      }}
                    >
                      Logout
                    </Button>
                  </Flex>
                </Card>
              )}
            </div>
          </Flex>

          {/* Mobile Menu Button */}
          <MobileMenuButton
            variant="text"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Text size="xl">☰</Text>
          </MobileMenuButton>
        </Flex>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <MobileNav>
            <Flex direction="column" gap="sm">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    textDecoration: 'none',
                    color: isActive(item.path)
                      ? 'var(--color-primary-500)'
                      : 'var(--color-text-primary)',
                    padding: '8px 16px',
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Text weight={isActive(item.path) ? 'medium' : 'regular'}>
                    {item.label}
                  </Text>
                </Link>
              ))}
              {user.role === 'client' && (
                <Button
                  as={Link}
                  to="/create-gig"
                  variant="primary"
                  style={{ margin: '8px 16px' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Post a Gig
                </Button>
              )}
            </Flex>
          </MobileNav>
        )}
      </NavContainer>
    </>
  );
};

export default Navigation;
