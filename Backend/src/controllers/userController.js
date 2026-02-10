import { prisma } from '../config/db.js';
import { UnauthorizedError, NotFoundError, BadRequestError } from '../utils/errors.js';

export const getUserProfile = async (req, res) => {
  const { id } = req.params;
  
  // Check if user is authorized (can only get their own profile unless admin)
  if (req.user.id !== id && req.user.role !== 'ADMIN') {
    throw new UnauthorizedError('Not authorized to access this profile');
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      role: true,
      createdAt: true,
    }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json({
    success: true,
    data: user
  });
};

export const updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, dateOfBirth } = req.body;

  // Check if user is authorized
  if (req.user.id !== id && req.user.role !== 'ADMIN') {
    throw new UnauthorizedError('Not authorized to update this profile');
  }

  // Email cannot be updated through this endpoint (prevent duplication issues)
  // Password is updated through separate endpoint

  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;
  if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      role: true,
    }
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
};

export const getCurrentUser = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      role: true,
    }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json({
    success: true,
    data: user
  });
};
