import { prisma } from '../config/db.js';
import { NotFoundError } from '../utils/errors.js';

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
              phone: true
            }
          }
        }
      }
    },
    orderBy: { appointmentDate: 'desc' }
  });

  res.json({
    success: true,
    data: appointments
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
              phone: true
            }
          }
        }
      }
    },
    distinct: ['patientId']
  });

  res.json({
    success: true,
    data: patients.map(p => p.patient)
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
        description
      }
    });

    // Create medications
    if (medications && medications.length > 0) {
      await prisma.medicationTracking.createMany({
        data: medications.map(med => ({
          prescriptionId: prescription.id,
          ...med
        }))
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
              lastName: true
            }
          }
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    data: prescriptionWithDetails
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
              lastName: true
            }
          }
        }
      }
    },
    orderBy: { prescriptionDate: 'desc' }
  });

  res.json({
    success: true,
    data: prescriptions
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
          dateOfBirth: true
        }
      },
      appointments: {
        where: { doctorId: req.params.id },
        include: {
          prescription: {
            include: {
              medications: true
            }
          }
        }
      },
      medicalHistory: {
        where: { doctorId: req.params.id }
      },
      healthRecords: {
        orderBy: { recordDate: 'desc' },
        take: 10
      },
      labTests: {
        where: { doctorId: req.params.id },
        orderBy: { testDate: 'desc' }
      }
    }
  });

  if (!patientRecord) {
    throw new NotFoundError('Patient record not found');
  }

  res.json({
    success: true,
    data: patientRecord
  });
};