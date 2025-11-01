import express from 'express';
import { register, login, logout, resetPassword } from '../controllers/authController.js';
import { userValidation, validate } from '../utils/validation.js';

const router = express.Router();

router.post('/register', userValidation.register, validate, register);
router.post('/login', userValidation.login, validate, login);
router.post('/logout', logout);
router.post('/password-reset', resetPassword);

export default router;