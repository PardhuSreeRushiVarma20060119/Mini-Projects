import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Book } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

interface BulkPriceUpdaterProps {
  books?: Book[];
  isLoading: boolean;
  onPricesUpdated: () => void;
}

export default function BulkPriceUpdater({ books, isLoading, onPricesUpdated }: BulkPriceUpdaterProps) {
  const [selectedBooks, setSelectedBooks] = useState<Record<number, boolean>>({});
  const [priceAnalysis, setPriceAnalysis] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Handle book selection
  const toggleBookSelection = (bookId: number) => {
    setSelectedBooks(prev => ({
      ...prev,
      [bookId]: !prev[bookId]
    }));
  };

  // Select or deselect all books
  const toggleSelectAll = () => {
    if (books) {
      const allSelected = books.every(book => selectedBooks[book.id]);
      
      const newSelection: Record<number, boolean> = {};
      books.forEach(book => {
        newSelection[book.id] = !allSelected;
      });
      
      setSelectedBooks(newSelection);
    }
  };

  // Check if a book has a significant price change
  const hasSignificantChange = (book: any) => {
    return Math.abs(book.percentChange) >= 3; // 3% or more change is significant
  };

  // Analyze prices based on market data and demand
  const analyzePrices = async () => {
    try {
      setIsAnalyzing(true);
      
      const response = await apiRequest('POST', '/api/books/analyze-prices', {});
      const data = await response.json();
      
      // Sort price analysis by percent change (absolute value, descending)
      const sortedAnalysis = data.priceAnalysis.sort((a: any, b: any) => {
        return Math.abs(b.suggestedPrice - b.currentPrice) - Math.abs(a.suggestedPrice - a.currentPrice);
      });
      
      setPriceAnalysis(sortedAnalysis);
      
      // Auto-select books with significant price changes
      const newSelection: Record<number, boolean> = {};
      sortedAnalysis.forEach((book: any) => {
        const percentChange = ((book.suggestedPrice - book.currentPrice) / book.currentPrice) * 100;
        book.percentChange = Math.round(percentChange * 10) / 10;
        newSelection[book.id] = Math.abs(percentChange) >= 5; // Auto-select books with 5% or more change
      });
      
      setSelectedBooks(newSelection);
      
      toast({
        title: "Price Analysis Complete",
        description: `Analyzed prices for ${sortedAnalysis.length} books`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze book prices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply suggested prices to selected books
  const applyPriceChanges = async () => {
    try {
      setIsUpdating(true);
      
      // Create price update objects for selected books
      const selectedBookIds = Object.entries(selectedBooks)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => parseInt(id));
      
      const priceUpdates = priceAnalysis
        .filter(book => selectedBookIds.includes(book.id))
        .map(book => ({
          id: book.id,
          oldPrice: book.currentPrice,
          newPrice: book.suggestedPrice
        }));
      
      if (priceUpdates.length === 0) {
        toast({
          title: "No Books Selected",
          description: "Please select at least one book to update pricing.",
        });
        setIsUpdating(false);
        return;
      }
      
      // Send price updates to the server
      const response = await apiRequest('POST', '/api/books/update-prices', {
        priceUpdates
      });
      
      const result = await response.json();
      
      // Clear selections and analysis after update
      setSelectedBooks({});
      setPriceAnalysis([]);
      
      // Trigger callback to refresh book data
      onPricesUpdated();
      
      toast({
        title: "Prices Updated",
        description: `Successfully updated prices for ${result.updatedBooks.length} books`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update book prices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Render trend icon based on demand trend
  const renderTrendIcon = (trend: string) => {
    if (trend === "rising") {
      return <ArrowUpIcon className="h-4 w-4 text-green-600 inline mr-1" />;
    } else if (trend === "falling") {
      return <ArrowDownIcon className="h-4 w-4 text-red-500 inline mr-1" />;
    } else {
      return <ArrowRightIcon className="h-4 w-4 text-gray-500 inline mr-1" />;
    }
  };

  // Render price change with formatting
  const renderPriceChange = (current: number, suggested: number) => {
    const diff = suggested - current;
    const percentChange = (diff / current) * 100;
    
    if (Math.abs(percentChange) < 0.5) {
      return <span className="text-gray-500">No change</span>;
    }
    
    const color = diff > 0 ? "text-green-600" : "text-red-500";
    const prefix = diff > 0 ? "+" : "";
    
    return (
      <span className={color}>
        {prefix}{diff.toFixed(2)} ({prefix}{percentChange.toFixed(1)}%)
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Price Optimizer</CardTitle>
          <CardDescription>
            Automatically analyze and update book prices based on market trends and demand.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Button disabled>Analyze Prices</Button>
            <Button disabled>Apply Selected Changes</Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Book Title</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>Suggested Price</TableHead>
                  <TableHead>Price Change</TableHead>
                  <TableHead>Market Position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    Loading price data...
                  </TableCell>
                </TableRow>
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
        <CardTitle>Dynamic Price Optimizer</CardTitle>
        <CardDescription>
          Automatically analyze and update book prices based on market trends and demand.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <Button 
            onClick={analyzePrices} 
            disabled={isAnalyzing || isUpdating}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Prices"}
          </Button>
          <Button 
            onClick={applyPriceChanges}
            disabled={isAnalyzing || isUpdating || priceAnalysis.length === 0}
            variant={priceAnalysis.length > 0 ? "default" : "outline"}
          >
            {isUpdating ? "Updating..." : "Apply Selected Changes"}
          </Button>
        </div>
        
        {priceAnalysis.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={books && books.length > 0 && books.every(book => selectedBooks[book.id])}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Book Title</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>Suggested Price</TableHead>
                  <TableHead>Price Change</TableHead>
                  <TableHead>Market Position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceAnalysis.map((book) => {
                  const hasChange = hasSignificantChange(book);
                  
                  return (
                    <TableRow 
                      key={book.id}
                      className={hasChange ? "" : "opacity-70"}
                    >
                      <TableCell>
                        <Checkbox 
                          checked={selectedBooks[book.id] || false}
                          onCheckedChange={() => toggleBookSelection(book.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {book.title}
                        <div className="text-xs text-muted-foreground">
                          {renderTrendIcon(book.demandTrend)}
                          <span className={
                            book.demandTrend === "rising" 
                              ? "text-green-600" 
                              : book.demandTrend === "falling" 
                                ? "text-red-500" 
                                : "text-gray-500"
                          }>
                            {book.demandTrend === "rising" 
                              ? "Rising demand" 
                              : book.demandTrend === "falling" 
                                ? "Falling demand" 
                                : "Stable demand"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>${book.currentPrice.toFixed(2)}</TableCell>
                      <TableCell>${book.suggestedPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        {renderPriceChange(book.currentPrice, book.suggestedPrice)}
                      </TableCell>
                      <TableCell>
                        {book.competitivePosition === "premium" ? (
                          <Badge className="bg-purple-600">Premium</Badge>
                        ) : book.competitivePosition === "discount" ? (
                          <Badge className="bg-blue-500">Discount</Badge>
                        ) : (
                          <Badge className="bg-gray-500">Average</Badge>
                        )}
                        {book.marketAverage && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Market avg: ${book.marketAverage.toFixed(2)}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-md border p-8 text-center text-muted-foreground">
            {books && books.length > 0 ? (
              <>
                <p>Click "Analyze Prices" to get AI-powered price suggestions based on market trends and demand analysis.</p>
                <p className="mt-2 text-sm">Our algorithm analyzes competitor pricing, demand patterns, and inventory levels to optimize your book prices.</p>
              </>
            ) : (
              <p>No books available for price optimization.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}