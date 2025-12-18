/**
 * REFERENCES:
 * - Mongoose Schemas: https://mongoosejs.com/docs/guide.html
 * - Default Values: https://mongoosejs.com/docs/defaults.html
 * - Timestamps: https://mongoosejs.com/docs/timestamps.html
 */

// Import Mongoose library for MongoDB schema and model creation
import mongoose from 'mongoose';

/**
 * User Schema Definition
 * Defines the structure for user documents in the MongoDB database
 * Tracks user information and spending for discount qualification
 */
const UserSchema = new mongoose.Schema({
    // User's full name - used for display and identification
    name: { type: String },
    
    // User's email address - used for login and communication
    // Note: unique is set to false to allow multiple users with same email (for demo purposes)
    email: { type: String, unique: false },
    
    // Total amount spent by the user across all purchases
    // Used to calculate discount eligibility (>€50 = 5%, >€100 = 10%)
    // Defaults to 0 for new users
    totalSpent: { type: Number, default: 0 }
}, { 
    // Automatically adds createdAt and updatedAt timestamps to each document
    timestamps: true 
});

// Create the User model from the schema
// This allows us to interact with the 'users' collection in MongoDB
const User = mongoose.model('User', UserSchema);

// Export the User model for use in other parts of the application
export default User;
