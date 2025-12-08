import express from 'express';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';

const router = express.Router();

// GET /api/purchases/user/:userId - Get all purchases for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const purchases = await Purchase.find({ user: userId })
            .populate('book')
            .sort({ createdAt: -1 });
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/purchases/cart/:userId - Get cart items (unpaid purchases) for a user
router.get('/cart/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // For now, return all purchases since we don't have a 'paid' flag
        // In a real app, you'd filter by status
        const purchases = await Purchase.find({ user: userId })
            .populate('book')
            .sort({ createdAt: -1 })
            .limit(10); // Get recent items
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/purchases
// body: { bookId, quantity, userId, name, email }
router.post('/', async (req, res) => {
    try {
        const { bookId, quantity, userId, name, email } = req.body;
        const qty = parseInt(quantity, 10);
        if (!bookId || !qty || qty < 1 || qty > 5) {
            return res.status(400).json({ error: 'Invalid bookId or quantity (1-5 allowed)' });
        }

        // Atomically decrement stock if available
        const book = await Book.findOneAndUpdate(
            { _id: bookId, numberInStock: { $gte: qty } },
            { $inc: { numberInStock: -qty } },
            { new: true }
        );
        if (!book) return res.status(400).json({ error: 'Not enough stock' });

        // Find or create user
        let user = null;
        if (userId) user = await User.findById(userId);
        if (!user && email) user = await User.findOne({ email });
        if (!user) {
            user = new User({ name: name || 'Guest', email: email || undefined });
        }

        // Determine discount eligibility: user gets 5% off if previous totalSpent > 150
        const wasEligible = user.totalSpent > 150;
        const itemTotal = book.price * qty;
        const discountRate = wasEligible ? 0.05 : 0;
        const totalPrice = Math.round((itemTotal * (1 - discountRate)) * 100) / 100;

        // Create purchase record
        const purchase = new Purchase({
            user: user._id,
            book: book._id,
            quantity: qty,
            totalPrice,
            discountApplied: discountRate
        });

        // Update user's totalSpent and save
        user.totalSpent = (user.totalSpent || 0) + totalPrice;
        await user.save();
        await purchase.save();

        res.json({ success: true, purchase, newStock: book.numberInStock, userTotalSpent: user.totalSpent });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
