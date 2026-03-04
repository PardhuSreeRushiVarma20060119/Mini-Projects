import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import BooksGrid from "@/components/BooksGrid";
import { Book } from "@shared/schema";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const [_, setLocation] = useLocation();

  const { data: books, isLoading } = useQuery<Book[]>({ 
    queryKey: ['/api/books'],
  });

  const featuredBooks = books?.filter(book => book.featured).slice(0, 6) || [];
  const newReleases = books?.filter(book => book.newRelease).slice(0, 3) || [];
  const bestSellers = books?.filter(book => book.bestSeller).slice(0, 3) || [];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-primary-foreground to-primary/10 rounded-lg">
        <div className="container mx-auto px-4">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-4">
                Discover Your Next Favorite Book
              </h1>
              <p className="text-lg md:text-xl mb-6 text-muted-foreground">
                Explore our curated collection of bestsellers, new releases, and timeless classics.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => setLocation("/browse")}>
                  Browse Books
                </Button>
                <Button size="lg" variant="outline" onClick={() => setLocation("/new-releases")}>
                  See New Releases
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="grid grid-cols-2 gap-4 rotate-3">
                <img 
                  src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                  alt="Book cover" 
                  className="rounded-lg shadow-lg transform -rotate-6"
                />
                <img 
                  src="https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                  alt="Book cover" 
                  className="rounded-lg shadow-lg transform rotate-6 mt-8"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-heading font-bold text-2xl">Featured Books</h2>
          <Button variant="ghost" onClick={() => setLocation("/browse")}>
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {isLoading ? (
            Array(6).fill(null).map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                <div className="w-full h-40 bg-gray-200"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3 w-1/2"></div>
                </div>
              </div>
            ))
          ) : featuredBooks.length > 0 ? (
            featuredBooks.map(book => (
              <div key={book.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <img 
                  src={book.coverImage} 
                  alt={`${book.title} cover`} 
                  className="w-full h-40 object-cover object-center"
                />
                <div className="p-3">
                  <h3 className="font-serif font-bold text-sm mb-1 line-clamp-1">{book.title}</h3>
                  <p className="text-muted-foreground text-xs mb-1">by {book.author}</p>
                  <p className="font-bold text-sm">${Number(book.price).toFixed(2)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">No featured books available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Grid */}
      <section>
        <h2 className="font-heading font-bold text-2xl mb-6">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Fiction", "Non-Fiction", "Mystery & Thriller", "Sci-Fi & Fantasy"].map(category => (
            <div key={category} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 p-6 text-center cursor-pointer" onClick={() => {
              setLocation(`/browse?filters=${encodeURIComponent(JSON.stringify({
                genres: [category.toLowerCase().split(' & ')[0]]
              }))}`)
            }}>
              <h3 className="font-heading font-bold text-lg">{category}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* New Releases and Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-heading font-bold text-2xl">New Releases</h2>
            <Button variant="ghost" onClick={() => setLocation("/new-releases")}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              Array(3).fill(null).map((_, i) => (
                <div key={i} className="flex bg-white p-4 rounded-lg shadow-sm animate-pulse">
                  <div className="w-16 h-24 bg-gray-200 rounded mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3 w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : newReleases.length > 0 ? (
              newReleases.map(book => (
                <div key={book.id} className="flex bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                  <img 
                    src={book.coverImage} 
                    alt={`${book.title} cover`} 
                    className="w-16 h-24 object-cover rounded mr-4"
                  />
                  <div>
                    <h3 className="font-serif font-bold mb-1">{book.title}</h3>
                    <p className="text-muted-foreground text-sm mb-1">by {book.author}</p>
                    <p className="font-bold">${Number(book.price).toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No new releases available.</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-heading font-bold text-2xl">Best Sellers</h2>
            <Button variant="ghost" onClick={() => setLocation("/best-sellers")}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              Array(3).fill(null).map((_, i) => (
                <div key={i} className="flex bg-white p-4 rounded-lg shadow-sm animate-pulse">
                  <div className="w-16 h-24 bg-gray-200 rounded mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3 w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : bestSellers.length > 0 ? (
              bestSellers.map(book => (
                <div key={book.id} className="flex bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                  <img 
                    src={book.coverImage} 
                    alt={`${book.title} cover`} 
                    className="w-16 h-24 object-cover rounded mr-4"
                  />
                  <div>
                    <h3 className="font-serif font-bold mb-1">{book.title}</h3>
                    <p className="text-muted-foreground text-sm mb-1">by {book.author}</p>
                    <p className="font-bold">${Number(book.price).toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No best sellers available.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
