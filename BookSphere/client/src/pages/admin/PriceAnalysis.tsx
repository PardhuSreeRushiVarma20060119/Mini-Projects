import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";
import { Analytics, Book } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PriceAnalysisProps {
  isLoading: boolean;
  books?: Book[];
  analytics?: Analytics[];
  onApplyPrice: (bookId: number, price: number) => void;
}

export default function PriceAnalysis({ isLoading, books, analytics, onApplyPrice }: PriceAnalysisProps) {
  const [updatingPrices, setUpdatingPrices] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  // Combined data for the table
  const priceData = !isLoading && books && analytics 
    ? books.map(book => {
        const bookAnalytics = analytics.find(a => a.bookId === book.id);
        return {
          id: book.id,
          title: book.title,
          currentPrice: Number(book.price),
          suggestedPrice: bookAnalytics ? Number(bookAnalytics.suggestedPrice) : Number(book.price),
          marketAverage: bookAnalytics ? Number(bookAnalytics.marketAverage) : Number(book.price),
          demandTrend: bookAnalytics ? bookAnalytics.demandTrend : "stable",
          percentChange: bookAnalytics 
            ? ((Number(bookAnalytics.suggestedPrice) - Number(book.price)) / Number(book.price)) * 100 
            : 0
        };
      })
    : [];

  const handleApplyPrice = async (bookId: number, suggestedPrice: number) => {
    try {
      setUpdatingPrices(prev => ({ ...prev, [bookId]: true }));
      await onApplyPrice(bookId, suggestedPrice);
      toast({
        title: "Price Updated",
        description: "The book price has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update the book price. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPrices(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const renderTrendIcon = (trend: string) => {
    if (trend === "rising") {
      return <ArrowUpIcon className="h-4 w-4 text-green-600 inline mr-1" />;
    } else if (trend === "falling") {
      return <ArrowDownIcon className="h-4 w-4 text-red-500 inline mr-1" />;
    } else {
      return <ArrowRightIcon className="h-4 w-4 text-gray-500 inline mr-1" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Price Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Our AI model analyzes market trends, competitor pricing, and demand patterns to suggest optimal pricing strategies.
          </p>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Book Title</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>Suggested Price</TableHead>
                  <TableHead>Market Avg.</TableHead>
                  <TableHead>Demand Trend</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Price Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Our AI model analyzes market trends, competitor pricing, and demand patterns to suggest optimal pricing strategies.
        </p>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Book Title</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Suggested Price</TableHead>
                <TableHead>Market Avg.</TableHead>
                <TableHead>Demand Trend</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceData.length > 0 ? (
                priceData.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>${book.currentPrice.toFixed(2)}</TableCell>
                    <TableCell className={
                      book.percentChange > 0 
                        ? "text-green-600 font-medium" 
                        : book.percentChange < 0 
                          ? "text-red-500 font-medium" 
                          : ""
                    }>
                      ${book.suggestedPrice.toFixed(2)} 
                      {book.percentChange !== 0 && (
                        <span>({book.percentChange > 0 ? '+' : ''}{book.percentChange.toFixed(1)}%)</span>
                      )}
                    </TableCell>
                    <TableCell>${book.marketAverage.toFixed(2)}</TableCell>
                    <TableCell>
                      {renderTrendIcon(book.demandTrend)}
                      <span className={
                        book.demandTrend === "rising" 
                          ? "text-green-600" 
                          : book.demandTrend === "falling" 
                            ? "text-red-500" 
                            : "text-gray-500"
                      }>
                        {book.demandTrend.charAt(0).toUpperCase() + book.demandTrend.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {book.percentChange !== 0 ? (
                        <Button 
                          size="sm"
                          disabled={updatingPrices[book.id]}
                          onClick={() => handleApplyPrice(book.id, book.suggestedPrice)}
                        >
                          {updatingPrices[book.id] ? "Updating..." : "Apply"}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          No Change
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No price analysis data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
