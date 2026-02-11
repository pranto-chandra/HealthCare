import { prisma } from '../config/db.js';
import { NotFoundError, UnauthorizedError } from '../utils/errors.js';

export const getDoctorAppointments = async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    where: { doctorId: req.params.id },
    include: {
      patient: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
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

export const getDoctorPatients = async (req, res) => {
  const patients = await prisma.appointment.findMany({
    where: { doctorId: req.params.id },
    select: {
      patient: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
    distinct: ['patientId'],
  });

  res.json({
    success: true,
    data: patients.map((p) => p.patient),
  });
};

export const createPrescription = async (req, res) => {
  const { appointmentId, diagnosis, description, medications } = req.body;

  // Start a transaction
  const prescription = await prisma.$transaction(async (prisma) => {
    // Create prescription
    const prescription = await prisma.prescription.create({
      data: {
        appointmentId,
        doctorId: req.params.id,
        patientId: req.body.patientId,
        prescriptionDate: new Date(),
        diagnosis,
        description,
      },
    });

    // Create medications
    if (medications && medications.length > 0) {
      await prisma.medicationTracking.createMany({
        data: medications.map((med) => ({
          prescriptionId: prescription.id,
          ...med,
        })),
      });
    }

    return prescription;
  });

  const prescriptionWithDetails = await prisma.prescription.findUnique({
    where: { id: prescription.id },
    include: {
      medications: true,
      patient: {
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
    data: prescriptionWithDetails,
  });
};

export const getDoctorPrescriptions = async (req, res) => {
  const prescriptions = await prisma.prescription.findMany({
    where: { doctorId: req.params.id },
    include: {
      medications: true,
      patient: {
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
    orderBy: { prescriptionDate: 'desc' },
  });

  res.json({
    success: true,
    data: prescriptions,
  });
};

export const getPatientRecord = async (req, res) => {
  const { patient_id } = req.params;

  // Get comprehensive patient record
  const patientRecord = await prisma.patient.findUnique({
    where: { id: patient_id },
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
      appointments: {
        where: { doctorId: req.params.id },
        include: {
          prescription: {
            include: {
              medications: true,
            },
          },
        },
      },
      medicalHistory: {
        where: { doctorId: req.params.id },
      },
      healthRecords: {
        orderBy: { recordDate: 'desc' },
        take: 10,
      },
      labTests: {
        where: { doctorId: req.params.id },
        orderBy: { testDate: 'desc' },
      },
    },
  });

  if (!patientRecord) {
    throw new NotFoundError('Patient record not found');
  }

  res.json({
    success: true,
    data: patientRecord,
  });
};

export const getDoctorProfile = async (req, res) => {
  const { id } = req.params;

  // Check if user is authorized
  if (req.user.id !== id && req.user.role !== 'ADMIN') {
    throw new UnauthorizedError('Not authorized to access this profile');
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId: id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          role: true,
        },
      },
    },
  });

  if (!doctor) {
    throw new NotFoundError('Doctor profile not found');
  }

  res.json({
    success: true,
    data: {
      ...doctor.user,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      qualifications: doctor.qualifications,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      availableDays: doctor.availableDays,
    },
  });
};

export const updateDoctorProfile = async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    phone,
    dateOfBirth,
    specialization,
    licenseNumber,
    qualifications,
    experience,
    consultationFee,
    availableDays,
  } = req.body;

  // Check if user is authorized
  if (req.user.id !== id && req.user.role !== 'ADMIN') {
    throw new UnauthorizedError('Not authorized to update this profile');
  }

  // Update user profile
  const updateUserData = {};
  if (firstName) updateUserData.firstName = firstName;
  if (lastName) updateUserData.lastName = lastName;
  if (phone) updateUserData.phone = phone;
  if (dateOfBirth) updateUserData.dateOfBirth = new Date(dateOfBirth);

  const user = await prisma.user.update({
    where: { id },
    data: updateUserData,
  });

  // Update doctor profile
  const updateDoctorData = {};
  if (specialization) updateDoctorData.specialization = specialization;
  if (licenseNumber) updateDoctorData.licenseNumber = licenseNumber;
  if (qualifications) updateDoctorData.qualifications = qualifications;
  if (experience !== undefined && experience !== null)
    updateDoctorData.experience = parseInt(experience);
  if (consultationFee) updateDoctorData.consultationFee = parseFloat(consultationFee);
  if (availableDays) updateDoctorData.availableDays = availableDays;

  const doctor = await prisma.doctor.update({
    where: { userId: id },
    data: updateDoctorData,
  });

  res.json({
    success: true,
    message: 'Doctor profile updated successfully',
    data: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      role: user.role,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      qualifications: doctor.qualifications,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      availableDays: doctor.availableDays,
    },
  });
};
export const getDoctorsBySpecialization = async (req, res) => {
  const { specialization } = req.params;

  // Decode the specialization parameter
  const decodedSpecialization = decodeURIComponent(specialization);

  const doctors = await prisma.doctor.findMany({
    where: {
      specialization: decodedSpecialization,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          role: true,
        },
      },
    },
    orderBy: {
      user: {
        firstName: 'asc',
      },
    },
  });

  if (doctors.length === 0) {
    res.json({
      success: true,
      message: `No doctors found for specialization: ${decodedSpecialization}`,
      data: [],
    });
    return;
  }

  res.json({
    success: true,
    data: doctors.map((doctor) => ({
      id: doctor.id,
      userId: doctor.userId,
      firstName: doctor.user.firstName,
      lastName: doctor.user.lastName,
      email: doctor.user.email,
      phone: doctor.user.phone,
      dateOfBirth: doctor.user.dateOfBirth,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      qualifications: doctor.qualifications,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      availableDays: doctor.availableDays,
    })),
  });
};

export const getAllDoctors = async (req, res) => {
  const doctors = await prisma.doctor.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          role: true,
        },
      },
    },
    orderBy: {
      user: {
        firstName: 'asc',
      },
    },
  });

  res.json({
    success: true,
    data: doctors.map((doctor) => ({
      id: doctor.id,
      userId: doctor.userId,
      firstName: doctor.user.firstName,
      lastName: doctor.user.lastName,
      email: doctor.user.email,
      phone: doctor.user.phone,
      dateOfBirth: doctor.user.dateOfBirth,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      qualifications: doctor.qualifications,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      availableDays: doctor.availableDays,
    })),
  });
};

export const searchDoctors = async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.json({
      success: true,
      message: 'Please provide a search term',
      data: [],
    });
  }

  const searchTerm = q.trim();

  const doctors = await prisma.doctor.findMany({
    where: {
      OR: [
        {
          user: {
            firstName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            lastName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          specialization: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          role: true,
        },
      },
    },
    orderBy: {
      user: {
        firstName: 'asc',
      },
    },
  });

  res.json({
    success: true,
    data: doctors.map((doctor) => ({
      id: doctor.id,
      userId: doctor.userId,
      firstName: doctor.user.firstName,
      lastName: doctor.user.lastName,
      email: doctor.user.email,
      phone: doctor.user.phone,
      dateOfBirth: doctor.user.dateOfBirth,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      qualifications: doctor.qualifications,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      availableDays: doctor.availableDays,
    })),
  });
};

export const getDoctorsByQualification = async (req, res) => {
  const { qualification } = req.params;
  const decodedQualification = decodeURIComponent(qualification);

  const doctors = await prisma.doctor.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          role: true,
        },
      },
    },
    orderBy: {
      user: {
        firstName: 'asc',
      },
    },
  });

  // Filter doctors by qualification (since it's stored as JSON)
  const filteredDoctors = doctors.filter((doctor) => {
    try {
      const quals = JSON.parse(doctor.qualifications || '[]');
      return quals.includes(decodedQualification);
    } catch (e) {
      return false;
    }
  });

  res.json({
    success: true,
    data: filteredDoctors.map((doctor) => ({
      id: doctor.id,
      userId: doctor.userId,
      firstName: doctor.user.firstName,
      lastName: doctor.user.lastName,
      email: doctor.user.email,
      phone: doctor.user.phone,
      dateOfBirth: doctor.user.dateOfBirth,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      qualifications: doctor.qualifications,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      availableDays: doctor.availableDays,
    })),
  });
};

export const filterDoctors = async (req, res) => {
  const { specialization, qualification, name } = req.query;

  let whereClause = {};

  // Add specialization filter
  if (specialization) {
    whereClause.specialization = {
      contains: decodeURIComponent(specialization),
      mode: 'insensitive',
    };
  }

  // Get doctors with filters
  const doctors = await prisma.doctor.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          role: true,
        },
      },
    },
    orderBy: {
      user: {
        firstName: 'asc',
      },
    },
  });

  // Filter by name and qualification (client-side since they're more complex)
  let filteredDoctors = doctors;

  if (name) {
    const searchTerm = name.toLowerCase();
    filteredDoctors = filteredDoctors.filter((doctor) => {
      const fullName = `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase();
      return fullName.includes(searchTerm);
    });
  }

  if (qualification) {
    const decodedQual = decodeURIComponent(qualification);
    filteredDoctors = filteredDoctors.filter((doctor) => {
      try {
        const quals = JSON.parse(doctor.qualifications || '[]');
        return quals.includes(decodedQual);
      } catch (e) {
        return false;
      }
    });
  }

  res.json({
    success: true,
    data: filteredDoctors.map((doctor) => ({
      id: doctor.id,
      userId: doctor.userId,
      firstName: doctor.user.firstName,
      lastName: doctor.user.lastName,
      email: doctor.user.email,
      phone: doctor.user.phone,
      dateOfBirth: doctor.user.dateOfBirth,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      qualifications: doctor.qualifications,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      availableDays: doctor.availableDays,
    })),
  });
};
