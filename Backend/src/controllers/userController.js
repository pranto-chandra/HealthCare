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
      email: true,
      role: true,
      isProfileComplete: true,
      createdAt: true,
      patientProfile: true,
      doctorProfile: true,
      adminProfile: true,
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
  const { name, phone, dateOfBirth, gender, bloodGroup } = req.body;

  // Check if user is authorized
  if (req.user.id !== id && req.user.role !== 'ADMIN') {
    throw new UnauthorizedError('Not authorized to update this profile');
  }

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Update the appropriate profile based on role
  if (user.role === 'PATIENT') {
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateData.gender = gender;
    if (bloodGroup) updateData.bloodGroup = bloodGroup;

    await prisma.patientProfile.update({
      where: { userId: id },
      data: updateData,
    });
  } else if (user.role === 'DOCTOR') {
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);

    await prisma.doctorProfile.update({
      where: { userId: id },
      data: updateData,
    });
  } else if (user.role === 'ADMIN') {
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    await prisma.adminProfile.update({
      where: { userId: id },
      data: updateData,
    });
  }

  const updatedUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      isProfileComplete: true,
      createdAt: true,
      patientProfile: true,
      doctorProfile: true,
      adminProfile: true,
    }
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser
  });
};

export const getCurrentUser = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      isProfileComplete: true,
      createdAt: true,
      patientProfile: true,
      doctorProfile: true,
      adminProfile: true,
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
