import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import BooksGrid from "@/components/BooksGrid";
import Filters from "@/components/Filters";
import { useFilters } from "@/hooks/useFilters";
import { FiltersProvider } from "@/hooks/useFilters";
import { useEffect } from "react";

export default function BrowseBooks() {
  return (
    <FiltersProvider>
      <BrowseBooksContent />
    </FiltersProvider>
  );
}

function BrowseBooksContent() {
  const { filters } = useFilters();

  // Convert filters to query string
  const filterParams = new URLSearchParams();
  
  if (filters.search) filterParams.append("search", filters.search);
  if (filters.minPrice !== undefined) filterParams.append("minPrice", filters.minPrice.toString());
  if (filters.maxPrice !== undefined) filterParams.append("maxPrice", filters.maxPrice.toString());
  
  if (filters.genres && filters.genres.length > 0) {
    filterParams.append("genres", filters.genres.join(","));
  }
  
  if (filters.availability && filters.availability.length > 0) {
    filterParams.append("availability", filters.availability.join(","));
  }
  
  if (filters.featured !== undefined) filterParams.append("featured", filters.featured.toString());
  if (filters.newRelease !== undefined) filterParams.append("newRelease", filters.newRelease.toString());
  if (filters.bestSeller !== undefined) filterParams.append("bestSeller", filters.bestSeller.toString());

  const queryString = filterParams.toString();
  const queryKey = queryString 
    ? ['/api/books/filter', queryString] 
    : ['/api/books'];
  
  const apiUrl = queryString 
    ? `/api/books/filter?${queryString}` 
    : '/api/books';

  const { data: books, isLoading } = useQuery<Book[]>({ 
    queryKey,
    enabled: true,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Filters />
      <BooksGrid 
        books={books || []} 
        title="Browse Books" 
        loading={isLoading}
        emptyMessage={
          Object.keys(filters).length > 0 
            ? "No books match your filters. Try adjusting your criteria."
            : "No books available."
        }
      />
    </div>
  );
}
