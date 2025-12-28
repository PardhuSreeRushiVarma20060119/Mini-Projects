import request from "supertest";
import { registerRoutes } from "../server/routes";
import { storage } from "../server/storage";
import express, { Express } from "express";
import { Server } from "http";

let app: Express;
let server: Server;

beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    server = await registerRoutes(app);
});

afterAll(async () => {
    server.close();
});

describe("API Endpoints", () => {
    describe("GET /api/books", () => {
        it("should return a list of books", async () => {
            const res = await request(app).get("/api/books");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe("GET /api/books/:id", () => {
        it("should return a single book if it exists", async () => {
            // Assuming at least one book exists or is seeded.
            // If we don't have seeds, we might need to create one first.
            const newBook = {
                title: "Test Book",
                author: "Test Author",
                description: "Test Description",
                price: 19.99,
                stockQuantity: 10,
                coverImage: "https://example.com/cover.jpg",
                genre: "fiction",
                rating: 4.5,
                availability: "in-stock",
                publishedDate: new Date().toISOString()
            };

            const createRes = await request(app).post("/api/books").send(newBook);
            const bookId = createRes.body.id;

            const res = await request(app).get(`/api/books/${bookId}`);
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(bookId);
        });

        it("should return 404 for a non-existent book", async () => {
            const res = await request(app).get("/api/books/999999");
            expect(res.status).toBe(404);
        });
    });

    describe("POST /api/books", () => {
        it("should create a new book", async () => {
            const newBook = {
                title: "Another Test Book",
                author: "Another Author",
                description: "Description",
                price: 29.99,
                stockQuantity: 5,
                coverImage: "https://example.com/cover2.jpg",
                genre: "scifi",
                rating: 4.0,
                availability: "low-stock",
                publishedDate: new Date().toISOString()
            };

            const res = await request(app).post("/api/books").send(newBook);
            if (res.status !== 201) {
                console.log("Create Book Error:", JSON.stringify(res.body, null, 2));
            }
            expect(res.status).toBe(201);
            expect(res.body.title).toBe(newBook.title);
        });

        it("should return 400 for invalid book data", async () => {
            const invalidBook = {
                title: "Invalid Book",
                // missing required fields
            };

            const res = await request(app).post("/api/books").send(invalidBook);
            expect(res.status).toBe(400);
        });
    });
});
