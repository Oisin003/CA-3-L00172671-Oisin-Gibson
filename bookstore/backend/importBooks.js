import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import Book from './models/Book.js';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookstore';

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    const jsonPath = path.resolve('.', '..', 'books.json');
    const raw = await fs.readFile(jsonPath, 'utf8');
    const arr = JSON.parse(raw);
    let count = 0;
    for (const item of arr) {
        const doc = {
            title: item.title || item.Title,
            isbn: item.isbn || item.ISBN,
            author: item.author || item.Author,
            category: item.category || item.Category,
            price: item.price ?? item.Price,
            numberInStock: item.numberInStock ?? item.NumberInStock ?? 0
        };
        await Book.findOneAndUpdate({ isbn: doc.isbn }, { $set: doc }, { upsert: true });
        count++;
    }
    console.log(`Imported ${count} books`);
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
