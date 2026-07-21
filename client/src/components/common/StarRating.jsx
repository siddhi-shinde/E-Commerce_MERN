import { FaStar, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating = 0, size = 14, showValue = true, count }) => {
  const full = Math.round(rating);
  return (
    <span className="d-inline-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) =>
        i <= full ? (
          <FaStar key={i} size={size} className="mk-star" />
        ) : (
          <FaRegStar key={i} size={size} className="mk-star-empty" />
        )
      )}
      {showValue && (
        <span className="small text-muted ms-1">
          {rating > 0 ? rating.toFixed(1) : 'No ratings'}
          {typeof count === 'number' && ` (${count})`}
        </span>
      )}
    </span>
  );
};

export default StarRating;
