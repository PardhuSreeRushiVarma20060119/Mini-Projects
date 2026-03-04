import { pgTable, text, serial, integer, boolean, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const genreEnum = pgEnum('genre', [
  'fiction',
  'non-fiction',
  'mystery',
  'scifi',
  'biography',
  'self-help',
  'romance',
  'cookbook',
  'children',
  'history',
  'thriller',
  'fantasy',
  'poetry',
  'memoir'
]);

export const availabilityEnum = pgEnum('availability', [
  'in-stock',
  'low-stock',
  'out-of-stock',
  'pre-order'
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image").notNull(),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  genre: genreEnum("genre").notNull(),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  stockQuantity: integer("stock_quantity").notNull(),
  availability: availabilityEnum("availability").notNull(),
  featured: boolean("featured").default(false),
  newRelease: boolean("new_release").default(false),
  bestSeller: boolean("best_seller").default(false),
  publishedDate: timestamp("published_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  totalAmount: real("total_amount").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: real("price_at_purchase").notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  quantity: integer("quantity").notNull(),
  totalAmount: real("total_amount").notNull(),
  date: timestamp("date").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  demandScore: real("demand_score").notNull(),
  suggestedPrice: real("suggested_price").notNull(),
  marketAverage: real("market_average"),
  demandTrend: text("demand_trend").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBookSchema = createInsertSchema(books, {
  publishedDate: z.coerce.date()
}).omit({
  id: true,
  createdAt: true
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  date: true
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  lastUpdated: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
