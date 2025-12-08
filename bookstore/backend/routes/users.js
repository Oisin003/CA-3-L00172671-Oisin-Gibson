import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// POST /api/users/login - Login or create user
router.post('/login', async (req, res) => {
    try {
        const { name, email } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Find existing user by email or create new one
        let user = await User.findOne({ email });
        
        if (!user) {
            user = new User({ name, email, totalSpent: 0 });
            await user.save();
        } else {
            // Update name if it changed
            if (user.name !== name) {
                user.name = name;
                await user.save();
            }
        }

        res.json({ 
            success: true, 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                totalSpent: user.totalSpent
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users/:userId - Get user by ID
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            totalSpent: user.totalSpent
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
