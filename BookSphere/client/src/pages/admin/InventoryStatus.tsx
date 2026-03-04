import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Book, insertBookSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { queryClient } from "@/lib/queryClient";
import { z } from "zod";

interface InventoryStatusProps {
  isLoading: boolean;
  books?: Book[];
  onDeleteBook: (bookId: number) => void;
}

export default function InventoryStatus({ isLoading, books, onDeleteBook }: InventoryStatusProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [deletingBook, setDeletingBook] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = (availability: string) => {
    switch (availability) {
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

  const handleDelete = async () => {
    if (!selectedBookId) return;
    
    try {
      setDeletingBook(true);
      await onDeleteBook(selectedBookId);
      toast({
        title: "Book Deleted",
        description: "The book has been successfully removed from inventory.",
      });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete the book. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingBook(false);
      setIsDeleteDialogOpen(false);
      setSelectedBookId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inventory Status</CardTitle>
          <Skeleton className="h-10 w-[140px]" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventory Status</CardTitle>
        <AddBookDialog isOpen={isAddDialogOpen} setIsOpen={setIsAddDialogOpen} />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books && books.length > 0 ? (
                books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>#{book.id}</TableCell>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell className="capitalize">{book.genre}</TableCell>
                    <TableCell>{book.stockQuantity}</TableCell>
                    <TableCell>{getStatusBadge(book.availability)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/admin/books/edit/${book.id}`}>
                            <Edit className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            setSelectedBookId(book.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No books in inventory
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this book from the inventory? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deletingBook}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deletingBook}
              >
                {deletingBook ? "Deleting..." : "Delete Book"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

interface AddBookDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

function AddBookDialog({ isOpen, setIsOpen }: AddBookDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extend the insertBookSchema with more validation
  const bookFormSchema = insertBookSchema.extend({
    price: z.preprocess(
      (val) => parseFloat(val as string),
      z.number().min(0.01, "Price must be greater than 0")
    ),
    originalPrice: z.preprocess(
      (val) => val === '' ? null : parseFloat(val as string),
      z.number().min(0.01, "Original price must be greater than 0").nullable().optional()
    ),
    stockQuantity: z.preprocess(
      (val) => parseInt(val as string),
      z.number().min(0, "Stock quantity must be 0 or greater")
    ),
  });

  const form = useForm<z.infer<typeof bookFormSchema>>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      coverImage: "",
      price: 0,
      originalPrice: null,
      genre: "fiction",
      rating: 0,
      reviewCount: 0,
      stockQuantity: 0,
      availability: "in-stock",
      featured: false,
      newRelease: false,
      bestSeller: false,
      publishedDate: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = async (data: z.infer<typeof bookFormSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Convert date string to Date object if needed
      if (typeof data.publishedDate === 'string') {
        data.publishedDate = new Date(data.publishedDate);
      }
      
      await apiRequest('POST', '/api/books', data);
      
      // Reset form and close dialog
      form.reset();
      setIsOpen(false);
      
      // Show success message
      toast({
        title: "Book Added",
        description: "The book has been successfully added to inventory.",
      });
      
      // Refresh book list
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
    } catch (error) {
      toast({
        title: "Add Failed",
        description: "Failed to add the book. Please check your inputs and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Book
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new book to the inventory.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Book title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Author name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="originalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Price ($) (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fiction">Fiction</SelectItem>
                        <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                        <SelectItem value="mystery">Mystery & Thriller</SelectItem>
                        <SelectItem value="scifi">Sci-Fi & Fantasy</SelectItem>
                        <SelectItem value="biography">Biography</SelectItem>
                        <SelectItem value="self-help">Self-Help</SelectItem>
                        <SelectItem value="romance">Romance</SelectItem>
                        <SelectItem value="cookbook">Cookbook</SelectItem>
                        <SelectItem value="children">Children</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="thriller">Thriller</SelectItem>
                        <SelectItem value="fantasy">Fantasy</SelectItem>
                        <SelectItem value="poetry">Poetry</SelectItem>
                        <SelectItem value="memoir">Memoir</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in-stock">In Stock</SelectItem>
                        <SelectItem value="low-stock">Low Stock</SelectItem>
                        <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                        <SelectItem value="pre-order">Pre-Order</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="publishedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Published Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={
                        field.value instanceof Date 
                          ? field.value.toISOString().split('T')[0] 
                          : field.value
                      } />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/book-cover.jpg" {...field} />
                    </FormControl>
                    <FormDescription>Enter a URL for the book cover image</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Book description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Book"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
