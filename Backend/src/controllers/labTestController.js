import { prisma } from '../config/db.js';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../utils/errors.js';

// Doctor recommends a test
export const recommendTest = async (req, res) => {
  const { appointmentId, patientId, testName, description } = req.body;

  // Verify appointment exists and belongs to doctor
  let appointment = null;
  if (appointmentId) {
    appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    if (appointment.doctorId !== req.params.id) {
      throw new UnauthorizedError('You can only recommend tests for your own appointments');
    }
  }

  // Verify patient exists
  const patient = await prisma.patientProfile.findUnique({
    where: { id: patientId },
  });

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  // Create test recommendation
  const test = await prisma.labTest.create({
    data: {
      patientId,
      doctorId: req.params.id,
      appointmentId: appointmentId || null,
      testName,
      description,
      status: 'RECOMMENDED',
    },
    include: {
      patient: true,
      doctor: true,
      appointment: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Test recommended successfully',
    data: test,
  });
};

// Get all recommended tests for a patient
export const getPatientTests = async (req, res) => {
  const { patientId } = req.params;
  const { status } = req.query;

  const tests = await prisma.labTest.findMany({
    where: {
      patientId,
      ...(status && { status }),
    },
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      pathologist: {
        select: {
          id: true,
          name: true,
          labName: true,
        },
      },
      appointment: {
        select: {
          id: true,
          diagnosis: true,
          symptoms: true,
          scheduledAt: true,
        },
      },
    },
    orderBy: { recommendedAt: 'desc' },
  });

  res.json({
    success: true,
    data: tests,
  });
};

// Get all tests recommended by a doctor
export const getDoctorRecommendedTests = async (req, res) => {
  const { doctorId } = req.params;
  const { status } = req.query;

  const tests = await prisma.labTest.findMany({
    where: {
      doctorId,
      ...(status && { status }),
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
          bloodGroup: true,
        },
      },
      pathologist: {
        select: {
          id: true,
          name: true,
          labName: true,
        },
      },
    },
    orderBy: { recommendedAt: 'desc' },
  });

  res.json({
    success: true,
    data: tests,
  });
};

// Get single test details
export const getTestDetail = async (req, res) => {
  const { testId } = req.params;

  const test = await prisma.labTest.findUnique({
    where: { id: testId },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
          bloodGroup: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      pathologist: {
        select: {
          id: true,
          name: true,
          labName: true,
        },
      },
      appointment: {
        select: {
          id: true,
          diagnosis: true,
          symptoms: true,
          scheduledAt: true,
        },
      },
    },
  });

  if (!test) {
    throw new NotFoundError('Test not found');
  }

  res.json({
    success: true,
    data: test,
  });
};

// Get test results (for patient or doctor)
export const getTestResults = async (req, res) => {
  const { patientId } = req.params;

  const results = await prisma.labTest.findMany({
    where: {
      patientId,
      status: 'REPORT_ADDED',
    },
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      pathologist: {
        select: {
          id: true,
          name: true,
          labName: true,
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  });

  res.json({
    success: true,
    data: results,
  });
};

// Update test status (doctor can mark as acknowledged)
export const updateTestStatus = async (req, res) => {
  const { testId } = req.params;
  const { status } = req.body;

  const validStatuses = ['RECOMMENDED', 'PENDING', 'COMPLETED', 'REPORT_ADDED'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestError('Invalid status');
  }

  const test = await prisma.labTest.findUnique({
    where: { id: testId },
  });

  if (!test) {
    throw new NotFoundError('Test not found');
  }

  const updatedTest = await prisma.labTest.update({
    where: { id: testId },
    data: {
      status,
      ...(status === 'COMPLETED' && { completedAt: new Date() }),
    },
    include: {
      patient: true,
      doctor: true,
      pathologist: true,
    },
  });

  res.json({
    success: true,
    message: 'Test status updated',
    data: updatedTest,
  });
};

// Delete test recommendation (only if status is RECOMMENDED)
export const deleteTestRecommendation = async (req, res) => {
  const { testId } = req.params;

  const test = await prisma.labTest.findUnique({
    where: { id: testId },
  });

  if (!test) {
    throw new NotFoundError('Test not found');
  }

  if (test.status !== 'RECOMMENDED') {
    throw new BadRequestError('Can only delete recommended tests');
  }

  await prisma.labTest.delete({
    where: { id: testId },
  });

  res.json({
    success: true,
    message: 'Test recommendation deleted',
  });
};
