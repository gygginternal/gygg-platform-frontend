import React from 'react';
import PostsSection from '../ProfilePage/PostsSection';

function RecentProviderPostSection({ providerId, isOwnProfile }) {
  // Use the ProfilePage PostsSection component for recent posts
  return <PostsSection userIdToView={providerId} isOwnProfile={isOwnProfile} />;
}

export default RecentProviderPostSection;
