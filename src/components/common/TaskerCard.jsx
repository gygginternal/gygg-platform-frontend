import styles from './TaskerCard.module.css';
import PropTypes from 'prop-types';
import { decodeHTMLEntities } from '../utils/htmlEntityDecoder';

function TaskerCard({ tasker }) {
  if (!tasker) return null;
  return (
    <li className={styles.listItemCard}>
      <div className={styles.flexContainer}>
        <img
          src={tasker.profileImage || '/default.jpg'}
          alt={`${decodeHTMLEntities(tasker.fullName)}'s profile`}
          className={styles.avatarMedium}
        />
        <div>
          <h4 className={styles.title}>
            {decodeHTMLEntities(tasker.fullName)} ({tasker.rating?.toFixed(1)}⭐{' '}
            <span className={styles.smallText}>
              ({tasker.ratingCount || 0})
            </span>
            )
          </h4>
          <p className={styles.paragraph}>
            <i>
              &ldquo;{decodeHTMLEntities(tasker.peoplePreference) || 'No preference specified'}
              &rdquo;
            </i>
          </p>
        </div>
        <span className={`${styles.textMuted} ${styles.marginLeftAuto}`}>
          (Match Score: {tasker.score?.toFixed(2)})
        </span>
      </div>
      {tasker.bio && (
        <p className={`${styles.paragraph} ${styles.bio}`}>
          <span className={styles.smallText}>
            Bio: {decodeHTMLEntities(tasker.bio).substring(0, 100)}...
          </span>
        </p>
      )}
      {tasker.hobbies?.length > 0 && (
        <p className={styles.paragraph}>
          <span className={styles.textMuted}>
            Hobbies: {tasker.hobbies.map(hobby => decodeHTMLEntities(hobby)).join(', ')}
          </span>
        </p>
      )}
    </li>
  );
}

TaskerCard.propTypes = {
  tasker: PropTypes.shape({
    _id: PropTypes.string,
    fullName: PropTypes.string,
    rating: PropTypes.number,
    ratingCount: PropTypes.number,
    peoplePreference: PropTypes.string,
    score: PropTypes.number,
    profileImage: PropTypes.string,
    bio: PropTypes.string,
    hobbies: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default TaskerCard;
