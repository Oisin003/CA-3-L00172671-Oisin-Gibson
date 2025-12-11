/**
 * Bookstore API Server
 * Main Express.js server file that handles:
 * - Database connection to MongoDB
 * - API route configuration
 * - Auto-import of books from JSON file on startup
 * - CORS and JSON middleware setup
 */

// Import required dependencies
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

// Import route handlers
import booksRouter from './routes/books.js';
import purchasesRouter from './routes/purchases.js';
import usersRouter from './routes/users.js';

// Import models
import Book from './models/Book.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Enable CORS for cross-origin requests from frontend
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// MongoDB connection URI - uses environment variable or defaults to local database
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookstore';

/**
 * Auto-import books from JSON file on startup
 * Only imports if the database is empty to avoid duplicates
 * This ensures the application has initial data without manual import
 */
async function initializeBooks() {
    try {
        // Check if books already exist in database
        const bookCount = await Book.countDocuments();
        if (bookCount > 0) {
            console.log(`Database already has ${bookCount} books. Skipping auto-import.`);
            return;
        }

        // Load books from JSON file (located in parent directory)
        const jsonPath = path.resolve('.', '..', 'books.json');
        const raw = await fs.readFile(jsonPath, 'utf8');
        const arr = JSON.parse(raw);
        
        // Normalize field names from JSON to match Book schema
        // Supports both lowercase and capitalized field names
        const booksToImport = arr.map(item => ({
            title: item.title || item.Title,
            isbn: item.isbn || item.ISBN,
            author: item.author || item.Author,
            category: item.category || item.Category,
            price: item.price ?? item.Price,
            numberInStock: item.numberInStock ?? item.NumberInStock ?? 0
        }));

        // Insert all books at once
        // ordered: false allows partial success if some books have duplicate ISBNs
        const result = await Book.insertMany(booksToImport, { ordered: false });
        console.log(`✓ Auto-imported ${result.length} books from books.json`);
    } catch (err) {
        // Handle duplicate key errors gracefully (11000 = duplicate key error code)
        if (err.code === 11000) {
            console.log('Some books already exist in database.');
        } else {
            console.error('Error auto-importing books:', err.message);
        }
    }
}

// Connect to MongoDB and initialize books
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        // Auto-import books after successful database connection
        await initializeBooks();
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Root endpoint - API health check
app.get('/', (req, res) => {
    res.json({ status: 'Bookstore API', version: '1.0' });
});

// Register API routes
// All book-related endpoints (GET, POST, PUT, DELETE /api/books)
app.use('/api/books', booksRouter);

// All purchase-related endpoints (GET, POST /api/purchases)
app.use('/api/purchases', purchasesRouter);

// All user-related endpoints (POST /api/users/login, GET /api/users/:userId)
app.use('/api/users', usersRouter);

// Start server on specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
