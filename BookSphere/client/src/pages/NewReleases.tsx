import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import BooksGrid from "@/components/BooksGrid";

export default function NewReleases() {
  const { data: books, isLoading } = useQuery<Book[]>({ 
    queryKey: ['/api/books/filter', 'newRelease=true'],
  });

  return (
    <div className="grid grid-cols-1 gap-6">
      <BooksGrid 
        books={books || []} 
        title="New Releases" 
        loading={isLoading}
        emptyMessage="No new releases available at the moment."
      />
    </div>
  );
}
