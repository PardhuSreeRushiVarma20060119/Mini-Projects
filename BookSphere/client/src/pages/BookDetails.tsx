import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Book, Analytics } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { PriceDisplay } from "@/components/ui/price-display";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useLocation } from "wouter";

export default function BookDetails() {
    const [match, params] = useRoute("/book/:id");
    const [_, setLocation] = useLocation();
    const { addToCart } = useCart();
    const id = params?.id ? parseInt(params.id) : 0;

    const { data: book, isLoading: isLoadingBook } = useQuery<Book>({
        queryKey: [`/api/books/${id}`],
        enabled: !!id
    });

    const { data: analytics } = useQuery<Analytics>({
        queryKey: [`/api/analytics/book/${id}`],
        enabled: !!id
    });

    if (isLoadingBook) {
        return (
            <div className="container mx-auto px-4 py-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                    <div className="md:col-span-2 space-y-4">
                        <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Book not found</h2>
                <Button onClick={() => setLocation("/browse")}>Browse Books</Button>
            </div>
        );
    }

    const handleAddToCart = () => {
        addToCart({
            id: book.id,
            title: book.title,
            price: Number(book.price),
            coverImage: book.coverImage,
            quantity: 1
        });
    };

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

    const getDemandTrendIcon = () => {
        if (!analytics) return null;
        switch (analytics.demandTrend) {
            case "up":
                return <TrendingUp className="h-4 w-4 text-green-500 mr-1" />;
            case "down":
                return <TrendingDown className="h-4 w-4 text-red-500 mr-1" />;
            default:
                return <Minus className="h-4 w-4 text-gray-500 mr-1" />;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Button
                variant="ghost"
                className="mb-6 pl-0 hover:pl-2 transition-all"
                onClick={() => history.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                {/* Left Column: Image */}
                <div className="relative">
                    <img
                        src={book.coverImage}
                        alt={`${book.title} cover`}
                        className="w-full rounded-lg shadow-xl object-cover"
                    />
                    {analytics && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                            <h4 className="font-semibold text-sm mb-2 flex items-center">
                                Market Insights
                            </h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Demand:</span>
                                <span className="flex items-center font-medium">
                                    {getDemandTrendIcon()}
                                    {analytics.demandTrend === 'up' ? 'Rising' : analytics.demandTrend === 'down' ? 'Falling' : 'Stable'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-muted-foreground">Score:</span>
                                <span className="font-medium">{Number(analytics.demandScore).toFixed(1)}/10</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Details */}
                <div className="md:col-span-2">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                        <div>
                            <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">{book.title}</h1>
                            <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>
                        </div>
                        {getAvailabilityBadge()}
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <StarRating rating={Number(book.rating)} reviewCount={book.reviewCount} size="lg" />
                        <span className="text-sm text-muted-foreground">
                            {book.genre.charAt(0).toUpperCase() + book.genre.slice(1)}
                        </span>
                    </div>

                    <PriceDisplay
                        price={Number(book.price)}
                        originalPrice={book.originalPrice ? Number(book.originalPrice) : undefined}
                        size="lg"
                        className="mb-8"
                    />

                    <div className="prose max-w-none mb-8">
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {book.description}
                        </p>
                    </div>

                    <Separator className="my-8" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div>
                            <span className="block text-sm text-muted-foreground">Published</span>
                            <span className="font-medium">
                                {new Date(book.publishedDate).toLocaleDateString()}
                            </span>
                        </div>
                        <div>
                            <span className="block text-sm text-muted-foreground">Publisher</span>
                            <span className="font-medium">BookSphere Press</span>
                        </div>
                        <div>
                            <span className="block text-sm text-muted-foreground">Pages</span>
                            <span className="font-medium">320</span>
                        </div>
                        <div>
                            <span className="block text-sm text-muted-foreground">Language</span>
                            <span className="font-medium">English</span>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="w-full md:w-auto min-w-[200px]"
                        onClick={handleAddToCart}
                        disabled={book.availability === "out-of-stock"}
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {book.availability === "pre-order" ? "Pre-Order Now" : "Add to Cart"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
