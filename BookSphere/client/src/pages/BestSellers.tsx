import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import BooksGrid from "@/components/BooksGrid";

export default function BestSellers() {
  const { data: books, isLoading } = useQuery<Book[]>({ 
    queryKey: ['/api/books/filter', 'bestSeller=true'],
  });

  return (
    <div className="grid grid-cols-1 gap-6">
      <BooksGrid 
        books={books || []} 
        title="Best Sellers" 
        loading={isLoading}
        emptyMessage="No best sellers available at the moment."
      />
    </div>
  );
}
