import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import booksRouter from './routes/books.js';
import purchasesRouter from './routes/purchases.js';
import usersRouter from './routes/users.js';
import Book from './models/Book.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookstore';

// Auto-import books from JSON file on startup
async function initializeBooks() {
    try {
        // Check if books already exist in database
        const bookCount = await Book.countDocuments();
        if (bookCount > 0) {
            console.log(`Database already has ${bookCount} books. Skipping auto-import.`);
            return;
        }

        // Load books from JSON file
        const jsonPath = path.resolve('.', '..', 'books.json');
        const raw = await fs.readFile(jsonPath, 'utf8');
        const arr = JSON.parse(raw);
        
        const booksToImport = arr.map(item => ({
            title: item.title || item.Title,
            isbn: item.isbn || item.ISBN,
            author: item.author || item.Author,
            category: item.category || item.Category,
            price: item.price ?? item.Price,
            numberInStock: item.numberInStock ?? item.NumberInStock ?? 0
        }));

        // Insert all books
        const result = await Book.insertMany(booksToImport, { ordered: false });
        console.log(`✓ Auto-imported ${result.length} books from books.json`);
    } catch (err) {
        if (err.code === 11000) {
            // Duplicate key error - some books already exist
            console.log('Some books already exist in database.');
        } else {
            console.error('Error auto-importing books:', err.message);
        }
    }
}

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        await initializeBooks();
    })
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.json({ status: 'Bookstore API', version: '1.0' });
});

app.use('/api/books', booksRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/users', usersRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
