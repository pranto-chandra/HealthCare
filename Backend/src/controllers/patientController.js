import { prisma } from '../config/db.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export const createPatient = async (req, res) => {
  const { name, phone, dateOfBirth, gender, bloodGroup } = req.body;

  const patient = await prisma.patientProfile.create({
    data: {
      userId: req.user.id,
      name,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      bloodGroup,
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  // Mark user profile as complete
  await prisma.user.update({
    where: { id: req.user.id },
    data: { isProfileComplete: true }
  });

  res.status(201).json({
    success: true,
    data: patient,
  });
};

export const getPatient = async (req, res) => {
  const patient = await prisma.patientProfile.findUnique({
    where: { id: req.params.id },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  res.json({
    success: true,
    data: patient,
  });
};

export const getPatientByUserId = async (req, res) => {
  const patient = await prisma.patientProfile.findUnique({
    where: { userId: req.params.userId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  res.json({
    success: true,
    data: patient,
  });
};

export const updatePatient = async (req, res) => {
  const { name, phone, dateOfBirth, gender, bloodGroup } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
  if (gender) updateData.gender = gender;
  if (bloodGroup) updateData.bloodGroup = bloodGroup;

  const patient = await prisma.patientProfile.update({
    where: { id: req.params.id },
    data: updateData,
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: patient,
  });
};

export const getPatientHistory = async (req, res) => {
  const history = await prisma.medicalHistory.findMany({
    where: { patientId: req.params.id },
    include: {
      doctor: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: history,
  });
};

export const createAppointment = async (req, res) => {
  const { doctorId, scheduledAt, type, symptoms } = req.body;

  // Check if doctor exists
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    throw new BadRequestError('Doctor not found');
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: req.params.id,
      doctorId,
      scheduledAt: new Date(scheduledAt),
      type,
      symptoms,
    },
    include: {
      doctor: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: appointment,
  });
};

export const getAppointments = async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    where: { patientId: req.params.id },
    include: {
      doctor: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
    orderBy: { scheduledAt: 'desc' },
  });

  res.json({
    success: true,
    data: appointments,
  });
};
