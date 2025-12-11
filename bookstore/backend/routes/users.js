// Import required dependencies
import express from 'express';
import User from '../models/User.js';

// Create Express router for user-related endpoints
const router = express.Router();

/**
 * POST /api/users/login - Login or create user
 * Handles user authentication by finding existing users or creating new ones
 * Request body:
 *   - name: User's full name
 *   - email: User's email address
 * Returns the user object with ID, name, email, and totalSpent
 */
router.post('/login', async (req, res) => {
    try {
        // Extract user credentials from request body
        const { name, email } = req.body;
        
        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Find existing user by email or create new one
        // This implements a "login or register" pattern for simplicity
        let user = await User.findOne({ email });
        
        if (!user) {
            // Create new user with default totalSpent of 0
            user = new User({ name, email, totalSpent: 0 });
            await user.save();
        } else {
            // Update name if it changed (allows users to update their display name)
            if (user.name !== name) {
                user.name = name;
                await user.save();
            }
        }

        // Return success response with user data
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
        // Handle database errors
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/users/:userId - Get user by ID
 * Retrieves a specific user's information
 * Parameters:
 *   - userId: MongoDB ObjectId of the user
 * Returns user object with ID, name, email, and totalSpent
 */
router.get('/:userId', async (req, res) => {
    try {
        // Extract userId from URL parameters
        const { userId } = req.params;
        
        // Find user by MongoDB ID
        const user = await User.findById(userId);
        
        // Return 404 if user doesn't exist
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user data (excluding sensitive information if any)
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            totalSpent: user.totalSpent
        });
    } catch (err) {
        // Handle invalid ID format or database errors
        res.status(500).json({ error: err.message });
    }
});

// Export router for use in main server file
export default router;
