import {
  InsertUser, User, InsertBook, Book, InsertOrder, Order,
  InsertOrderItem, OrderItem, InsertSale, Sale, InsertAnalytics, Analytics
} from "@shared/schema";

export interface IStorage {
  // User Methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Book Methods
  getBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  getBooksByFilter(filters: BookFilters): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;

  // Order Methods
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;

  // OrderItem Methods
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Sales Methods
  getSales(): Promise<Sale[]>;
  getSalesByBookId(bookId: number): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;

  // Analytics Methods
  getAnalytics(): Promise<Analytics[]>;
  getAnalyticsByBookId(bookId: number): Promise<Analytics | undefined>;
  createOrUpdateAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
}

export interface BookFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  genres?: string[];
  availability?: string[];
  featured?: boolean;
  newRelease?: boolean;
  bestSeller?: boolean;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private books: Map<number, Book>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private sales: Map<number, Sale>;
  private analytics: Map<number, Analytics>;
  private currentIds: {
    user: number;
    book: number;
    order: number;
    orderItem: number;
    sale: number;
    analytics: number;
  };

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.sales = new Map();
    this.analytics = new Map();
    this.currentIds = {
      user: 1,
      book: 1,
      order: 1,
      orderItem: 1,
      sale: 1,
      analytics: 1
    };

    // Seed books data
    this.seedBooks();
    // Calculate analytics for the books
    this.seedAnalytics();
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Book Methods
  async getBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBooksByFilter(filters: BookFilters): Promise<Book[]> {
    let filteredBooks = Array.from(this.books.values());

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredBooks = filteredBooks.filter(book =>
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower)
      );
    }

    if (filters.minPrice !== undefined) {
      filteredBooks = filteredBooks.filter(book => Number(book.price) >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filteredBooks = filteredBooks.filter(book => Number(book.price) <= filters.maxPrice!);
    }

    if (filters.genres && filters.genres.length > 0) {
      filteredBooks = filteredBooks.filter(book => filters.genres!.includes(book.genre));
    }

    if (filters.availability && filters.availability.length > 0) {
      filteredBooks = filteredBooks.filter(book => filters.availability!.includes(book.availability));
    }

    if (filters.featured !== undefined) {
      filteredBooks = filteredBooks.filter(book => book.featured === filters.featured);
    }

    if (filters.newRelease !== undefined) {
      filteredBooks = filteredBooks.filter(book => book.newRelease === filters.newRelease);
    }

    if (filters.bestSeller !== undefined) {
      filteredBooks = filteredBooks.filter(book => book.bestSeller === filters.bestSeller);
    }

    return filteredBooks;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const id = this.currentIds.book++;
    const createdAt = new Date();
    const newBook: Book = {
      ...book,
      id,
      createdAt,
      originalPrice: book.originalPrice ?? null,
      reviewCount: book.reviewCount ?? 0,
      featured: book.featured ?? false,
      newRelease: book.newRelease ?? false,
      bestSeller: book.bestSeller ?? false,
      rating: book.rating ?? 0
    };
    this.books.set(id, newBook);
    return newBook;
  }

  async updateBook(id: number, bookUpdate: Partial<InsertBook>): Promise<Book | undefined> {
    const book = this.books.get(id);
    if (!book) return undefined;

    const updatedBook = { ...book, ...bookUpdate };
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: number): Promise<boolean> {
    return this.books.delete(id);
  }

  // Order Methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentIds.order++;
    const createdAt = new Date();
    const newOrder: Order = {
      ...order,
      id,
      createdAt,
      userId: order.userId ?? null,
      status: order.status ?? "pending"
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  // OrderItem Methods
  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentIds.orderItem++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);

    // Also create a sale record
    const book = await this.getBook(orderItem.bookId);
    if (book) {
      await this.createSale({
        bookId: orderItem.bookId,
        quantity: orderItem.quantity,
        totalAmount: orderItem.quantity * Number(orderItem.priceAtPurchase)
      });
    }

    return newOrderItem;
  }

  // Sales Methods
  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async getSalesByBookId(bookId: number): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter(
      (sale) => sale.bookId === bookId
    );
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const id = this.currentIds.sale++;
    const date = new Date();
    const newSale: Sale = { ...sale, id, date };
    this.sales.set(id, newSale);

    // Update analytics after a sale
    await this.updateAnalyticsAfterSale(sale.bookId);

    return newSale;
  }

  // Analytics Methods
  async getAnalytics(): Promise<Analytics[]> {
    return Array.from(this.analytics.values());
  }

  async getAnalyticsByBookId(bookId: number): Promise<Analytics | undefined> {
    return Array.from(this.analytics.values()).find(
      (analytics) => analytics.bookId === bookId
    );
  }

  async createOrUpdateAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const existing = await this.getAnalyticsByBookId(analyticsData.bookId);

    if (existing) {
      const updatedAnalytics: Analytics = {
        ...existing,
        ...analyticsData,
        lastUpdated: new Date(),
        marketAverage: analyticsData.marketAverage ?? existing.marketAverage
      };
      this.analytics.set(existing.id, updatedAnalytics);
      return updatedAnalytics;
    } else {
      const id = this.currentIds.analytics++;
      const lastUpdated = new Date();
      const newAnalytics: Analytics = {
        ...analyticsData,
        id,
        lastUpdated,
        marketAverage: analyticsData.marketAverage ?? null
      };
      this.analytics.set(id, newAnalytics);
      return newAnalytics;
    }
  }

  // Helper to update analytics after a sale
  private async updateAnalyticsAfterSale(bookId: number): Promise<void> {
    const book = await this.getBook(bookId);
    if (!book) return;

    const sales = await this.getSalesByBookId(bookId);
    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.quantity), 0);

    // Simple AI logic for demand and pricing
    let demandScore = Math.min(10, (totalSales / 5) + (Number(book.rating) / 2));
    let demandTrend = totalSales > 20 ? "rising" : totalSales > 10 ? "stable" : "falling";

    // Pricing logic
    let priceMultiplier = 1.0;
    if (demandTrend === "rising") priceMultiplier = 1.1;
    if (demandTrend === "falling") priceMultiplier = 0.9;

    const suggestedPrice = Number(book.price) * priceMultiplier;
    const marketAverage = Number(book.price) * (0.9 + Math.random() * 0.3); // simulated market average

    await this.createOrUpdateAnalytics({
      bookId,
      demandScore,
      suggestedPrice,
      marketAverage,
      demandTrend
    });
  }

  // Seed data for testing
  private seedBooks(): void {
    const books: InsertBook[] = [
      {
        title: "The Silent Patient",
        author: "Alex Michaelides",
        description: "A woman shoots her husband five times and then never speaks another word.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: 16.99,
        originalPrice: 24.99,
        genre: "thriller",
        rating: 4.8,
        reviewCount: 423,
        stockQuantity: 45,
        availability: "in-stock",
        featured: true,
        newRelease: false,
        bestSeller: true,
        publishedDate: new Date("2019-02-05")
      },
      {
        title: "Educated: A Memoir",
        author: "Tara Westover",
        description: "A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
        coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: 14.95,
        originalPrice: 14.95,
        genre: "memoir",
        rating: 4.9,
        reviewCount: 567,
        stockQuantity: 12,
        availability: "low-stock",
        featured: true,
        newRelease: false,
        bestSeller: true,
        publishedDate: new Date("2018-02-20")
      },
      {
        title: "Where the Crawdads Sing",
        author: "Delia Owens",
        description: "A novel about an abandoned girl who raised herself in the marshes of the deep South.",
        coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: 22.99,
        originalPrice: 27.99,
        genre: "fiction",
        rating: 4.1,
        reviewCount: 345,
        stockQuantity: 0,
        availability: "pre-order",
        featured: false,
        newRelease: true,
        bestSeller: false,
        publishedDate: new Date("2023-05-30")
      },
      {
        title: "Atomic Habits",
        author: "James Clear",
        description: "A revolutionary system to get 1 percent better every day.",
        coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: 19.99,
        originalPrice: 19.99,
        genre: "self-help",
        rating: 4.7,
        reviewCount: 689,
        stockQuantity: 78,
        availability: "in-stock",
        featured: true,
        newRelease: false,
        bestSeller: true,
        publishedDate: new Date("2018-10-16")
      },
      {
        title: "Becoming",
        author: "Michelle Obama",
        description: "A memoir by the former First Lady of the United States.",
        coverImage: "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: 28.50,
        originalPrice: 32.99,
        genre: "biography",
        rating: 4.9,
        reviewCount: 723,
        stockQuantity: 26,
        availability: "in-stock",
        featured: true,
        newRelease: false,
        bestSeller: true,
        publishedDate: new Date("2018-11-13")
      },
      {
        title: "The Alchemist",
        author: "Paulo Coelho",
        description: "A fable about following your dream.",
        coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: 11.99,
        originalPrice: 11.99,
        genre: "fiction",
        rating: 4.2,
        reviewCount: 542,
        stockQuantity: 10,
        availability: "low-stock",
        featured: false,
        newRelease: false,
        bestSeller: false,
        publishedDate: new Date("1988-01-01")
      },
      {
        title: "The Four Winds",
        author: "Kristin Hannah",
        description: "A story of love, heroism and hope, set during the Great Depression.",
        coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: 25.99,
        originalPrice: 29.99,
        genre: "fiction",
        rating: 4.5,
        reviewCount: 312,
        stockQuantity: 35,
        availability: "in-stock",
        featured: false,
        newRelease: true,
        bestSeller: false,
        publishedDate: new Date("2021-02-02")
      },
      {
        title: "Project Hail Mary",
        author: "Andy Weir",
        description: "A novel about a lone astronaut who must save the earth from a disaster.",
        coverImage: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: 24.99,
        originalPrice: 24.99,
        genre: "scifi",
        rating: 4.8,
        reviewCount: 256,
        stockQuantity: 48,
        availability: "in-stock",
        featured: false,
        newRelease: true,
        bestSeller: true,
        publishedDate: new Date("2021-05-04")
      },
      {
        title: "Klara and the Sun",
        author: "Kazuo Ishiguro",
        description: "A story that looks at our changing world through the eyes of an unforgettable narrator.",
        coverImage: "https://images.unsplash.com/photo-1544947987-ddb6b721c3f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: 23.49,
        originalPrice: 27.99,
        genre: "fiction",
        rating: 4.3,
        reviewCount: 187,
        stockQuantity: 18,
        availability: "in-stock",
        featured: false,
        newRelease: true,
        bestSeller: false,
        publishedDate: new Date("2021-03-02")
      },
      {
        title: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        description: "A groundbreaking narrative of humanity's creation and evolution.",
        coverImage: "https://images.unsplash.com/photo-1565770683786-84128aa546f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: 17.99,
        originalPrice: 19.99,
        genre: "non-fiction",
        rating: 4.6,
        reviewCount: 598,
        stockQuantity: 63,
        availability: "in-stock",
        featured: false,
        newRelease: false,
        bestSeller: true,
        publishedDate: new Date("2015-02-10")
      },
      {
        title: "The Midnight Library",
        author: "Matt Haig",
        description: "Between life and death there is a library, and within that library, the shelves go on forever.",
        coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: 18.99,
        originalPrice: 22.99,
        genre: "fiction",
        rating: 4.4,
        reviewCount: 267,
        stockQuantity: 27,
        availability: "in-stock",
        featured: true,
        newRelease: false,
        bestSeller: true,
        publishedDate: new Date("2020-09-29")
      },
      {
        title: "The Hill We Climb",
        author: "Amanda Gorman",
        description: "The poem that captivated a nation during the presidential inauguration.",
        coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: 9.99,
        originalPrice: 12.99,
        genre: "poetry",
        rating: 4.9,
        reviewCount: 145,
        stockQuantity: 5,
        availability: "low-stock",
        featured: false,
        newRelease: true,
        bestSeller: false,
        publishedDate: new Date("2021-03-30")
      }
    ];

    books.forEach(book => {
      this.createBook(book);
    });
  }

  private seedAnalytics(): void {
    // For each book, create initial analytics
    this.books.forEach(book => {
      const bookSales = Math.floor(Math.random() * 50); // Random sales between 0-50

      const demandScore = Math.min(10, (bookSales / 5) + (Number(book.rating) / 2));
      let demandTrend: string;

      if (demandScore > 7) demandTrend = "rising";
      else if (demandScore > 4) demandTrend = "stable";
      else demandTrend = "falling";

      // Pricing logic
      let priceMultiplier = 1.0;
      if (demandTrend === "rising") priceMultiplier = 1.17;
      if (demandTrend === "falling") priceMultiplier = 0.83;

      const suggestedPrice = Number(book.price) * priceMultiplier;
      const marketAverage = Number(book.price) * (0.9 + Math.random() * 0.3); // simulated market average

      this.createOrUpdateAnalytics({
        bookId: book.id,
        demandScore,
        suggestedPrice,
        marketAverage,
        demandTrend
      });

      // Create some sample sales for each book
      for (let i = 0; i < bookSales; i++) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const totalAmount = quantity * Number(book.price);
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date in the last 30 days

        const id = this.currentIds.sale++;
        const sale: Sale = {
          id,
          bookId: book.id,
          quantity,
          totalAmount,
          date
        };

        this.sales.set(id, sale);
      }
    });
  }
}

export const storage = new MemStorage();
