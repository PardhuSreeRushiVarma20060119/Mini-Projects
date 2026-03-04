import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useFilters } from "@/hooks/useFilters";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Filter, X } from "lucide-react";

export default function Filters() {
  const { filters, updateFilters, applyFilters, resetFilters } = useFilters();
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 150
  ]);
  
  const handlePriceChange = (value: number[]) => {
    setLocalPriceRange([value[0], value[1]]);
  };
  
  const handleGenreChange = (genre: string, checked: boolean) => {
    const currentGenres = filters.genres || [];
    if (checked) {
      updateFilters({ genres: [...currentGenres, genre] });
    } else {
      updateFilters({ genres: currentGenres.filter(g => g !== genre) });
    }
  };
  
  const handleAvailabilityChange = (availability: string, checked: boolean) => {
    const current = filters.availability || [];
    if (checked) {
      updateFilters({ availability: [...current, availability] });
    } else {
      updateFilters({ availability: current.filter(a => a !== availability) });
    }
  };
  
  const handleApplyFilters = () => {
    updateFilters({
      minPrice: localPriceRange[0],
      maxPrice: localPriceRange[1]
    });
    applyFilters();
    setIsMobileFilterOpen(false);
  };
  
  const handleResetFilters = () => {
    resetFilters();
    setLocalPriceRange([0, 150]);
  };
  
  const FilterContent = () => (
    <>
      <div className="mb-6">
        <h3 className="font-medium text-primary mb-2">Price Range</h3>
        <div className="flex items-center mb-2">
          <span className="text-sm mr-2">${localPriceRange[0]}</span>
          <div className="relative flex-grow h-2 bg-gray-200 rounded-full">
            <div 
              className="absolute h-2 bg-primary rounded-full" 
              style={{
                left: `${(localPriceRange[0] / 150) * 100}%`,
                right: `${100 - (localPriceRange[1] / 150) * 100}%`
              }}
            ></div>
          </div>
          <span className="text-sm ml-2">${localPriceRange[1]}</span>
        </div>
        <Slider
          defaultValue={[localPriceRange[0], localPriceRange[1]]}
          value={[localPriceRange[0], localPriceRange[1]]}
          max={150}
          step={1}
          onValueChange={handlePriceChange}
          className="mt-4"
        />
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium text-primary mb-2">Genres</h3>
        <div className="space-y-2">
          {['fiction', 'non-fiction', 'mystery', 'scifi', 'biography'].map(genre => (
            <div key={genre} className="flex items-center">
              <Checkbox 
                id={`genre-${genre}`} 
                checked={(filters.genres || []).includes(genre)}
                onCheckedChange={(checked) => 
                  handleGenreChange(genre, checked as boolean)
                }
              />
              <Label htmlFor={`genre-${genre}`} className="ml-2 text-sm capitalize">
                {genre === 'scifi' ? 'Sci-Fi & Fantasy' : genre}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium text-primary mb-2">Availability</h3>
        <div className="space-y-2">
          {['in-stock', 'low-stock', 'pre-order'].map(availability => (
            <div key={availability} className="flex items-center">
              <Checkbox 
                id={`availability-${availability}`} 
                checked={(filters.availability || []).includes(availability)}
                onCheckedChange={(checked) => 
                  handleAvailabilityChange(availability, checked as boolean)
                }
              />
              <Label htmlFor={`availability-${availability}`} className="ml-2 text-sm capitalize">
                {availability.replace('-', ' ')}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col space-y-2">
        <Button onClick={handleApplyFilters} className="w-full">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={handleResetFilters} className="w-full">
          Reset Filters
        </Button>
      </div>
    </>
  );
  
  return (
    <aside className="md:col-span-1">
      {/* Desktop Filters */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm p-4">
        <h2 className="font-heading font-bold text-lg mb-4">Filters</h2>
        <FilterContent />
      </div>
      
      {/* Mobile Filters Button */}
      <div className="md:hidden mb-4">
        <Dialog open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full flex items-center justify-center">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Filters</DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-4"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <FilterContent />
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}
