import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBookSchema } from "@shared/schema";
import { predictOptimalPrice } from "../client/src/lib/ai";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const router = express.Router();

  // Book Endpoints
  router.get("/books", async (req, res) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  router.get("/books/filter", async (req, res) => {
    try {
      const query = req.query as Record<string, string>;

      const filters: any = {};

      if (query.search) filters.search = query.search;
      if (query.minPrice) filters.minPrice = parseFloat(query.minPrice);
      if (query.maxPrice) filters.maxPrice = parseFloat(query.maxPrice);
      if (query.genres) filters.genres = query.genres.split(',');
      if (query.availability) filters.availability = query.availability.split(',');
      if (query.featured) filters.featured = query.featured === 'true';
      if (query.newRelease) filters.newRelease = query.newRelease === 'true';
      if (query.bestSeller) filters.bestSeller = query.bestSeller === 'true';

      const books = await storage.getBooksByFilter(filters);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter books" });
    }
  });

  router.get("/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBook(id);

      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  router.post("/books", async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  router.put("/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bookData = req.body;

      const book = await storage.updateBook(id, bookData);

      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  router.delete("/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBook(id);

      if (!success) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Analytics Endpoints
  router.get("/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  router.get("/analytics/book/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analytics = await storage.getAnalyticsByBookId(id);

      if (!analytics) {
        return res.status(404).json({ message: "Analytics not found for this book" });
      }

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book analytics" });
    }
  });

  // Sales Endpoints
  router.get("/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();

      // Group sales by date for chart data
      const salesByDate = sales.reduce((acc, sale) => {
        const dateStr = sale.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];

        if (!acc[dateStr]) {
          acc[dateStr] = {
            date: dateStr,
            totalQuantity: 0,
            totalAmount: 0
          };
        }

        acc[dateStr].totalQuantity += Number(sale.quantity);
        acc[dateStr].totalAmount += Number(sale.totalAmount);

        return acc;
      }, {} as Record<string, { date: string, totalQuantity: number, totalAmount: number }>);

      const chartData = Object.values(salesByDate).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      res.json({
        sales,
        chartData
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales data" });
    }
  });

  // Category Distribution Endpoint
  router.get("/category-distribution", async (req, res) => {
    try {
      const books = await storage.getBooks();
      const sales = await storage.getSales();

      // Get sales by book ID
      const salesByBookId = sales.reduce((acc, sale) => {
        if (!acc[sale.bookId]) {
          acc[sale.bookId] = 0;
        }
        acc[sale.bookId] += Number(sale.quantity);
        return acc;
      }, {} as Record<number, number>);

      // Calculate distribution by genre
      const distribution = books.reduce((acc, book) => {
        const genre = book.genre;

        if (!acc[genre]) {
          acc[genre] = {
            genre,
            bookCount: 0,
            totalSales: 0
          };
        }

        acc[genre].bookCount += 1;
        acc[genre].totalSales += salesByBookId[book.id] || 0;

        return acc;
      }, {} as Record<string, { genre: string, bookCount: number, totalSales: number }>);

      res.json({
        bySales: Object.values(distribution).sort((a, b) => b.totalSales - a.totalSales),
        byInventory: Object.values(distribution).sort((a, b) => b.bookCount - a.bookCount)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category distribution" });
    }
  });

  // Orders and Cart Endpoints
  router.post("/orders", async (req, res) => {
    try {
      const { orderData, orderItems } = req.body;

      // Create the order
      const order = await storage.createOrder(orderData);

      // Create order items
      for (const item of orderItems) {
        await storage.createOrderItem({
          orderId: order.id,
          bookId: item.bookId,
          quantity: item.quantity,
          priceAtPurchase: item.price
        });
      }

      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Dynamic Price Analysis and Adjustment
  router.post("/books/analyze-prices", async (req, res) => {
    try {
      const books = await storage.getBooks();
      const sales = await storage.getSales();
      const analytics = await storage.getAnalytics();

      // Build a map of book sales history by bookId
      const salesByBookId: Record<number, number[]> = {};
      books.forEach(book => {
        salesByBookId[book.id] = [];
      });

      // Group sales by date and book
      const salesByDate = sales.reduce((acc, sale) => {
        const dateStr = sale.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];

        if (!acc[dateStr]) {
          acc[dateStr] = {};
        }

        if (!acc[dateStr][sale.bookId]) {
          acc[dateStr][sale.bookId] = 0;
        }

        acc[dateStr][sale.bookId] += Number(sale.quantity);
        return acc;
      }, {} as Record<string, Record<number, number>>);

      // Sort dates and create sales history arrays
      const sortedDates = Object.keys(salesByDate).sort();

      // Populate sales history for each book
      sortedDates.forEach(date => {
        const dailySales = salesByDate[date];
        Object.keys(dailySales).forEach(bookIdStr => {
          const bookId = parseInt(bookIdStr);
          if (salesByBookId[bookId]) {
            salesByBookId[bookId].push(dailySales[bookId]);
          }
        });
      });

      // Calculate market averages for each genre
      const marketAverageByGenre: Record<string, number> = {};
      const genreBookCounts: Record<string, number> = {};

      books.forEach(book => {
        if (!marketAverageByGenre[book.genre]) {
          marketAverageByGenre[book.genre] = 0;
          genreBookCounts[book.genre] = 0;
        }

        marketAverageByGenre[book.genre] += Number(book.price);
        genreBookCounts[book.genre] += 1;
      });

      // Calculate the average price for each genre
      Object.keys(marketAverageByGenre).forEach(genre => {
        marketAverageByGenre[genre] = marketAverageByGenre[genre] / genreBookCounts[genre];
      });

      // Generate price suggestions for each book
      const priceSuggestions = books.map(book => {
        // Get or generate sales history (ensure we have some data even for new books)
        const salesHistory = salesByBookId[book.id].length > 0
          ? salesByBookId[book.id]
          : [0, 0, 0]; // default history for new books

        // Calculate market average for the book's genre
        const marketAverage = marketAverageByGenre[book.genre] || Number(book.price);

        // Prepare data for AI analysis
        const bookData = {
          id: book.id,
          price: Number(book.price),
          stockQuantity: book.stockQuantity,
          rating: book.rating ? Number(book.rating) : 0,
          salesHistory,
          marketAverage
        };

        // Get price suggestion using our AI model
        const priceSuggestion = predictOptimalPrice(bookData);

        return {
          id: book.id,
          title: book.title,
          author: book.author,
          genre: book.genre,
          currentPrice: Number(book.price),
          marketAverage,
          suggestedPrice: priceSuggestion.suggestedPrice,
          percentChange: priceSuggestion.percentChange,
          demandTrend: priceSuggestion.demandTrend,
          competitivePosition: priceSuggestion.competitivePosition,
          elasticityFactor: priceSuggestion.elasticityFactor,
          salesData: salesHistory
        };
      });

      res.json({
        priceAnalysis: priceSuggestions,
        marketAverages: marketAverageByGenre
      });
    } catch (error) {
      console.error('Error analyzing prices:', error);
      res.status(500).json({ message: "Failed to analyze book prices" });
    }
  });

  // Update all prices based on dynamic analysis
  router.post("/books/update-prices", async (req, res) => {
    try {
      const { priceUpdates } = req.body;

      if (!Array.isArray(priceUpdates)) {
        return res.status(400).json({ message: "Invalid price updates format" });
      }

      const results = [];

      // Apply all price updates
      for (const update of priceUpdates) {
        if (!update.id || typeof update.newPrice !== 'number') {
          continue;
        }

        const book = await storage.updateBook(update.id, { price: update.newPrice });
        if (book) {
          results.push({
            id: book.id,
            title: book.title,
            oldPrice: update.oldPrice,
            newPrice: Number(book.price),
            percentChange: ((Number(book.price) - update.oldPrice) / update.oldPrice) * 100
          });
        }
      }

      res.json({
        success: true,
        updatedBooks: results,
        message: `Successfully updated prices for ${results.length} books`
      });
    } catch (error) {
      console.error('Error updating prices:', error);
      res.status(500).json({ message: "Failed to update book prices" });
    }
  });

  // Register the router with a prefix
  app.use("/api", router);

  return httpServer;
}
