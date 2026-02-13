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

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role
    }
  });

  // Create role-specific profile
  if (role === 'PATIENT') {
    await prisma.patientProfile.create({
      data: {
        userId: user.id,
        name: 'Patient',
        phone: '',
        dateOfBirth: new Date('2000-01-01'),
        gender: 'OTHER',
        bloodGroup: 'O_POSITIVE'
      }
    });
  } else if (role === 'DOCTOR') {
    await prisma.doctorProfile.create({
      data: {
        userId: user.id,
        name: 'Doctor',
        phone: '',
        dateOfBirth: new Date('2000-01-01'),
        locationDiv: 'DHAKA',
        licenseNumber: 'N/A',
        consultationFee: 0,
        experienceYears: 0
      }
    });
  } else if (role === 'ADMIN') {
    await prisma.adminProfile.create({
      data: {
        userId: user.id,
        name: 'Admin',
        phone: ''
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
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete
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

  // Fetch the complete user profile
  const completeUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      role: true,
      isProfileComplete: true,
      patientProfile: true,
      doctorProfile: true,
      adminProfile: true,
    }
  });

  // Generate tokens
  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  res.json({
    success: true,
    data: {
      user: completeUser,
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