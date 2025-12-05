// Import required packages
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import Book from './models/Book.js';

// Load environment variables from .env file
dotenv.config();

// Get MongoDB connection string from .env or use default
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookstore';

async function main() {
    // Connect to MongoDB database
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Build path to books.json file (one folder up from backend)
    const jsonPath = path.resolve('.', '..', 'books.json');
    
    // Read the JSON file as text
    const fileContent = await fs.readFile(jsonPath, 'utf8');
    
    // Convert JSON text to JavaScript array
    const books = JSON.parse(fileContent);
    
    let count = 0;
    
    // Loop through each book in the array
    for (const book of books) {
        // Create book object (handles both camelCase and TitleCase field names)
        const bookData = {
            title: book.title || book.Title,
            isbn: book.isbn || book.ISBN,
            author: book.author || book.Author,
            category: book.category || book.Category,
            price: book.price || book.Price,
            numberInStock: book.numberInStock || book.NumberInStock || 0
        };
        
        // Insert or update book in database based on ISBN
        // If ISBN exists, update it; if not, create new book
        await Book.findOneAndUpdate(
            { isbn: bookData.isbn },  // Find by ISBN
            { $set: bookData },        // Update with new data
            { upsert: true }           // Create if doesn't exist
        );
        
        count++;
    }
    
    console.log(`Imported ${count} books`);
    process.exit(0);
}

// Run the import and handle any errors
main().catch(err => {
    console.error(err);
    process.exit(1);// Exit with failure code
});
