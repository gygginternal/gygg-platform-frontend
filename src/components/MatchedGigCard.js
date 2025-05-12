import React from 'react';
import { Link } from 'react-router-dom';

function MatchedGigCard({ gig }) {
    if (!gig) return null;
    const provider = gig.providerInfo;
    return (
        <li className="list-item-card"> {/* Add class */}
            <h4><Link to={`/gigs/${gig._id}`}>{gig.title}</Link></h4>
            <p>Category: {gig.category}</p>
            <p>Cost: ${gig.cost}</p>
            <p>Status: {gig.status}</p>
            {provider && (
                <div style={{ marginTop: '10px', borderTop: '1px dashed #eee', paddingTop: '10px' }}>
                    <div className="flex-container"> {/* Use flexbox */}
                        <img src={provider.profileImage || '/default.jpg'} alt={`${provider.fullName}'s profile`} className="avatar-small" />
                        <div>
                             <strong>Provider:</strong> {provider.fullName} ({provider.rating?.toFixed(1)}⭐) <br />
                            <small className="text-muted">Pref: "{provider.peoplePreference || 'N/A'}" | Hobbies: {provider.hobbies?.join(', ') || 'N/A'}</small>
                        </div>
                    </div>
                </div>
            )}
             <small className="text-muted">(Match Score: {gig.matchScore?.toFixed(2)})</small>
        </li>
    );
}
export default MatchedGigCard;