import React from 'react';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number | null;
  className?: string;
}

export function PriceDisplay({ price, originalPrice, className = '' }: PriceDisplayProps) {
  const hasDiscount = originalPrice !== undefined && originalPrice !== null && originalPrice > price;
  
  return (
    <div className={`flex items-center ${className}`}>
      <span className="font-bold text-lg">${price.toFixed(2)}</span>
      {hasDiscount && (
        <span className="text-xs text-muted-foreground line-through ml-2">
          ${originalPrice?.toFixed(2)}
        </span>
      )}
    </div>
  );
}
