import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import MatchedGigCard from '../components/MatchedGigCard'; // Assuming you have this component

function MatchedGigsPage() {
    const [matchedGigs, setMatchedGigs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Function to fetch matched gigs from the backend
    const fetchMatchedGigs = async (page = 1) => {
        const isFirstPage = page === 1;
        if (isFirstPage) {
            setMatchedGigs([]); // Clear previous results on first load/refresh
            setHasMore(true);   // Assume more pages initially
        }
        setLoading(true);
        setError('');

        try {
            // Call the backend endpoint for tasker gig matching
            const response = await apiClient.get(`/gigs/match?page=${page}&limit=10`); // Use pagination params
            const newGigs = response.data.data.gigs;

            console.log(`Fetched ${newGigs.length} matched gigs for page ${page}`);

            setMatchedGigs(prev => isFirstPage ? newGigs : [...prev, ...newGigs]); // Append results for load more
            setHasMore(newGigs.length === 10); // Check if there might be more pages
            setCurrentPage(page);

        } catch (err) {
            console.error("Error fetching matched gigs:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to find matched gigs. Ensure your profile hobbies/preferences are set.');
            setHasMore(false); // Stop pagination on error
        } finally {
            setLoading(false);
        }
    };

    // Fetch initial matches when the component mounts
    useEffect(() => {
        fetchMatchedGigs(1);
    }, []); // Empty dependency array means run once on mount

    // Handler for the "Load More" button
    const loadMore = () => {
        if (!loading && hasMore) {
            fetchMatchedGigs(currentPage + 1);
        }
    };

    return (
       <div>
            <h2>Gigs Matching Your Profile</h2>
            <p>Showing open gigs posted by providers with similar hobbies or people preferences to yours.</p>
            <button onClick={() => fetchMatchedGigs(1)} disabled={loading} style={{ marginBottom: '20px' }}>
                {loading && currentPage === 1 ? 'Loading...' : 'Refresh Matches'}
            </button>

            {error && <p className="error-message">{error}</p>}

            {/* Display the list of matched gigs */}
             {matchedGigs.length > 0 ? (
                <ul style={{ padding: 0 }}>
                    {/* Use the MatchedGigCard component to render each gig */}
                    {matchedGigs.map(gig => <MatchedGigCard key={gig._id} gig={gig} />)}
                </ul>
            ) : (
                 !loading && <p>No matching open gigs found based on your profile preferences.</p>
            )}

             {/* Loading indicator */}
             {loading && currentPage > 1 && <p>Loading more gigs...</p>}

             {/* Load More Button */}
             {hasMore && !loading && (
                 <button onClick={loadMore} style={{ marginTop: '20px', width: '100%' }}>Load More Gigs</button>
             )}
             {!hasMore && matchedGigs.length > 0 && <p style={{ textAlign: 'center', marginTop: '20px', color: '#888' }}>You've reached the end!</p>}
        </div>
     );
}

export default MatchedGigsPage;