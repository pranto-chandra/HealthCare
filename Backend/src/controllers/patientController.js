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
    data: { isProfileComplete: true },
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
  const { doctorId, requestedDate, type, symptoms } = req.body;

  // Check if doctor exists
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    throw new BadRequestError('Doctor not found');
  }

  // Parse the date and set a default time (10:00 AM)
  const dateObj = new Date(requestedDate);
  dateObj.setHours(10, 0, 0, 0); // Default time: 10:00 AM

  const appointment = await prisma.appointment.create({
    data: {
      patientId: req.params.id,
      doctorId,
      scheduledAt: dateObj,
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

  console.log('Appointment created:', {
    appointmentId: appointment.id,
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
    requestedDate: requestedDate,
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

// Get my prescriptions (using JWT)
export const getMyPrescriptions = async (req, res) => {
  // Get patient's profile from JWT
  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!patientProfile) {
    throw new NotFoundError('Patient profile not found');
  }

  const prescriptions = await prisma.prescription.findMany({
    where: { patientId: patientProfile.id },
    include: {
      medications: true,
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
    orderBy: { prescriptionDate: 'desc' },
  });

  res.json({
    success: true,
    data: prescriptions,
  });
};
