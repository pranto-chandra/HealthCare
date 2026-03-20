import { prisma } from '../config/db.js';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../utils/errors.js';

// Get pathologist profile
export const getPathologistProfile = async (req, res) => {
  const pathologist = await prisma.pathologistProfile.findUnique({
    where: { userId: req.user.id },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!pathologist) {
    throw new NotFoundError('Pathologist profile not found');
  }

  res.json({
    success: true,
    data: pathologist,
  });
};

// Update pathologist profile
export const updatePathologistProfile = async (req, res) => {
  const { name, phone, labName, qualification } = req.body;

  const pathologist = await prisma.pathologistProfile.update({
    where: { userId: req.user.id },
    data: {
      name,
      phone,
      labName,
      qualification,
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

  res.json({
    success: true,
    data: pathologist,
  });
};

// Get recommended tests
export const getRecommendedTests = async (req, res) => {
  const { status = 'RECOMMENDED' } = req.query;

  const tests = await prisma.labTest.findMany({
    where: {
      status: status || undefined,
      pathologistId: null, // Only show unassigned tests
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
      doctor: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      appointment: {
        select: {
          id: true,
          diagnosis: true,
          symptoms: true,
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

// Get tests by status for a specific pathologist
export const getMyTests = async (req, res) => {
  const pathologist = await prisma.pathologistProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!pathologist) {
    throw new NotFoundError('Pathologist profile not found');
  }

  const tests = await prisma.labTest.findMany({
    where: {
      pathologistId: pathologist.id,
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
      doctor: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      appointment: {
        select: {
          id: true,
          diagnosis: true,
          symptoms: true,
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
export const getTestDetails = async (req, res) => {
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
      appointment: {
        select: {
          id: true,
          diagnosis: true,
          symptoms: true,
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
  });

  if (!test) {
    throw new NotFoundError('Test not found');
  }

  res.json({
    success: true,
    data: test,
  });
};

// Accept test and update status to PENDING
export const acceptTest = async (req, res) => {
  const { testId } = req.params;

  const pathologist = await prisma.pathologistProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!pathologist) {
    throw new NotFoundError('Pathologist profile not found');
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
      status: 'PENDING',
      pathologistId: pathologist.id,
      testDate: new Date(),
    },
    include: {
      patient: true,
      doctor: true,
      pathologist: true,
    },
  });

  res.json({
    success: true,
    message: 'Test accepted successfully',
    data: updatedTest,
  });
};

// Add test report and results
export const addTestReport = async (req, res) => {
  const { testId } = req.params;
  const { reportNotes } = req.body;

  if (!req.file) {
    throw new BadRequestError('Test report file is required');
  }

  const pathologist = await prisma.pathologistProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!pathologist) {
    throw new NotFoundError('Pathologist profile not found');
  }

  const test = await prisma.labTest.findUnique({
    where: { id: testId },
  });

  if (!test) {
    throw new NotFoundError('Test not found');
  }

  if (test.pathologistId !== pathologist.id) {
    throw new UnauthorizedError('You can only update tests assigned to you');
  }

  const updatedTest = await prisma.labTest.update({
    where: { id: testId },
    data: {
      status: 'REPORT_ADDED',
      resultFile: req.file.path,
      reportNotes: reportNotes || '',
      completedAt: new Date(),
    },
    include: {
      patient: true,
      doctor: true,
      pathologist: true,
    },
  });

  res.json({
    success: true,
    message: 'Test report added successfully',
    data: updatedTest,
  });
};

// Get test results for a patient
export const getPatientTestResults = async (req, res) => {
  const { patientId } = req.params;

  const results = await prisma.labTest.findMany({
    where: {
      patientId,
      status: 'REPORT_ADDED',
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          phone: true,
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
    },
    orderBy: { completedAt: 'desc' },
  });

  res.json({
    success: true,
    data: results,
  });
};
