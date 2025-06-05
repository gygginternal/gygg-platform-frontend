import React from "react";
import styles from "./ReviewsSection.module.css";
import ReviewCard from "./ProfilePage/ReviewCard";

const reviewsData = [
  {
    name: "Alice Johnson",
    job: "Software Engineer",
    rating: 4.8,
    stars: 5,
    date: "March 10, 2025",
    review: "Amazing service! The experience was seamless and exceeded my expectations.",
  },
  {
    name: "Mark Spencer",
    job: "Product Manager",
    rating: 4.5,
    stars: 4,
    date: "March 12, 2025",
    review: "Great experience overall. Would definitely recommend it to others.",
  },
  {
    name: "Sophia Lee",
    job: "UX Designer",
    rating: 4.2,
    stars: 4,
    date: "March 14, 2025",
    review: "Good service but there is room for improvement in user experience.",
  },
  {
    name: "David Kim",
    job: "Marketing Specialist",
    rating: 5.0,
    stars: 5,
    date: "March 15, 2025",
    review: "Absolutely loved it! Everything was top-notch and well-organized.",
  },
];

const ReviewsSection = () => {
  return (
    <section className={styles.reviewsCard}>
      <div className={styles.reviewsHeader}>
        <h2>Reviews</h2>
      </div>

      <div className={styles.reviewsGrid}>
        {reviewsData.map((review, index) => (
          <ReviewCard key={index} {...review} />
        ))}
      </div>
    </section>
  );
};

export default ReviewsSection;
