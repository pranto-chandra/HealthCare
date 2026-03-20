import { prisma } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';
import crypto from 'crypto';

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
      role,
    },
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
        bloodGroup: 'O_POSITIVE',
      },
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
        experienceYears: 0,
      },
    });
  } else if (role === 'ADMIN') {
    await prisma.adminProfile.create({
      data: {
        userId: user.id,
        name: 'Admin',
        phone: '',
      },
    });
  } else if (role === 'PATHOLOGIST') {
    await prisma.pathologistProfile.create({
      data: {
        userId: user.id,
        name: 'Pathologist',
        phone: '',
        licenseNumber: 'N/A',
      },
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
        isProfileComplete: user.isProfileComplete,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
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
      pathologistProfile: true,
    },
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
        refreshToken,
      },
    },
  });
};

export const logout = async (req, res) => {
  // In a real-world application, you might want to blacklist the token
  // or implement a token revocation mechanism
  res.json({
    success: true,
    message: 'Successfully logged out',
  });
};

// Forgot password - Generate reset token
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if user exists or not for security
    return res.json({
      success: true,
      message: 'If an account exists with that email, password reset instructions have been sent',
    });
  }

  // Generate a random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set token expiry to 1 hour from now
  const tokenExpiry = new Date(Date.now() + 3600000);

  // Save the hashed token to database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedToken,
      passwordResetTokenExpiry: tokenExpiry,
    },
  });

  // In a real application, send email with reset link
  // For now, return the token (in production, this would be in an email link)
  res.json({
    success: true,
    message: 'Password reset token generated',
    // NOTE: In production, send this token via email instead of returning it
    resetToken: resetToken,
    resetLink: `http://localhost:3000/reset-password?token=${resetToken}`,
  });
};

// Reset password - Confirm reset with token and new password
export const confirmPasswordReset = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new BadRequestError('Token and new password are required');
  }

  if (newPassword.length < 6) {
    throw new BadRequestError('Password must be at least 6 characters long');
  }

  // Hash the provided token to match with database
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with matching token and valid expiry
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetTokenExpiry: {
        gt: new Date(), // Token must not be expired
      },
    },
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired reset token');
  }

  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
    },
  });

  res.json({
    success: true,
    message: 'Password has been reset successfully. Please login with your new password.',
  });
};

// Legacy function - kept for backward compatibility
export const resetPassword = async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new BadRequestError('User not found');
  }

  // Generate a random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const tokenExpiry = new Date(Date.now() + 3600000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedToken,
      passwordResetTokenExpiry: tokenExpiry,
    },
  });

  res.json({
    success: true,
    message: 'Password reset instructions sent to email',
    resetToken: resetToken,
    resetLink: `http://localhost:3000/reset-password?token=${resetToken}`,
  });
};
