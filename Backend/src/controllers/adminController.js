import { prisma } from '../config/db.js';
import { NotFoundError } from '../utils/errors.js';

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