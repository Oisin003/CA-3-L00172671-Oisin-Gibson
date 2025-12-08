import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import Book from '../models/Book.js';

const router = express.Router();

// GET /api/books - list and search
router.get('/', async (req, res) => {
    try {
        const { title, author, category, search } = req.query;
        let filter = {};
        
        // If 'search' parameter is provided, use OR logic to search across all fields
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
            if (title) filter.title = { $regex: title, $options: 'i' };
            if (author) filter.author = { $regex: author, $options: 'i' };
            if (category) filter.category = { $regex: category, $options: 'i' };
        }
        
        const books = await Book.find(filter).sort({ title: 1 });
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/books/:id
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/books - create
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const book = new Book({
            title: data.title || data.Title,
            isbn: data.isbn || data.ISBN,
            author: data.author || data.Author,
            category: data.category || data.Category,
            price: data.price || data.Price,
            numberInStock: data.numberInStock ?? data.NumberInStock ?? 0
        });
        await book.save();
        res.status(201).json(book);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /api/books/:id - update
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const book = await Book.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/books/:id
router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/books/import - import from JSON file (bookstore/books.json)
router.post('/import', async (req, res) => {
    try {
        // Resolve books.json relative to backend folder (../books.json)
        const jsonPath = path.resolve('.', '..', 'books.json');
        const raw = await fs.readFile(jsonPath, 'utf8');
        const arr = JSON.parse(raw);
        const results = [];
        for (const item of arr) {
            const doc = {
                title: item.title || item.Title,
                isbn: item.isbn || item.ISBN,
                author: item.author || item.Author,
                category: item.category || item.Category,
                price: item.price ?? item.Price,
                numberInStock: item.numberInStock ?? item.NumberInStock ?? 0
            };
            // upsert by isbn
            const updated = await Book.findOneAndUpdate({ isbn: doc.isbn }, { $set: doc }, { upsert: true, new: true });
            results.push(updated);
        }
        res.json({ imported: results.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
console.log('Books router loaded');
export default router;
