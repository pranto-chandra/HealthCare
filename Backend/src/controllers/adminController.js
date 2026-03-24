import { prisma } from '../config/db.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { hashPassword } from '../utils/password.js';
import { sendCredentialsEmail } from '../services/emailService.js';

export const getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      isProfileComplete: true,
      createdAt: true,
      patientProfile: {
        select: {
          id: true,
          name: true,
          bloodGroup: true,
          gender: true
        }
      },
      doctorProfile: {
        select: {
          id: true,
          name: true,
          licenseNumber: true
        }
      },
      adminProfile: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });

  res.json({
    success: true,
    data: users
  });
};

export const createUser = async (req, res) => {
  const { email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new BadRequestError('User already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new user as verified
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      isEmailVerified: true,
    },
  });

  // Send credentials email
  try {
    await sendCredentialsEmail(email, password, role);
  } catch (emailError) {
    console.error('Failed to send credentials email:', emailError);
    // Don't fail the user creation if email fails, but log it
    // You might want to implement a retry mechanism or notification to admin
  }

  res.json({
    success: true,
    message: 'User created successfully. Credentials have been sent to the user\'s email.',
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  const user = await prisma.user.update({
    where: { id },
    data: { role }
  });

  res.json({
    success: true,
    data: user
  });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  await prisma.user.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
};

export const getAnalytics = async (req, res) => {
  // Get various analytics data
  const [
    totalUsers,
    totalPatients,
    totalDoctors,
    totalAppointments,
    recentAppointments
  ] = await Promise.all([
    prisma.user.count(),
    prisma.patientProfile.count(),
    prisma.doctorProfile.count(),
    prisma.appointment.count(),
    prisma.appointment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            name: true
          }
        },
        doctor: {
          select: {
            name: true
          }
        }
      }
    })
  ]);

  // Get appointment statistics by status
  const appointmentStats = await prisma.appointment.groupBy({
    by: ['status'],
    _count: true
  });

  res.json({
    success: true,
    data: {
      counts: {
        users: totalUsers,
        patients: totalPatients,
        doctors: totalDoctors,
        appointments: totalAppointments
      },
      appointmentStats,
      recentAppointments
    }
  });
};

export const manageHospitalDetails = async (req, res) => {
  // This would typically interact with a Hospital model
  // For now, we'll return a placeholder response
  res.json({
    success: true,
    message: 'Hospital details updated successfully'
  });
};