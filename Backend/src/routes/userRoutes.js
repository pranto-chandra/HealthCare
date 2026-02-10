import express from 'express';
import { getUserProfile, updateUserProfile, getCurrentUser } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Get current logged-in user
router.get('/me', asyncHandler(getCurrentUser));

// Get specific user profile
router.get('/:id', asyncHandler(getUserProfile));

// Update user profile
router.put('/:id', asyncHandler(updateUserProfile));

export default router;
