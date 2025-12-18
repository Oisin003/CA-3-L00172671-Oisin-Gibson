// Oisin Gibson - L00172671
// Purchase model for MongoDB database - handles cart items and completed purchases

/**
 * REFERENCES:
 * - Mongoose Schemas: https://mongoosejs.com/docs/guide.html
 * - Schema References: https://mongoosejs.com/docs/populate.html
 * - ObjectId Type: https://mongoosejs.com/docs/schematypes.html#objectids
 */

import mongoose from 'mongoose';

// Define the schema for Purchase documents
// Uses references to User and Book models for relational data
const PurchaseSchema = new mongoose.Schema({
    // Reference to the User who made the purchase
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Reference to the Book being purchased
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    // Number of books purchased
    quantity: { type: Number, required: true },
    // Total price for this purchase (quantity × book price)
    totalPrice: { type: Number, required: true },
    // Discount percentage applied (e.g., 0.05 for 5% discount)
    discountApplied: { type: Number, default: 0 }
}, { 
    // Automatically add createdAt and updatedAt timestamp fields
    timestamps: true 
});

// Create the Purchase model from the schema
const Purchase = mongoose.model('Purchase', PurchaseSchema);

// Log when the model is loaded (useful for debugging)
console.log('Purchase model loaded');

export default Purchase;
