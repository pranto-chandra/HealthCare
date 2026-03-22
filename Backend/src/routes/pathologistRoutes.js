import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import * as pathologistController from '../controllers/pathologistController.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads/lab-results';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/lab-results');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .jpeg, .jpg, .png and .pdf format allowed!'));
  },
});

// All routes require authentication and PATHOLOGIST role
router.use(protect);
router.use(authorize('PATHOLOGIST'));

// Pathologist profile
router.get('/profile', pathologistController.getPathologistProfile);
router.put('/profile', pathologistController.updatePathologistProfile);

// Get recommended tests
router.get('/tests/recommended', pathologistController.getRecommendedTests);
router.get('/tests/my', pathologistController.getMyTests);

// Get single test details
router.get('/tests/:testId', pathologistController.getTestDetails);

// Accept test (assign to pathologist)
router.put('/tests/:testId/accept', pathologistController.acceptTest);

// Add test report with file upload
router.post(
  '/tests/:testId/report',
  upload.single('reportFile'),
  pathologistController.addTestReport
);

// Get patient test results
router.get('/patients/:patientId/results', pathologistController.getPatientTestResults);

export default router;
