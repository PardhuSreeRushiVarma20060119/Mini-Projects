# BookSphere

BookSphere is a modern, full-stack online book store application built with React, TypeScript, and Express. It features a responsive UI, real-time analytics for admins, and a seamless shopping experience for users.

## Features

-   **Browse Books:** Filter by genre, view new releases, and best sellers.
-   **Book Details:** Detailed view with reviews, pricing, and stock availability.
-   **Shopping Cart:** Add items to cart and view summary.
-   **Admin Dashboard:**
    -   **Inventory Management:** Track stock levels.
    -   **Analytics:** View sales trends, demand scores, and category distribution.
    -   **Price Analysis:** Automated price suggestions based on market data.
-   **Responsive Design:** Optimized for desktop and mobile devices.

## Tech Stack

-   **Frontend:** React, TypeScript, Tailwind CSS, Shadcn UI, Wouter (Routing), TanStack Query.
-   **Backend:** Node.js, Express.
-   **Database:** PostgreSQL with Drizzle ORM.
-   **Testing:** Jest, Supertest.

## Getting Started

### Prerequisites

-   Node.js (v20 or later)
-   npm

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

### Running Tests

Execute the integration test suite:

```bash
npm test
```

## Project Structure

-   `client/`: Frontend React application.
-   `server/`: Backend Express server and API routes.
-   `shared/`: Shared TypeScript schemas and types.
-   `tests/`: Integration tests.
