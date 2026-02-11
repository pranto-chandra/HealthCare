import { prisma } from '../config/db.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export const createPatient = async (req, res) => {
  const { bloodGroup, gender, emergencyContact } = req.body;

  const patient = await prisma.patient.create({
    data: {
      userId: req.user.id,
      bloodGroup,
      gender,
      emergencyContact,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: patient,
  });
};

export const getPatient = async (req, res) => {
  const patient = await prisma.patient.findUnique({
    where: { id: req.params.id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
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
  const patient = await prisma.patient.findUnique({
    where: { userId: req.params.userId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
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
  const { bloodGroup, gender, emergencyContact } = req.body;

  const patient = await prisma.patient.update({
    where: { id: req.params.id },
    data: {
      bloodGroup,
      gender,
      emergencyContact,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
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
              firstName: true,
              lastName: true,
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
  const { doctorId, appointmentDate, appointmentType, status } = req.body;

  // Check if doctor exists
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    throw new BadRequestError('Doctor not found');
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: req.params.id,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentType,
      status,
    },
    include: {
      doctor: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
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
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: { appointmentDate: 'desc' },
  });

  res.json({
    success: true,
    data: appointments,
  });
};
