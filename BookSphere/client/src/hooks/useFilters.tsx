import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

export interface Filters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  genres?: string[];
  availability?: string[];
  featured?: boolean;
  newRelease?: boolean;
  bestSeller?: boolean;
}

interface FiltersContextType {
  filters: Filters;
  updateFilters: (partialFilters: Partial<Filters>) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [filters, setFilters] = useState<Filters>(() => {
    // Try to parse filters from URL on initial load
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const filtersParam = searchParams.get("filters");
      
      if (filtersParam) {
        return JSON.parse(decodeURIComponent(filtersParam));
      }
    } catch (error) {
      console.error("Failed to parse filters from URL", error);
    }
    
    return {};
  });

  // Update URL when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      const searchParams = new URLSearchParams();
      searchParams.set("filters", encodeURIComponent(JSON.stringify(filters)));
      
      // If we're not already on the browse page, go there
      if (!location.startsWith("/browse")) {
        setLocation(`/browse?${searchParams.toString()}`);
      } else {
        // Otherwise, just update the URL without navigation
        window.history.replaceState(
          null, 
          "", 
          `${window.location.pathname}?${searchParams.toString()}`
        );
      }
    } else {
      // If filters are empty, remove query string
      if (window.location.search) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, [filters, location, setLocation]);

  const updateFilters = (partialFilters: Partial<Filters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...partialFilters
    }));
  };

  const applyFilters = () => {
    // This function exists primarily to serve as a trigger point
    // Actual application of filters happens in the useEffect above
    // But we can add any additional logic here if needed
  };

  const resetFilters = () => {
    setFilters({});
  };

  return (
    <FiltersContext.Provider value={{ filters, updateFilters, applyFilters, resetFilters }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
}
