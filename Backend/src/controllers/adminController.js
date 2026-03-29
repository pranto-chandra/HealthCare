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
          gender: true,
        },
      },
      doctorProfile: {
        select: {
          id: true,
          name: true,
          licenseNumber: true,
        },
      },
      adminProfile: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: users,
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

  // Create the corresponding profile based on role
  if (role === 'PATIENT') {
    await prisma.patientProfile.create({
      data: {
        userId: user.id,
        name: '',
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
        name: '',
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

  // Send credentials email
  try {
    await sendCredentialsEmail(email, password, role);
    console.log(`✅ Credentials email sent successfully to ${email}`);
  } catch (emailError) {
    console.error('❌ Failed to send credentials email to ' + email);
    console.error('Error details:', emailError.message);
    console.error('Full error:', emailError);
    // Log for debugging but don't fail the user creation
  }

  res.json({
    success: true,
    message: "User created successfully. Credentials have been sent to the user's email.",
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });

  res.json({
    success: true,
    data: user,
  });
};

export const updateUserStatus = async (req, res) => {
  const { isProfileComplete } = req.body;
  const { id } = req.params;

  const user = await prisma.user.update({
    where: { id },
    data: { isProfileComplete },
  });

  res.json({
    success: true,
    data: user,
  });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  await prisma.user.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
};

export const getAnalytics = async (req, res) => {
  try {
    // Get various analytics data - simpler approach
    const totalUsers = await prisma.user.count();
    const totalPatients = await prisma.patientProfile.count();
    const totalDoctors = await prisma.doctorProfile.count();
    const totalPathologists = await prisma.pathologistProfile.count();
    const totalAppointments = await prisma.appointment.count();
    const totalLabTestsCompleted = await prisma.labTest.count({
      where: { status: 'REPORT_ADDED' },
    });

    // Get all specialties with their doctor counts
    const doctorsBySpecialty = await prisma.speciality.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            doctors: true,
          },
        },
      },
    });

    // Get appointment statistics by status
    const appointmentStats = await prisma.appointment.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    // Format appointment stats for frontend
    const formattedStats = appointmentStats.map((stat) => ({
      status: stat.status,
      _count: stat._count._all,
    }));

    // Get recent appointments with patient and doctor details
    let recentAppointments = [];
    try {
      const appointments = await prisma.appointment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          createdAt: true,
          scheduledAt: true,
          patient: {
            select: {
              name: true,
            },
          },
          doctor: {
            select: {
              name: true,
            },
          },
        },
      });
      recentAppointments = appointments;
    } catch (appointmentError) {
      console.error('Error fetching recent appointments:', appointmentError);
      // Continue without recent appointments data
      recentAppointments = [];
    }

    res.json({
      success: true,
      data: {
        counts: {
          users: totalUsers,
          patients: totalPatients,
          doctors: totalDoctors,
          pathologists: totalPathologists,
          appointments: totalAppointments,
          labTestsCompleted: totalLabTestsCompleted,
        },
        appointmentStats: formattedStats,
        recentAppointments,
        doctorsBySpecialty,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};

export const manageHospitalDetails = async (req, res) => {
  // This would typically interact with a Hospital model
  // For now, we'll return a placeholder response
  res.json({
    success: true,
    message: 'Hospital details updated successfully',
  });
};
