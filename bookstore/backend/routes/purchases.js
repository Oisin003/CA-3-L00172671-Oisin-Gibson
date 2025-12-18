/**
 * REFERENCES:
 * - Express Router: https://expressjs.com/en/guide/routing.html
 * - Mongoose populate: https://mongoosejs.com/docs/populate.html
 * - MongoDB Transactions: https://www.mongodb.com/docs/manual/core/transactions/
 * - Shopping Cart Patterns: https://www.patterns.dev/posts/shopping-cart-pattern
 */

// Import required dependencies
import express from 'express';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';

// Create Express router for purchase-related endpoints
const router = express.Router();

/**
 * GET /api/purchases/user/:userId - Get all purchases for a specific user
 * Returns purchase history sorted by most recent first
 * Parameters:
 *   - userId: MongoDB ObjectId of the user
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find all purchases for this user
        // populate('book') replaces the book ID with the full book document
        // Sort by createdAt descending to show newest purchases first
        const purchases = await Purchase.find({ user: userId })
            .populate('book')
            .sort({ createdAt: -1 });
        
        res.json(purchases);
    } catch (err) {
        // Handle database errors
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/purchases/cart/:userId - Get cart items for a user
 * Returns recent purchases (simulating a shopping cart)
 * Note: In a real app, this would filter by paid/unpaid status
 * Parameters:
 *   - userId: MongoDB ObjectId of the user
 */
router.get('/cart/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // For now, return all purchases since we don't have a 'paid' flag
        // In a real app, you'd filter by status (e.g., { user: userId, paid: false })
        // Limit to 10 most recent items to simulate an active cart
        const purchases = await Purchase.find({ user: userId })
            .populate('book')
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json(purchases);
    } catch (err) {
        // Handle database errors
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/purchases - Create a new purchase (add to cart)
 * Handles stock management, user creation, and discount calculation
 * Request body:
 *   - bookId: MongoDB ObjectId of the book to purchase
 *   - quantity: Number of copies (1-5)
 *   - userId: Optional - existing user ID
 *   - name: User's name (for new users)
 *   - email: User's email (for finding/creating users)
 * 
 * Discount logic:
 *   - Users with totalSpent > €150 get 5% off their next purchase
 */
router.post('/', async (req, res) => {
    try {
        // Extract purchase details from request body
        const { bookId, quantity, userId, name, email } = req.body;
        
        // Parse and validate quantity (must be between 1 and 5)
        const qty = parseInt(quantity, 10);
        if (!bookId || !qty || qty < 1 || qty > 5) {
            return res.status(400).json({ error: 'Invalid bookId or quantity (1-5 allowed)' });
        }

        // Atomically decrement stock if available
        // This prevents race conditions where multiple users try to buy the last copy
        // Only updates if current stock >= requested quantity
        const book = await Book.findOneAndUpdate(
            { _id: bookId, numberInStock: { $gte: qty } },
            { $inc: { numberInStock: -qty } },
            { new: true }
        );
        
        // If book wasn't found or stock was insufficient, return error
        if (!book) return res.status(400).json({ error: 'Not enough stock' });

        // Find or create user
        // Priority: 1) Find by userId, 2) Find by email, 3) Create new user
        let user = null;
        if (userId) user = await User.findById(userId);
        if (!user && email) user = await User.findOne({ email });
        if (!user) {
            user = new User({ name: name || 'Guest', email: email || undefined });
        }

        // Determine discount eligibility based on PREVIOUS spending
        // User gets 5% off if their totalSpent is already > €150
        const wasEligible = user.totalSpent > 150;
        const itemTotal = book.price * qty;
        const discountRate = wasEligible ? 0.05 : 0;// ? means if true : else
        
        // Calculate final price with discount applied
        // Round to 2 decimal places to avoid floating point errors
        const totalPrice = Math.round((itemTotal * (1 - discountRate)) * 100) / 100;

        // Create purchase record with all transaction details
        const purchase = new Purchase({
            user: user._id,
            book: book._id,
            quantity: qty,
            totalPrice,
            discountApplied: discountRate
        });

        // Update user's lifetime spending total
        // This will affect discount eligibility for NEXT purchase
        user.totalSpent = (user.totalSpent || 0) + totalPrice;
        
        // Save both user and purchase to database
        await user.save();
        await purchase.save();

        // Return success response with purchase details and updated values
        res.json({ 
            success: true, 
            purchase, 
            newStock: book.numberInStock, 
            userTotalSpent: user.totalSpent 
        });
    } catch (err) {
        // Handle validation errors or database errors
        res.status(500).json({ error: err.message });
    }
});

// Export router for use in main server file
export default router;
