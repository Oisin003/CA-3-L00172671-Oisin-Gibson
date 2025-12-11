// Import required dependencies
import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import Book from '../models/Book.js';

// Create Express router for book-related endpoints
const router = express.Router();

/**
 * GET /api/books - List and search books
 * Supports searching across multiple fields or filtering by individual fields
 * Query parameters:
 *   - search: searches across title, author, and category (OR logic)
 *   - title: filter by title only
 *   - author: filter by author only
 *   - category: filter by category only
 */
router.get('/', async (req, res) => {
    try {
        // Extract query parameters from request
        const { title, author, category, search } = req.query;
        let filter = {};
        
        // If 'search' parameter is provided, use OR logic to search across all fields
        // This allows users to search for a term in title, author, or category simultaneously
        if (search) {
            filter = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { author: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } }
                ]
            };
        } else {
            // Otherwise use AND logic for individual field filters
            // Case-insensitive regex matching for partial matches
            if (title) filter.title = { $regex: title, $options: 'i' };
            if (author) filter.author = { $regex: author, $options: 'i' };
            if (category) filter.category = { $regex: category, $options: 'i' };
        }
        
        // Find books matching the filter and sort alphabetically by title
        const books = await Book.find(filter).sort({ title: 1 });
        res.json(books);
    } catch (err) {
        // Return server error if database query fails
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/books/:id - Get a single book by ID
 * Parameters:
 *   - id: MongoDB ObjectId of the book
 */
router.get('/:id', async (req, res) => {
    try {
        // Find book by MongoDB ID
        const book = await Book.findById(req.params.id);
        
        // Return 404 if book doesn't exist
        if (!book) return res.status(404).json({ error: 'Book not found' });
        
        // Return the book data
        res.json(book);
    } catch (err) {
        // Handle invalid ID format or database errors
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/books - Create a new book
 * Request body should contain book data with the following fields:
 *   - title/Title: Book title
 *   - isbn/ISBN: Unique ISBN number
 *   - author/Author: Author name
 *   - category/Category: Book category/genre
 *   - price/Price: Book price
 *   - numberInStock/NumberInStock: Quantity in stock (defaults to 0)
 * Supports both lowercase and capitalized field names for flexibility
 */
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        
        // Create new book instance with normalized field names
        // Accepts both lowercase (frontend format) and capitalized (import format) field names
        const book = new Book({
            title: data.title || data.Title,
            isbn: data.isbn || data.ISBN,
            author: data.author || data.Author,
            category: data.category || data.Category,
            price: data.price || data.Price,
            numberInStock: data.numberInStock ?? data.NumberInStock ?? 0
        });
        
        // Save to database
        await book.save();
        
        // Return created book with 201 status
        res.status(201).json(book);
    } catch (err) {
        // Return validation errors (e.g., duplicate ISBN, missing required fields)
        res.status(400).json({ error: err.message });
    }
});

/**
 * PUT /api/books/:id - Update an existing book
 * Parameters:
 *   - id: MongoDB ObjectId of the book to update
 * Request body should contain fields to update
 */
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        
        // Find and update book in one operation
        // { new: true } returns the updated document instead of the original
        const book = await Book.findByIdAndUpdate(req.params.id, updates, { new: true });
        
        // Return 404 if book doesn't exist
        if (!book) return res.status(404).json({ error: 'Book not found' });
        
        // Return updated book data
        res.json(book);
    } catch (err) {
        // Handle validation errors or invalid updates
        res.status(400).json({ error: err.message });
    }
});

/**
 * DELETE /api/books/:id - Delete a book
 * Parameters:
 *   - id: MongoDB ObjectId of the book to delete
 */
router.delete('/:id', async (req, res) => {
    try {
        // Find and delete book in one operation
        const book = await Book.findByIdAndDelete(req.params.id);
        
        // Return 404 if book doesn't exist
        if (!book) return res.status(404).json({ error: 'Book not found' });
        
        // Return success confirmation
        res.json({ success: true });
    } catch (err) {
        // Handle database errors
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/books/import - Import books from JSON file
 * Reads books.json from the root directory and imports/updates books in the database
 * Uses upsert logic: updates existing books (matched by ISBN) or creates new ones
 * No request body required - reads from books.json file
 */
router.post('/import', async (req, res) => {
    try {
        // Resolve path to books.json in the root directory (one level up from backend)
        const jsonPath = path.resolve('.', '..', 'books.json');
        
        // Read and parse the JSON file
        const raw = await fs.readFile(jsonPath, 'utf8');
        const arr = JSON.parse(raw);
        
        // Track imported books
        const results = [];
        
        // Process each book from the JSON file
        for (const item of arr) {
            // Normalize field names (handle both lowercase and capitalized versions)
            const doc = {
                title: item.title || item.Title,
                isbn: item.isbn || item.ISBN,
                author: item.author || item.Author,
                category: item.category || item.Category,
                price: item.price ?? item.Price,
                numberInStock: item.numberInStock ?? item.NumberInStock ?? 0
            };
            
            // Upsert by ISBN: update if exists, create if doesn't
            // This prevents duplicate books and allows re-importing with updates
            const updated = await Book.findOneAndUpdate(
                { isbn: doc.isbn }, 
                { $set: doc }, 
                { upsert: true, new: true }
            );
            results.push(updated);
        }
        
        // Return count of imported books
        res.json({ imported: results.length });
    } catch (err) {
        // Handle file read errors or database errors
        res.status(500).json({ error: err.message });
    }
});

// Log when router is loaded (useful for debugging)
console.log('Books router loaded');

// Export router for use in main server file
export default router;
