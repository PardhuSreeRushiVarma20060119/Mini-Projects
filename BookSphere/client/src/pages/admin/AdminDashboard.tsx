import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsSummary from "./AnalyticsSummary";
import SalesTrendChart from "./SalesTrendChart";
import CategoryDistribution from "./CategoryDistribution";
import PriceAnalysis from "./PriceAnalysis";
import BulkPriceUpdater from "./BulkPriceUpdater";
import InventoryStatus from "./InventoryStatus";
import { Analytics, Book } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function AdminDashboard() {
  // Fetch all required data on page load
  const { data: books, isLoading: booksLoading } = useQuery<Book[]>({ 
    queryKey: ['/api/books'],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics[]>({ 
    queryKey: ['/api/analytics'],
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({ 
    queryKey: ['/api/sales'],
  });

  const { data: categoryData, isLoading: categoryLoading } = useQuery({ 
    queryKey: ['/api/category-distribution'],
  });

  const isLoading = booksLoading || analyticsLoading || salesLoading || categoryLoading;

  // Function to refresh data after price updates
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/books'] });
    queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
  };

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl mb-6">Admin Dashboard</h1>
      
      <AnalyticsSummary isLoading={isLoading} books={books} salesData={salesData} />
      
      <Tabs defaultValue="analytics" className="mt-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Sales & Analytics</TabsTrigger>
          <TabsTrigger value="pricing">Price Analysis</TabsTrigger>
          <TabsTrigger value="dynamic-pricing">Dynamic Pricing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesTrendChart isLoading={salesLoading} salesData={salesData} />
            <CategoryDistribution isLoading={categoryLoading} categoryData={categoryData} />
          </div>
        </TabsContent>
        
        <TabsContent value="pricing" className="mt-6">
          <PriceAnalysis 
            isLoading={isLoading} 
            books={books} 
            analytics={analytics}
            onApplyPrice={(bookId, price) => {
              // Update book price
              if (books) {
                const book = books.find(b => b.id === bookId);
                if (book) {
                  apiRequest('PUT', `/api/books/${bookId}`, {
                    price
                  }).then(() => {
                    refreshData();
                  });
                }
              }
            }}
          />
        </TabsContent>
        
        <TabsContent value="dynamic-pricing" className="mt-6">
          <BulkPriceUpdater 
            isLoading={isLoading}
            books={books}
            onPricesUpdated={refreshData}
          />
        </TabsContent>
        
        <TabsContent value="inventory" className="mt-6">
          <InventoryStatus 
            isLoading={booksLoading} 
            books={books} 
            onDeleteBook={(bookId) => {
              // Delete book
              if (books) {
                apiRequest('DELETE', `/api/books/${bookId}`).then(() => {
                  queryClient.invalidateQueries({ queryKey: ['/api/books'] });
                });
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
