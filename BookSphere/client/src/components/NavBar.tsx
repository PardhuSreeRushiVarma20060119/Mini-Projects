import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpenText, ShoppingCart, User, Menu, Search } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useFilters } from "@/hooks/useFilters";
import { useEffect, useState } from "react";

interface NavBarProps {
  onCartOpen: () => void;
  onMenuOpen: () => void;
}

export default function NavBar({ onCartOpen, onMenuOpen }: NavBarProps) {
  const [location] = useLocation();
  const { cart } = useCart();
  const { filters, updateFilters, applyFilters } = useFilters();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
    applyFilters();
  };

  // Update search query when filters change
  useEffect(() => {
    setSearchQuery(filters.search || "");
  }, [filters.search]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Navigation (Left Side) */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-3 text-foreground"
              onClick={onMenuOpen}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <Link href="/" className="flex items-center">
              <BookOpenText className="text-primary h-8 w-8 mr-2" />
              <span className="font-heading font-bold text-xl md:text-2xl">BookSphere</span>
            </Link>
            
            <nav className="hidden md:flex ml-8 space-x-6">
              <Link href="/browse">
                <a className={`font-medium hover:text-primary ${location === '/browse' ? 'text-primary' : 'text-foreground'}`}>
                  Browse
                </a>
              </Link>
              <Link href="/new-releases">
                <a className={`font-medium hover:text-primary ${location === '/new-releases' ? 'text-primary' : 'text-foreground'}`}>
                  New Releases
                </a>
              </Link>
              <Link href="/best-sellers">
                <a className={`font-medium hover:text-primary ${location === '/best-sellers' ? 'text-primary' : 'text-foreground'}`}>
                  Best Sellers
                </a>
              </Link>
            </nav>
          </div>
          
          {/* Search & User Actions (Right Side) */}
          <div className="flex items-center">
            <div className="hidden md:block relative mr-4 w-64">
              <form onSubmit={handleSearch}>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books, authors..."
                  className="pr-10"
                />
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full"
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                </Button>
              </form>
            </div>
            
            {/* User Actions */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="p-2 hover:text-primary"
                asChild
              >
                <Link href="/admin">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="p-2 ml-2 relative hover:text-primary"
                onClick={onCartOpen}
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {cart.items.length}
                  </span>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="p-2 ml-2 md:hidden hover:text-primary"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Search */}
        {showMobileSearch && (
          <div className="md:hidden mt-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books, authors..."
                  className="w-full pr-10"
                />
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full"
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
