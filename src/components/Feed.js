// src/components/SocialPage/Feed.js
import React, { useState, useEffect, useCallback } from "react";
import styles from "./Feed.module.css"; // Ensure CSS Module exists
import Post from "./Post";              // Use adapted Post component
import Button from "./Button";  // Use shared Button component
import apiClient from "../api/axiosConfig"; // Adjust path
import { useAuth } from "../context/AuthContext"; // Adjust path
import logger from "../utils/logger";   // Optional logger

function Feed() {
  const { user } = useAuth(); // Get logged-in user info
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState([]); // Initialize with empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createPostLoading, setCreatePostLoading] = useState(false);
  const [createPostError, setCreatePostError] = useState('');

  // --- States for Phase 8 Sorting ---
  const [sortOrder, setSortOrder] = useState('recents');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

   // --- Fetching Logic (from PostFeedPage adaptation) ---
   const fetchPosts = useCallback(async (page = 1, sort = sortOrder, location = userLocation, append = false) => {
        if (!append) { // If not appending (first load or sort change)
            setPosts([]); setLoading(true); setHasMore(true); setCurrentPage(1);
        } else { setIsLoadingMore(true); } // Loading more state
        setError(''); setLocationError('');
        let params = { page, limit: 10, sort }; // Adjust limit

        if (sort === 'near_me') {
            if (!location) {
                setError('Location permission needed for "Near Me". Try enabling location.'); setLoading(false); setIsLoadingMore(false); setHasMore(false);
                return;
            }
            params.lat = location.lat; params.lng = location.lng;
        }
        try {
            logger.debug("Feed: Fetching posts with params:", params);
            const response = await apiClient.get('/posts', { params });
            const newPosts = response.data.data.posts;
            setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
            setHasMore(newPosts.length === params.limit);
            setCurrentPage(page);
        } catch (err) { setError(err.response?.data?.message || 'Failed to load feed.'); setHasMore(false); }
        finally { setLoading(false); setIsLoadingMore(false); }
   }, [sortOrder, userLocation]); // Dependencies for fetch logic

    // --- Geolocation Logic (from PostFeedPage adaptation) ---
    const getUserLocation = () => {
        setLocationError(''); setLoading(true); // Indicate loading while getting location
        if (!navigator.geolocation) { setLocationError('Geolocation not supported.'); setLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                 const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
                 setUserLocation(loc);
                 fetchPosts(1, 'near_me', loc, false); // Fetch immediately
                 // setLoading(false) handled in fetchPosts
            },
            (err) => {
                 setLocationError(`Geolocation error: ${err.message}`); setLoading(false); setHasMore(false);
                 // Maybe switch back to recents if location fails?
                 // setSortOrder('recents');
             },
            { timeout: 10000 }
        );
    };

    // --- Initial Fetch & Fetch on Sort Change ---
    useEffect(() => {
        if (sortOrder === 'near_me') {
             if (!userLocation) getUserLocation(); // Trigger location fetch if needed
             // else fetchPosts(1, 'near_me', userLocation, false); // Fetch if location known - CAREFUL: might cause loop, handled by getUserLocation calling fetch
        } else {
             fetchPosts(1, sortOrder, null, false); // Fetch for recents/trending
        }
   // Only refetch explicitly when sortOrder changes (or on mount for default)
   // Location fetches are triggered manually or within getUserLocation
   }, [sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps


   const handleSortChange = (newSort) => {
       if (newSort !== sortOrder) {
            setSortOrder(newSort); // This triggers the useEffect above
       }
   };

    // --- Create Post Logic ---
    const handlePostSubmit = async () => {
        if (!postText.trim()) {
             setCreatePostError("Post content cannot be empty.");
             return;
         }
        if (!user) {
             setCreatePostError("You must be logged in to post.");
             return;
         }

        setCreatePostLoading(true);
        setCreatePostError('');

        const payload = { content: postText.trim() }; // Add media/tags/location later if needed

        try {
            logger.info(`User ${user._id} creating post...`);
            const response = await apiClient.post('/posts', payload);
            const newPost = response.data.data.post;
            logger.info("Post created successfully:", newPost._id);

            // Add the new post to the top of the feed *if* sorting by 'recents'
            // Otherwise, just show a success message and let user refresh or fetch again
            if (sortOrder === 'recents') {
                setPosts((prevPosts) => [newPost, ...prevPosts]);
            } else {
                 alert("Post created successfully! Refresh or switch to 'Recents' to see it immediately.");
            }
            setPostText(""); // Clear input field

        } catch (err) {
            logger.error("Error creating post:", err.response?.data || err.message);
            setCreatePostError(err.response?.data?.message || 'Failed to create post.');
        } finally {
            setCreatePostLoading(false);
        }
    };

    const loadMorePosts = () => {
         if (!loading && !isLoadingMore && hasMore) {
             fetchPosts(currentPage + 1, sortOrder, userLocation, true); // Pass append=true
         }
     };

    // Callback to update a single post in the local 'posts' state
    const handleSinglePostUpdate = (updatedPostData) => {
        logger.debug("Feed: Updating single post in list:", updatedPostData);
        setPosts(currentPosts =>
            currentPosts.map(p =>
                p._id === updatedPostData._id ? updatedPostData : p
            )
        );
    };

    // --- Render ---
    return (
        <main className={styles.feedContainer}>
            {/* Header with Sorting Buttons For Future Implementation */}
            {/* <section className={styles.feedHeader}>
                <div className={styles.filterButtons}>
                    <Button onClick={() => handleSortChange('recents')} isActive={sortOrder === 'recents'} disabled={loading}> Recents </Button>
                    <Button onClick={() => handleSortChange('trending')} isActive={sortOrder === 'trending'} disabled={loading}> Trending </Button>
                    <Button onClick={() => handleSortChange('near_me')} isActive={sortOrder === 'near_me'} disabled={loading}> Near Me </Button>
                </div>
            </section> */}
            {locationError && <p className="error-message">{locationError}</p>}


            {/* Create Post Section */}
            <section className={styles.createPostCard}>
                <div className={styles.createPostHeader}>
                    <img
                        src={user?.profileImage || '/default.jpg'} // Use logged-in user's image
                        alt={user?.firstName || 'Your profile'}
                        width={48}
                        height={48}
                        className={styles.profileImage}
                        onError={(e) => { e.target.src = '/default.jpg'; }} // Fallback image
                    />
                    <input
                        type="text"
                        className={styles.createPostInput}
                        placeholder="What's happening?"
                        value={postText}
                        onChange={(e) => { setPostText(e.target.value); setCreatePostError(''); }} // Clear error on type
                        disabled={createPostLoading}
                    />
                </div>
                 {createPostError && <p className="error-message" style={{marginLeft: '52px'}}>{createPostError}</p>}
                <div className={styles.createPostActions}>
                    <div className={styles.postIcons}>
                        {/* Add functionality to these icons later */}
                        <div className={styles.postIcon}><img src="/assets/image.svg" alt="Add Image" width={20} height={20} /></div>
                        <div className={styles.postIcon}><img src="/assets/gif.svg" alt="Add Gif" width={20} height={20} /></div>
                        <div className={styles.postIcon}><img src="/assets/emoji.svg" alt="Add Emoji" width={20} height={20} /></div>
                    </div>
                    <Button className={styles.postButton} onClick={handlePostSubmit} disabled={createPostLoading || !postText.trim()}>
                        {createPostLoading ? 'Posting...' : 'Post'}
                    </Button>
                </div>
            </section>

            {/* Displaying Posts */}
            <section className={styles.postsContainer}>
                {loading && <p>Loading feed...</p>}
                {error && !loading && <p className="error-message">{error}</p>}
                {!loading && posts.length === 0 && <p>No posts found for this criteria.</p>}
                {posts.map((post) => (
                    <Post
                        key={post._id}
                        post={post}
                        onPostUpdate={handleSinglePostUpdate} // <<< Pass the callback
                    />
                ))}
                 {isLoadingMore && <p>Loading more posts...</p>}
                 {hasMore && !loading && !isLoadingMore && (
                     <Button onClick={loadMorePosts} style={{ width: '100%', marginTop: '10px' }}>Load More</Button>
                 )}
                 {!hasMore && posts.length > 0 && <p style={{ textAlign: 'center', marginTop: '20px', color: '#888' }}>End of feed.</p>}
            </section>
        </main>
    );
}

export default Feed;