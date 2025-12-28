import { Card, CardContent } from "@/components/ui/card";
import { Book } from "@shared/schema";
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsSummaryProps {
  isLoading: boolean;
  books?: Book[];
  salesData?: any;
}

export default function AnalyticsSummary({ isLoading, books, salesData }: AnalyticsSummaryProps) {
  // Calculate summary metrics
  const totalBooks = books?.length || 0;
  const lowStockItems = books?.filter(book => book.availability === "low-stock").length || 0;
  
  // Extract sales data
  const totalSales = salesData?.sales?.reduce((acc: number, sale: any) => acc + Number(sale.totalAmount), 0) || 0;
  const totalOrders = salesData?.sales?.length || 0;
  
  // Mock customer data (in a real app, this would come from the backend)
  const totalCustomers = 892;
  
  // Calculate month-over-month changes (mock data for demo)
  const salesChange = 12;
  const ordersChange = 8;
  const customersChange = 5;
  const lowStockChange = 2;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-10 w-10 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Sales Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Total Sales</p>
              <h3 className="font-bold text-2xl">${totalSales.toFixed(2)}</h3>
              <p className="text-green-600 text-sm">↑ {salesChange}% <span className="text-muted-foreground">from last month</span></p>
            </div>
            <div className="p-2 bg-primary/10 rounded-md text-primary">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Orders Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Total Orders</p>
              <h3 className="font-bold text-2xl">{totalOrders}</h3>
              <p className="text-green-600 text-sm">↑ {ordersChange}% <span className="text-muted-foreground">from last month</span></p>
            </div>
            <div className="p-2 bg-primary/10 rounded-md text-primary">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Customers Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Total Customers</p>
              <h3 className="font-bold text-2xl">{totalCustomers}</h3>
              <p className="text-green-600 text-sm">↑ {customersChange}% <span className="text-muted-foreground">from last month</span></p>
            </div>
            <div className="p-2 bg-green-600/10 rounded-md text-green-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Inventory Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Low Stock Items</p>
              <h3 className="font-bold text-2xl">{lowStockItems}</h3>
              <p className="text-red-500 text-sm">↑ {lowStockChange} <span className="text-muted-foreground">from last week</span></p>
            </div>
            <div className="p-2 bg-red-500/10 rounded-md text-red-500">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
