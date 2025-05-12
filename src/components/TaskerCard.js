import React from 'react';
// import { Link } from 'react-router-dom'; // Optional link

function TaskerCard({ tasker }) {
     if(!tasker) return null;
    return (
        <li className="list-item-card"> {/* Add class */}
            <div className="flex-container">
                <img src={tasker.profileImage || '/default.jpg'} alt={`${tasker.fullName}'s profile`} className="avatar-medium" />
                <div>
                    <h4>{tasker.fullName} ({tasker.rating?.toFixed(1)}⭐ <small>({tasker.ratingCount || 0})</small>)</h4>
                    <p><i>"{tasker.peoplePreference || 'No preference specified'}"</i></p>
                </div>
                 <small className="text-muted margin-left-auto">(Match Score: {tasker.score?.toFixed(2)})</small>
            </div>
            {tasker.bio && <p style={{marginTop: '10px'}}>Bio: {tasker.bio.substring(0, 100)}...</p>}
            {tasker.hobbies?.length > 0 && <p><small className="text-muted">Hobbies: {tasker.hobbies.join(', ')}</small></p>}
            {/* Optional: Link to a full tasker profile page */}
            {/* <Link to={`/users/${tasker._id}`}>View Profile</Link> */}
        </li>
    );
}
export default TaskerCard;