// Define types for our AI analytics
export interface BookData {
  id: number;
  price: number;
  stockQuantity: number;
  rating: number;
  salesHistory: number[];
  marketAverage?: number;
  competitorPrices?: number[];
}

export interface PriceSuggestion {
  bookId: number;
  currentPrice: number;
  suggestedPrice: number;
  percentChange: number;
  demandTrend: "rising" | "stable" | "falling";
  marketAverage?: number;
  competitivePosition?: "premium" | "average" | "discount";
  elasticityFactor?: number;
}

// Function to predict optimal pricing using a rule-based approach
export function predictOptimalPrice(bookData: BookData): PriceSuggestion {
  // Calculate trend based on sales history
  let trend: "rising" | "stable" | "falling" = "stable";
  
  // Ensure we have sales history data
  const salesHistory = bookData.salesHistory.length > 0 ? 
    bookData.salesHistory : [0, 0, 0];
  
  // Calculate trend based on recent sales patterns
  if (salesHistory.length >= 3) {
    const recent = salesHistory.slice(-3);
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const changePercent = firstAvg > 0 ? 
      ((secondAvg - firstAvg) / firstAvg) * 100 : 
      secondAvg > 0 ? 100 : 0;
    
    if (changePercent > 10) trend = "rising";
    else if (changePercent < -10) trend = "falling";
  }

  // Determine price elasticity factor based on demand trend
  // Rising demand = less elastic (can increase price more)
  // Falling demand = more elastic (need to be price competitive)
  const elasticityFactor = trend === "rising" ? 1.15 : 
                          trend === "falling" ? 0.85 : 1.0;

  // Determine competitive position
  let competitivePosition: "premium" | "average" | "discount" = "average";
  
  if (bookData.marketAverage) {
    const priceRatio = bookData.price / bookData.marketAverage;
    if (priceRatio > 1.1) competitivePosition = "premium";
    else if (priceRatio < 0.9) competitivePosition = "discount";
  }

  // Calculate suggested price based on multiple factors
  let priceMultiplier = 1.0;
  
  // 1. Adjust based on stock level (lower stock = higher price)
  const stockFactor = 1 - (Math.min(bookData.stockQuantity, 100) / 100) * 0.2;
  priceMultiplier *= (1 + (stockFactor - 0.5) * 0.1);
  
  // 2. Adjust based on rating (higher rating = higher price)
  const ratingFactor = (bookData.rating / 5);
  priceMultiplier *= (1 + (ratingFactor - 0.5) * 0.15);
  
  // 3. Adjust based on demand trend
  if (trend === "rising") priceMultiplier *= 1.08;
  else if (trend === "falling") priceMultiplier *= 0.93;
  
  // 4. Apply market position adjustments
  if (bookData.marketAverage) {
    const marketRatio = bookData.price / bookData.marketAverage;
    
    // For premium books, stay premium but don't go too high
    if (competitivePosition === "premium") {
      const targetRatio = Math.min(marketRatio, 1.3);
      const marketTarget = bookData.marketAverage * targetRatio;
      const blendFactor = 0.7; // 70% own price, 30% market target
      
      let suggestedPrice = (bookData.price * priceMultiplier * blendFactor) + 
                          (marketTarget * (1 - blendFactor));
                          
      // Ensure we don't go below market average for premium books
      suggestedPrice = Math.max(suggestedPrice, bookData.marketAverage);
      
      const percentChange = ((suggestedPrice - bookData.price) / bookData.price) * 100;
      
      return {
        bookId: bookData.id,
        currentPrice: bookData.price,
        suggestedPrice: Math.round(suggestedPrice * 100) / 100,
        percentChange: Math.round(percentChange * 10) / 10,
        demandTrend: trend,
        marketAverage: bookData.marketAverage,
        competitivePosition,
        elasticityFactor
      };
    }
    
    // For discount books, maintain discount position but optimize
    if (competitivePosition === "discount") {
      const targetRatio = Math.max(marketRatio, 0.75);
      const marketTarget = bookData.marketAverage * targetRatio;
      const blendFactor = 0.5; // 50% own price, 50% market target
      
      let suggestedPrice = (bookData.price * priceMultiplier * blendFactor) + 
                          (marketTarget * (1 - blendFactor));
                          
      // Ensure we don't go above market average for discount books
      suggestedPrice = Math.min(suggestedPrice, bookData.marketAverage);
      
      const percentChange = ((suggestedPrice - bookData.price) / bookData.price) * 100;
      
      return {
        bookId: bookData.id,
        currentPrice: bookData.price,
        suggestedPrice: Math.round(suggestedPrice * 100) / 100,
        percentChange: Math.round(percentChange * 10) / 10,
        demandTrend: trend,
        marketAverage: bookData.marketAverage,
        competitivePosition,
        elasticityFactor
      };
    }
    
    // For average books, move price toward market average with some variance
    const marketTarget = bookData.marketAverage * elasticityFactor;
    const blendFactor = 0.6; // 60% own price, 40% market target
    
    let suggestedPrice = (bookData.price * priceMultiplier * blendFactor) + 
                        (marketTarget * (1 - blendFactor));
    
    const percentChange = ((suggestedPrice - bookData.price) / bookData.price) * 100;
    
    return {
      bookId: bookData.id,
      currentPrice: bookData.price,
      suggestedPrice: Math.round(suggestedPrice * 100) / 100,
      percentChange: Math.round(percentChange * 10) / 10,
      demandTrend: trend,
      marketAverage: bookData.marketAverage,
      competitivePosition,
      elasticityFactor
    };
  }
  
  // If no market average data, just use our multiplier
  const suggestedPrice = bookData.price * priceMultiplier;
  const percentChange = ((suggestedPrice - bookData.price) / bookData.price) * 100;
  
  return {
    bookId: bookData.id,
    currentPrice: bookData.price,
    suggestedPrice: Math.round(suggestedPrice * 100) / 100,
    percentChange: Math.round(percentChange * 10) / 10,
    demandTrend: trend,
    competitivePosition,
    elasticityFactor
  };
}

// Function to calculate demand score (0-10)
export function calculateDemandScore(bookData: BookData): number {
  const recentSales = bookData.salesHistory.slice(-5);
  const totalRecentSales = recentSales.reduce((sum, sale) => sum + sale, 0);
  
  // Calculate weighted score based on sales, ratings, and stock levels
  const salesScore = Math.min(10, totalRecentSales / 5);
  const ratingScore = (bookData.rating / 5) * 10;
  const stockScore = 10 - Math.min(10, bookData.stockQuantity / 10);
  
  // Weighted average
  const demandScore = (salesScore * 0.5) + (ratingScore * 0.3) + (stockScore * 0.2);
  
  return Math.round(demandScore * 10) / 10; // round to 1 decimal place
}

// Function to analyze category distribution
export function analyzeCategoryDistribution(books: any[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  books.forEach(book => {
    const genre = book.genre;
    distribution[genre] = (distribution[genre] || 0) + 1;
  });
  
  // Convert to percentages
  const total = books.length;
  Object.keys(distribution).forEach(genre => {
    distribution[genre] = Math.round((distribution[genre] / total) * 100);
  });
  
  return distribution;
}
