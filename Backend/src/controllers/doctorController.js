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

export const getDoctorPatients = async (req, res) => {
  const patients = await prisma.appointment.findMany({
    where: { doctorId: req.params.id },
    select: {
      patient: {
        include: {
          user: {
            select: {
              email: true,
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

export const confirmAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const { status, time } = req.body; // status: CONFIRMED or CANCELLED, time: HH:mm (required for CONFIRMED)

  if (!['CONFIRMED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be CONFIRMED or CANCELLED',
    });
  }

  // Validate time is provided when confirming
  if (status === 'CONFIRMED' && !time) {
    return res.status(400).json({
      success: false,
      message: 'Time is required when confirming appointment. Format: HH:mm',
    });
  }

  // Get the doctor's profile using their user ID from JWT
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!doctorProfile) {
    return res.status(403).json({
      success: false,
      message: 'Doctor profile not found',
    });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  // Verify the doctor owns this appointment
  if (appointment.doctorId !== doctorProfile.id) {
    console.error('Authorization mismatch:', {
      appointmentDoctorId: appointment.doctorId,
      loggedInDoctorId: doctorProfile.id,
      appointmentDetails: {
        id: appointment.id,
        patientId: appointment.patientId,
        status: appointment.status,
      },
    });
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to confirm this appointment',
      debug: {
        expectedDoctorId: doctorProfile.id,
        appointmentDoctorId: appointment.doctorId,
        match: appointment.doctorId === doctorProfile.id,
      },
    });
  }

  // Prepare update data
  const updateData = {
    status: status,
    ...(status === 'CANCELLED' && { cancelledAt: new Date() }),
  };

  // If confirming, update the scheduled time
  if (status === 'CONFIRMED' && time) {
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledDate = new Date(appointment.scheduledAt);
    scheduledDate.setHours(hours, minutes, 0, 0);
    updateData.scheduledAt = scheduledDate;
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: updateData,
    include: {
      patient: {
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

  res.json({
    success: true,
    message: `Appointment ${status.toLowerCase()}`,
    data: updatedAppointment,
  });
};

export const completeAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  // Get the doctor's profile using their user ID from JWT
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!doctorProfile) {
    return res.status(403).json({
      success: false,
      message: 'Doctor profile not found',
    });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  // Verify the doctor owns this appointment
  if (appointment.doctorId !== doctorProfile.id) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to complete this appointment',
    });
  }

  // Only CONFIRMED appointments can be completed
  if (appointment.status !== 'CONFIRMED') {
    return res.status(400).json({
      success: false,
      message: `Only CONFIRMED appointments can be completed. Current status: ${appointment.status}`,
    });
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
    include: {
      patient: {
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

  res.json({
    success: true,
    message: 'Appointment marked as completed',
    data: updatedAppointment,
  });
};

export const getPatientRecord = async (req, res) => {
  const { patient_id } = req.params;

  // Get comprehensive patient record
  const patientRecord = await prisma.patientProfile.findUnique({
    where: { id: patient_id },
    include: {
      user: {
        select: {
          email: true,
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

  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId: id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      specialties: {
        include: {
          speciality: true,
        },
      },
      degrees: {
        include: {
          degree: true,
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
      name: doctor.name,
      phone: doctor.phone,
      dateOfBirth: doctor.dateOfBirth,
      locationDiv: doctor.locationDiv,
      licenseNumber: doctor.licenseNumber,
      consultationFee: doctor.consultationFee,
      experienceYears: doctor.experienceYears,
      specialties: doctor.specialties.map((s) => s.speciality),
      degrees: doctor.degrees.map((d) => ({ ...d.degree, passingYear: d.passingYear })),
    },
  });
};

export const updateDoctorProfile = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    phone,
    dateOfBirth,
    locationDiv,
    licenseNumber,
    consultationFee,
    experienceYears,
    specialties,
  } = req.body;

  // Check if user is authorized
  if (req.user.id !== id && req.user.role !== 'ADMIN') {
    throw new UnauthorizedError('Not authorized to update this profile');
  }

  // Update doctor profile
  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
  if (locationDiv) updateData.locationDiv = locationDiv;
  if (licenseNumber) updateData.licenseNumber = licenseNumber;
  if (consultationFee) updateData.consultationFee = parseFloat(consultationFee);
  if (experienceYears !== undefined && experienceYears !== null)
    updateData.experienceYears = parseInt(experienceYears);

  const doctor = await prisma.doctorProfile.update({
    where: { userId: id },
    data: updateData,
  });

  // Update specialties if provided
  if (specialties && specialties.length > 0) {
    // Delete existing specialties
    await prisma.doctorSpeciality.deleteMany({
      where: { doctorId: doctor.id },
    });

    // Create new specialties
    await prisma.doctorSpeciality.createMany({
      data: specialties.map((specialtyId) => ({
        doctorId: doctor.id,
        specialityId: specialtyId,
      })),
    });
  }

  // Mark user profile as complete
  await prisma.user.update({
    where: { id },
    data: { isProfileComplete: true },
  });

  // Fetch the updated doctor profile with all relationships
  const updatedDoctor = await prisma.doctorProfile.findUnique({
    where: { userId: id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isProfileComplete: true,
        },
      },
      specialties: {
        include: {
          speciality: true,
        },
      },
      degrees: {
        include: {
          degree: true,
        },
      },
    },
  });

  // Return the full user object with updated doctor profile
  const completeUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      isProfileComplete: true,
      patientProfile: true,
      doctorProfile: true,
      adminProfile: true,
    },
  });

  res.json({
    success: true,
    message: 'Doctor profile updated successfully',
    data: completeUser,
  });
};
export const getDoctorsBySpecialization = async (req, res) => {
  const { specialization } = req.params;

  // Decode the specialization parameter
  const decodedSpecialization = decodeURIComponent(specialization);

  // Find speciality by name
  const speciality = await prisma.speciality.findUnique({
    where: { name: decodedSpecialization },
  });

  if (!speciality) {
    res.json({
      success: true,
      message: `No doctors found for specialization: ${decodedSpecialization}`,
      data: [],
    });
    return;
  }

  // Get doctors with this specialization
  const doctorSpecialties = await prisma.doctorSpeciality.findMany({
    where: { specialityId: speciality.id },
    include: {
      doctor: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          specialties: {
            include: {
              speciality: true,
            },
          },
          degrees: {
            include: {
              degree: true,
            },
          },
        },
      },
    },
  });

  res.json({
    success: true,
    data: doctorSpecialties.map((ds) => ({
      id: ds.doctor.id,
      userId: ds.doctor.userId,
      name: ds.doctor.name,
      email: ds.doctor.user.email,
      phone: ds.doctor.phone,
      dateOfBirth: ds.doctor.dateOfBirth,
      locationDiv: ds.doctor.locationDiv,
      licenseNumber: ds.doctor.licenseNumber,
      consultationFee: ds.doctor.consultationFee,
      experienceYears: ds.doctor.experienceYears,
      specialties: ds.doctor.specialties.map((s) => s.speciality),
      degrees: ds.doctor.degrees.map((d) => ({ ...d.degree, passingYear: d.passingYear })),
    })),
  });
};

export const getAllDoctors = async (req, res) => {
  const doctors = await prisma.doctorProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      specialties: {
        include: {
          speciality: true,
        },
      },
      degrees: {
        include: {
          degree: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  res.json({
    success: true,
    data: doctors.map((doctor) => ({
      id: doctor.id,
      userId: doctor.userId,
      name: doctor.name,
      email: doctor.user.email,
      phone: doctor.phone,
      dateOfBirth: doctor.dateOfBirth,
      locationDiv: doctor.locationDiv,
      licenseNumber: doctor.licenseNumber,
      consultationFee: doctor.consultationFee,
      experienceYears: doctor.experienceYears,
      specialties: doctor.specialties.map((s) => s.speciality),
      degrees: doctor.degrees.map((d) => ({ ...d.degree, passingYear: d.passingYear })),
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

  const doctors = await prisma.doctorProfile.findMany({
    where: {
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          specialties: {
            some: {
              speciality: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      specialties: {
        include: {
          speciality: true,
        },
      },
      degrees: {
        include: {
          degree: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  res.json({
    success: true,
    data: doctors.map((doctor) => ({
      id: doctor.id,
      userId: doctor.userId,
      name: doctor.name,
      email: doctor.user.email,
      phone: doctor.phone,
      dateOfBirth: doctor.dateOfBirth,
      locationDiv: doctor.locationDiv,
      licenseNumber: doctor.licenseNumber,
      consultationFee: doctor.consultationFee,
      experienceYears: doctor.experienceYears,
      specialties: doctor.specialties.map((s) => s.speciality),
      degrees: doctor.degrees.map((d) => ({ ...d.degree, passingYear: d.passingYear })),
    })),
  });
};

export const getDoctorsByQualification = async (req, res) => {
  const { qualification } = req.params;
  const decodedQualification = decodeURIComponent(qualification);

  const doctors = await prisma.doctorProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      specialties: {
        include: {
          speciality: true,
        },
      },
      degrees: {
        where: {
          degree: {
            name: decodedQualification,
          },
        },
        include: {
          degree: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Filter to only include doctors with the specific degree
  const filtered = doctors.filter((doc) => doc.degrees.length > 0);

  res.json({
    success: true,
    data: filtered.map((doctor) => ({
      id: doctor.id,
      userId: doctor.userId,
      name: doctor.name,
      email: doctor.user.email,
      phone: doctor.phone,
      dateOfBirth: doctor.dateOfBirth,
      locationDiv: doctor.locationDiv,
      licenseNumber: doctor.licenseNumber,
      consultationFee: doctor.consultationFee,
      experienceYears: doctor.experienceYears,
      specialties: doctor.specialties.map((s) => s.speciality),
      degrees: doctor.degrees.map((d) => ({ ...d.degree, passingYear: d.passingYear })),
    })),
  });
};

export const filterDoctors = async (req, res) => {
  const { specialization, qualification, name } = req.query;

  let whereClause = {};

  // Add specialization filter
  if (specialization) {
    whereClause.specialties = {
      some: {
        speciality: {
          name: {
            contains: decodeURIComponent(specialization),
            mode: 'insensitive',
          },
        },
      },
    };
  }

  // Get doctors with filters
  const doctors = await prisma.doctorProfile.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      specialties: {
        include: {
          speciality: true,
        },
      },
      degrees: {
        include: {
          degree: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Filter by name and qualification (client-side since they're more complex)
  let filteredDoctors = doctors;

  if (name) {
    const searchTerm = name.toLowerCase();
    filteredDoctors = filteredDoctors.filter((doctor) => {
      return doctor.name.toLowerCase().includes(searchTerm);
    });
  }

  if (qualification) {
    const decodedQual = decodeURIComponent(qualification);
    filteredDoctors = filteredDoctors.filter((doctor) => {
      return doctor.degrees.some((d) => d.degree.name === decodedQual);
    });
  }

  res.json({
    success: true,
    data: filteredDoctors.map((doctor) => ({
      id: doctor.id,
      userId: doctor.userId,
      name: doctor.name,
      email: doctor.user.email,
      phone: doctor.phone,
      dateOfBirth: doctor.dateOfBirth,
      locationDiv: doctor.locationDiv,
      licenseNumber: doctor.licenseNumber,
      consultationFee: doctor.consultationFee,
      experienceYears: doctor.experienceYears,
      specialties: doctor.specialties.map((s) => s.speciality),
      degrees: doctor.degrees.map((d) => ({ ...d.degree, passingYear: d.passingYear })),
    })),
  });
};

export const getMyAppointments = async (req, res) => {
  // Get the doctor's profile using their user ID from JWT
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!doctorProfile) {
    throw new NotFoundError('Doctor profile not found');
  }

  console.log('Getting appointments for doctorId:', doctorProfile.id);

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: doctorProfile.id },
    include: {
      patient: {
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

  console.log(`Found ${appointments.length} appointments for doctor ${doctorProfile.id}`);

  res.json({
    success: true,
    data: appointments,
  });
};

export const getMyPatients = async (req, res) => {
  // Get the doctor's profile using their user ID from JWT
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!doctorProfile) {
    throw new NotFoundError('Doctor profile not found');
  }

  const patients = await prisma.appointment.findMany({
    where: { doctorId: doctorProfile.id },
    select: {
      patient: {
        include: {
          user: {
            select: {
              email: true,
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

// Search patient by email
export const searchPatientByEmail = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    throw new NotFoundError('Email parameter is required');
  }

  const patient = await prisma.patientProfile.findFirst({
    where: {
      user: {
        email: email.toLowerCase(),
      },
    },
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

// Get my patient record (using JWT)
export const getMyPatientRecord = async (req, res) => {
  const { patientId } = req.params;

  // Get doctor's profile from JWT
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!doctorProfile) {
    throw new NotFoundError('Doctor profile not found');
  }

  // Get comprehensive patient record with doctor's specific data
  const patientRecord = await prisma.patientProfile.findUnique({
    where: { id: patientId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      appointments: {
        where: { doctorId: doctorProfile.id },
        include: {
          prescription: {
            include: {
              medications: true,
            },
          },
        },
      },
      medicalHistory: {
        where: { doctorId: doctorProfile.id },
      },
      healthRecords: {
        orderBy: { recordedAt: 'desc' },
        take: 10,
      },
      labTests: {
        where: { doctorId: doctorProfile.id },
        orderBy: { testDate: 'desc' },
      },
    },
  });

  if (!patientRecord) {
    throw new NotFoundError('Patient record not found');
  }

  res.json({
    success: true,
    data: {
      patient: patientRecord,
      appointments: patientRecord.appointments,
      medicalHistory: patientRecord.medicalHistory,
      labTests: patientRecord.labTests,
      healthRecords: patientRecord.healthRecords,
      prescriptions: patientRecord.appointments
        .filter((apt) => apt.prescription)
        .map((apt) => apt.prescription),
    },
  });
};

// Get my prescriptions (using JWT)
export const getMyPrescriptions = async (req, res) => {
  // Get doctor's profile from JWT
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!doctorProfile) {
    throw new NotFoundError('Doctor profile not found');
  }

  const prescriptions = await prisma.prescription.findMany({
    where: { doctorId: doctorProfile.id },
    include: {
      medications: true,
      patient: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
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

// Create prescription (updated for JWT - using patientId and medications from body)
export const createPrescriptionWithJWT = async (req, res) => {
  const { patientId, diagnosis, description, medications } = req.body;

  // Get doctor's profile from JWT
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!doctorProfile) {
    throw new NotFoundError('Doctor profile not found');
  }

  // Verify patient exists
  const patient = await prisma.patientProfile.findUnique({
    where: { id: patientId },
  });

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  // Create prescription with medications using transaction
  const prescription = await prisma.$transaction(async (prisma) => {
    const newPrescription = await prisma.prescription.create({
      data: {
        doctorId: doctorProfile.id,
        patientId,
        prescriptionDate: new Date(),
        diagnosis,
        description,
      },
    });

    // Create medications if provided
    if (medications && medications.length > 0) {
      await prisma.medicationTracking.createMany({
        data: medications.map((med) => ({
          prescriptionId: newPrescription.id,
          medicationName: med.medicationName,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
        })),
      });
    }

    return newPrescription;
  });

  // Fetch complete prescription with medications and patient details
  const prescriptionWithDetails = await prisma.prescription.findUnique({
    where: { id: prescription.id },
    include: {
      medications: true,
      patient: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Prescription created successfully',
    data: prescriptionWithDetails,
  });
};
