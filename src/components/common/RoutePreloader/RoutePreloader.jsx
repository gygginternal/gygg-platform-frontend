import { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

// Route preloading strategies
const RoutePreloader = () => {
  const { authToken, user, sessionRole } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!authToken) return;

    // Preload critical routes based on user role and current location
    const preloadRoutes = async () => {
      const currentPath = location.pathname;

      // Always preload feed for authenticated users
      if (currentPath !== '/feed') {
        const SocialFeedLayoutPage = await import(
          '../../../pages/SocialFeedLayoutPage/SocialFeedLayoutPage'
        );
      }

      // Preload based on user roles
      if (sessionRole === 'provider') {
        // Preload provider-specific routes
        if (currentPath !== '/gigs') {
          const GigsPage = await import('../../../pages/GigsPage/GigsPage');
        }
        if (currentPath !== '/posted-gigs') {
          const PostedGigsPage = await import(
            '../../../pages/PostedGigsPage/PostedGigsPage'
          );
        }
        if (currentPath !== '/contracts') {
          const ContractsPage = await import(
            '../../../pages/ContractsPage/ContractsPage'
          );
        }
      }

      if (sessionRole === 'tasker') {
        // Preload tasker-specific routes
        if (currentPath !== '/gigs') {
          const GigsPage = await import('../../../pages/GigsPage/GigsPage');
        }
        if (currentPath !== '/gigs-applied') {
          const GigsAppliedPage = await import(
            '../../../pages/GigsAppliedPage/GigsAppliedPage'
          );
        }
        if (currentPath !== '/profile') {
          const TaskerProfilePage = await import(
            '../../../pages/TaskerProfilePage/TaskerProfilePage'
          );
        }
      }

      // Preload commonly accessed routes
      if (currentPath !== '/messages') {
        const ChatPage = await import('../../../pages/ChatPage/ChatPage');
      }
      if (currentPath !== '/settings') {
        const SettingsPage = await import(
          '../../../pages/SettingsPage/SettingsPage'
        );
      }
      if (currentPath !== '/billing') {
        const BillingAndPaymentPage = await import(
          '../../../pages/BillingAndPayment/BillingAndPayment'
        );
      }
    };

    // Delay preloading to avoid interfering with initial page load
    const timeoutId = setTimeout(preloadRoutes, 2000);

    return () => clearTimeout(timeoutId);
  }, [authToken, user, location.pathname]);

  // Preload routes on hover/focus for better UX
  useEffect(() => {
    const handleLinkHover = async event => {
      const link = event.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:'))
        return;

      // Preload route based on href
      try {
        switch (href) {
          case '/gigs':
            await import('../../../pages/GigsPage/GigsPage');
            break;
          case '/feed':
            await import(
              '../../../pages/SocialFeedLayoutPage/SocialFeedLayoutPage'
            );
            break;
          case '/messages':
            await import('../../../pages/ChatPage/ChatPage');
            break;
          case '/profile':
            await import('../../../pages/TaskerProfilePage/TaskerProfilePage');
            break;
          case '/settings':
            await import('../../../pages/SettingsPage/SettingsPage');
            break;
          case '/contracts':
            await import('../../../pages/ContractsPage/ContractsPage');
            break;
          case '/billing':
            await import('../../../pages/BillingAndPayment/BillingAndPayment');
            break;
          default:
            // Handle dynamic routes
            if (href.startsWith('/gigs/')) {
              await import('../../../pages/GigDetailPage/GigDetailPage');
            } else if (href.startsWith('/user-profile/')) {
              await import('../../../pages/UserProfilePage/UserProfilePage');
            }
            break;
        }
      } catch (error) {
        // Silently fail - preloading is an optimization, not critical
        console.debug('Route preload failed:', href, error);
      }
    };

    // Add hover listeners to all navigation links
    document.addEventListener('mouseover', handleLinkHover);
    document.addEventListener('focusin', handleLinkHover);

    return () => {
      document.removeEventListener('mouseover', handleLinkHover);
      document.removeEventListener('focusin', handleLinkHover);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default RoutePreloader;
