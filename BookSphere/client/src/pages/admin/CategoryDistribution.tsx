import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryDistributionProps {
  isLoading: boolean;
  categoryData?: any;
}

export default function CategoryDistribution({ isLoading, categoryData }: CategoryDistributionProps) {
  const [viewMode, setViewMode] = useState("sales");
  
  // Get the appropriate data based on mode
  const distributionData = viewMode === "sales" 
    ? categoryData?.bySales 
    : categoryData?.byInventory;
  
  // Colors for the pie chart
  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--warning))",
    "hsl(var(--success))",
    "hsl(var(--destructive))",
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))"
  ];
  
  // Transform data for the pie chart
  const pieData = distributionData?.map((item: any) => ({
    name: item.genre.charAt(0).toUpperCase() + item.genre.slice(1),
    value: viewMode === "sales" ? item.totalSales : item.bookCount
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Book Categories</CardTitle>
          <Skeleton className="h-9 w-28" />
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Book Categories</CardTitle>
        <Select value={viewMode} onValueChange={setViewMode}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="By Sales" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">By Sales</SelectItem>
            <SelectItem value="inventory">By Inventory</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px]">
          {pieData && pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={1}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [
                    viewMode === "sales" ? `${value} books sold` : `${value} books in inventory`, 
                    "Quantity"
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No category data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
