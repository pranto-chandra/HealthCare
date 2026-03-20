import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import * as labTestController from '../controllers/labTestController.js';

const router = express.Router();

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

router.use(protect); // All routes require authentication

// Doctor recommends test
router.post('/doctors/:id/recommend', authorize('DOCTOR'), labTestController.recommendTest);

// Get patient tests
router.get('/patients/:patientId', labTestController.getPatientTests);

// Get doctor's recommended tests
router.get(
  '/doctors/:doctorId/recommended',
  authorize('DOCTOR'),
  labTestController.getDoctorRecommendedTests
);

// Get single test details
router.get('/:testId', labTestController.getTestDetail);

// Get test results
router.get('/patients/:patientId/results', labTestController.getTestResults);

// Update test status
router.put('/:testId/status', labTestController.updateTestStatus);

// Delete test recommendation
router.delete('/:testId', labTestController.deleteTestRecommendation);

export default router;
