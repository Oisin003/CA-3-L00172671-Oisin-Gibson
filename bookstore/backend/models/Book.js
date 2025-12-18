// Oisin Gibson - L00172671
// Book model for MongoDB database

/**
 * REFERENCES:
 * - Mongoose Schemas: https://mongoosejs.com/docs/guide.html
 * - Schema Types: https://mongoosejs.com/docs/schematypes.html
 * - Mongoose Models: https://mongoosejs.com/docs/models.html
 */

import mongoose from 'mongoose';

// Define the schema for Book documents
// Reference: https://mongoosejs.com/docs/guide.html
const BookSchema = new mongoose.Schema({
    // Book title - required field
    title: { type: String, required: true },
    // ISBN (International Standard Book Number) - required and must be unique
    isbn: { type: String, required: true, unique: true },
    // Author name - required field
    author: { type: String, required: true },
    // Book category/genre - optional field
    category: { type: String },
    // Price in euros - required field
    price: { type: Number, required: true },
    // Number of books available in stock - required, defaults to 0
    numberInStock: { type: Number, required: true, default: 0 }
}, { 
    // Automatically add createdAt and updatedAt timestamp fields
    timestamps: true 
});

// Create the Book model from the schema
const Book = mongoose.model('Book', BookSchema);

export default Book;
