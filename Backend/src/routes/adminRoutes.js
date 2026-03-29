import express from 'express';
import {
  getAllUsers,
  createUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAnalytics,
  manageHospitalDetails
} from '../controllers/adminController.js';
import { adminValidation, validate } from '../utils/validation.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All admin routes require authentication
router.use(authorize('ADMIN')); // Only admins can access these routes

router.get('/users', getAllUsers);
router.post('/users', adminValidation.createUser, validate, createUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/analytics', getAnalytics);
router.post('/hospitals', manageHospitalDetails);

export default router;