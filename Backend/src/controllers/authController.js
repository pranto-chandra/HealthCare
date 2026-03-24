import { prisma } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';
import { sendOtpEmail } from '../services/emailService.js';
import crypto from 'crypto';
import otpGenerator from 'otp-generator';

export const register = async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists and is verified
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser && existingUser.isEmailVerified) {
    throw new BadRequestError('User already exists');
  }

  // Generate OTP
  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  console.log(`📧 Email Verification Code: ${otp}`);

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Set OTP expiry to 10 minutes from now
  const otpExpiry = new Date(Date.now() + 600000);

  const role = 'PATIENT'; // Hardcode role as PATIENT for registration

  if (existingUser && !existingUser.isEmailVerified) {
    // Update existing unverified user
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role,
        emailVerificationOtp: otp,
        emailVerificationOtpExpiry: otpExpiry,
      },
    });
  } else {
    // Create new user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        emailVerificationOtp: otp,
        emailVerificationOtpExpiry: otpExpiry,
        isEmailVerified: false,
      },
    });
  }

  // Send OTP email
  try {
    await sendOtpEmail(email, otp);
  } catch (error) {
    // If email fails, delete the user if newly created
    if (!existingUser) {
      await prisma.user.delete({ where: { email } });
    }
    throw new BadRequestError('Failed to send verification email');
  }

  res.status(200).json({
    success: true,
    message: 'OTP sent to your email. Please verify to complete registration.',
  });
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  // Debug logs
  console.log(`🔍 Verification attempt for ${email} with OTP: ${otp}`);

  // Find user with matching email
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(`❌ User not found: ${email}`);
    throw new BadRequestError('User not found');
  }

  // Debug: Show stored OTP and expiry
  console.log(`   Stored OTP: ${user.emailVerificationOtp}`);
  console.log(`   OTP Expiry: ${user.emailVerificationOtpExpiry}`);
  console.log(`   Current Time: ${new Date()}`);
  console.log(`   Is Expired: ${user.emailVerificationOtpExpiry < new Date()}`);
  console.log(`   OTP Match: ${user.emailVerificationOtp === otp}`);

  // Find user with matching email and valid OTP
  const verifiedUser = await prisma.user.findFirst({
    where: {
      email,
      emailVerificationOtp: otp,
      emailVerificationOtpExpiry: {
        gt: new Date(),
      },
      isEmailVerified: false,
    },
  });

  if (!verifiedUser) {
    console.log(`❌ OTP verification failed for ${email}`);
    throw new BadRequestError('Invalid or expired OTP');
  }

  console.log(`✅ OTP verified successfully for ${email}`);

  // Mark email as verified and clear OTP
  await prisma.user.update({
    where: { id: verifiedUser.id },
    data: {
      isEmailVerified: true,
      emailVerificationOtp: null,
      emailVerificationOtpExpiry: null,
    },
  });

  // Create role-specific profile
  const { role } = verifiedUser;
  if (role === 'PATIENT') {
    await prisma.patientProfile.create({
      data: {
        userId: verifiedUser.id,
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
        userId: verifiedUser.id,
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
        userId: verifiedUser.id,
        name: 'Admin',
        phone: '',
      },
    });
  } else if (role === 'PATHOLOGIST') {
    await prisma.pathologistProfile.create({
      data: {
        userId: verifiedUser.id,
        name: 'Pathologist',
        phone: '',
        licenseNumber: 'N/A',
      },
    });
  }

  // Generate tokens
  const accessToken = generateToken(verifiedUser.id);
  const refreshToken = generateRefreshToken(verifiedUser.id);

  res.status(200).json({
    success: true,
    message: 'Email verified successfully. Registration complete.',
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

export const resendOtp = async (req, res) => {
  const { email } = req.body;

  // Find unverified user
  const user = await prisma.user.findFirst({
    where: {
      email,
      isEmailVerified: false,
    },
  });

  if (!user) {
    throw new BadRequestError('No unverified account found with this email');
  }

  // Generate new OTP
  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });

  // Set OTP expiry to 10 minutes from now
  const otpExpiry = new Date(Date.now() + 600000);

  // Update OTP
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationOtp: otp,
      emailVerificationOtpExpiry: otpExpiry,
    },
  });

  // Send OTP email
  try {
    await sendOtpEmail(email, otp);
  } catch (error) {
    throw new BadRequestError('Failed to send verification email');
  }

  res.status(200).json({
    success: true,
    message: 'OTP resent to your email.',
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new UnauthorizedError('Please verify your email before logging in');
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
