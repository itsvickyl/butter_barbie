import { useState } from 'react'
import { Star } from 'lucide-react'
import './StarRating.css'

export default function StarRating({ rating = 0, onRate, readOnly = false, size = 20 }) {
    const [hoverRating, setHoverRating] = useState(0)

    // Determine the display rating (either hover state or persistent rating)
    const displayRating = hoverRating || rating

    return (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    className={`star-btn ${!readOnly ? 'interactive' : ''}`}
                    onClick={() => !readOnly && onRate && onRate(star)}
                    onMouseEnter={() => !readOnly && setHoverRating(star)}
                    onMouseLeave={() => !readOnly && setHoverRating(0)}
                    disabled={readOnly}
                    type="button"
                >
                    <Star
                        size={size}
                        fill={star <= displayRating ? 'var(--warning)' : 'none'}
                        stroke={star <= displayRating ? 'var(--warning)' : 'var(--text-muted)'}
                        className="star-icon"
                    />
                </button>
            ))}
            
        </div>
    )
}
