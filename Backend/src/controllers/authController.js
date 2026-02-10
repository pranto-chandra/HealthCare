import { prisma } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';

export const register = async (req, res) => {
  const { email, password, role } = req.body;

  // Check if user exists
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    throw new BadRequestError('User already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user with default values for required fields
  const user = await prisma.user.create({
    data: {
      firstName: 'User',
      lastName: 'Account',
      email,
      password: hashedPassword,
      phone: 'N/A',
      dateOfBirth: new Date('2000-01-01'),
      role
    }
  });

  // Create role-specific entry
  if (role === 'PATIENT') {
    await prisma.patient.create({
      data: {
        userId: user.id,
        bloodGroup: 'N/A',
        gender: 'OTHER',
        emergencyContact: 'N/A'
      }
    });
  } else if (role === 'DOCTOR') {
    await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization: 'General',
        licenseNumber: 'N/A',
        consultationFee: 0,
        availableDays: '[]'
      }
    });
  } else if (role === 'ADMIN') {
    await prisma.admin.create({
      data: {
        userId: user.id
      }
    });
  }

  // Generate tokens
  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Verify password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate tokens
  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
};

export const logout = async (req, res) => {
  // In a real-world application, you might want to blacklist the token
  // or implement a token revocation mechanism
  res.json({
    success: true,
    message: 'Successfully logged out'
  });
};

export const resetPassword = async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new BadRequestError('User not found');
  }

  // In a real application, you would:
  // 1. Generate a password reset token
  // 2. Send an email with the reset link
  // 3. Save the reset token and its expiry in the database

  res.json({
    success: true,
    message: 'Password reset instructions sent to email'
  });
};