import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

export function StarRating({ rating, showValue = true, reviewCount, className = "" }: StarRatingProps) {
  // Calculate full stars and half stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="fill-current" size={16} />
        ))}
        
        {hasHalfStar && <StarHalf className="fill-current" size={16} />}
        
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={16} />
        ))}
      </div>
      
      {showValue && <span className="text-xs text-muted-foreground ml-1">({rating})</span>}
      {reviewCount !== undefined && (
        <span className="text-xs text-muted-foreground ml-1">({reviewCount} reviews)</span>
      )}
    </div>
  );
}
