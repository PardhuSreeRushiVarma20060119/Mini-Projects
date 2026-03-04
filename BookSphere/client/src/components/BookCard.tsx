import { Book } from "@shared/schema";
import { Link } from "wouter";
import { StarRating } from "./ui/star-rating";
import { PriceDisplay } from "./ui/price-display";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const { addToCart } = useCart();

  const getAvailabilityBadge = () => {
    switch (book.availability) {
      case "in-stock":
        return <Badge className="bg-green-600">In Stock</Badge>;
      case "low-stock":
        return <Badge className="bg-yellow-500">Low Stock</Badge>;
      case "out-of-stock":
        return <Badge className="bg-red-500">Out of Stock</Badge>;
      case "pre-order":
        return <Badge className="bg-purple-600">Pre-Order</Badge>;
      default:
        return null;
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: book.id,
      title: book.title,
      price: Number(book.price),
      coverImage: book.coverImage,
      quantity: 1
    });
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <Link href={`/book/${book.id}`}>
        <div className="relative cursor-pointer">
          <img
            src={book.coverImage}
            alt={`${book.title} cover`}
            className="w-full h-56 object-cover object-center"
          />
          <div className="absolute top-2 right-2">
            {getAvailabilityBadge()}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/book/${book.id}`}>
          <h3 className="font-serif font-bold text-lg mb-1 line-clamp-2 cursor-pointer hover:text-primary transition-colors">{book.title}</h3>
        </Link>
        <p className="text-muted-foreground text-sm mb-2">by {book.author}</p>

        <StarRating
          rating={Number(book.rating)}
          reviewCount={book.reviewCount}
          className="mb-3"
        />

        <div className="flex justify-between items-center">
          <PriceDisplay
            price={Number(book.price)}
            originalPrice={book.originalPrice ? Number(book.originalPrice) : undefined}
          />

          <Button
            size="icon"
            className="bg-primary hover:bg-primary/90 text-white rounded-full"
            onClick={handleAddToCart}
            disabled={book.availability === "out-of-stock"}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
