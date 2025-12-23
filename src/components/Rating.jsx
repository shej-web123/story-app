import { useState } from 'react';
import { Star } from 'lucide-react';

const Rating = ({ initialRating = 0, onRate, readonly = false }) => {
    const [rating, setRating] = useState(initialRating);
    const [hover, setHover] = useState(0);

    const handleClick = (value) => {
        if (!readonly) {
            setRating(value);
            if (onRate) onRate(value);
        }
    };

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-transform ${!readonly && 'hover:scale-110'}`}
                    onClick={() => handleClick(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                >
                    <Star
                        size={20}
                        className={`${star <= (hover || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            } transition-colors`}
                    />
                </button>
            ))}
        </div>
    );
};

export default Rating;
