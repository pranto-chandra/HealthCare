import express from 'express';
import { register, login, logout, resetPassword, forgotPassword, confirmPasswordReset } from '../controllers/authController.js';
import { userValidation, validate } from '../utils/validation.js';

const router = express.Router();

router.post('/register', userValidation.register, validate, register);
router.post('/login', userValidation.login, validate, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/confirm-password-reset', confirmPasswordReset);
router.post('/password-reset', resetPassword); // Legacy endpoint

export default router;