 import React, { useState, useEffect } from 'react';
 import apiClient from '../api/axiosConfig';
 import TaskerCard from '../components/TaskerCard';

 function FindTaskersPage() {
     const [matchedTaskers, setMatchedTaskers] = useState([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');
     const [currentPage, setCurrentPage] = useState(1);
     const [hasMore, setHasMore] = useState(true);

     const fetchMatches = async (page = 1) => {
         const isFirstPage = page === 1;
         if(isFirstPage) { setMatchedTaskers([]); setHasMore(true); } // Reset on first load/refresh
         setLoading(true); setError('');
         try {
             const response = await apiClient.get(`/users/match-taskers?page=${page}&limit=10`);
             const newTaskers = response.data.data.taskers;
             setMatchedTaskers(prev => isFirstPage ? newTaskers : [...prev, ...newTaskers]);
             setHasMore(newTaskers.length === 10); // Assume more if limit was reached
             setCurrentPage(page);
         } catch (err) { setError(err.response?.data?.message || 'Failed to find matches.'); setHasMore(false); }
         finally { setLoading(false); }
     };
     useEffect(() => { fetchMatches(1); }, []); // Fetch on mount
     const loadMore = () => { if (!loading && hasMore) fetchMatches(currentPage + 1); };

     return (
        <div>
             <h2>Find Matching Taskers</h2>
             <p>Showing taskers based on similarities in your profile's hobbies and people preferences.</p>
              <button onClick={() => fetchMatches(1)} disabled={loading} style={{ marginBottom: '20px' }}>Refresh Matches</button>

             {error && <p className="error-message">{error}</p>}
              {matchedTaskers.length > 0 ? (
                 <ul style={{ padding: 0 }}>{matchedTaskers.map(t => <TaskerCard key={t._id} tasker={t} />)}</ul>
             ) : ( !loading && <p>No matching taskers found. Try updating your profile preferences.</p> )}

              {loading && <p>Loading...</p>}
              {hasMore && !loading && <button onClick={loadMore} style={{marginTop: '10px'}}>Load More Taskers</button>}
              {!hasMore && matchedTaskers.length > 0 && <p style={{textAlign: 'center', marginTop: '20px', color: '#888'}}>End of results.</p>}
         </div>
     );
 }
 export default FindTaskersPage;