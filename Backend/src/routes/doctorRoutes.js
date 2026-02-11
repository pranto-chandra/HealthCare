import express from 'express';
import {
  getDoctorAppointments,
  getDoctorPatients,
  getPatientRecord,
  createPrescription,
  getDoctorPrescriptions,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorsBySpecialization,
  getAllDoctors,
  searchDoctors,
  getDoctorsByQualification,
  filterDoctors,
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { prescriptionValidation, validate } from '../utils/validation.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllDoctors);
router.get('/search', searchDoctors);
router.get('/specialization/:specialization', getDoctorsBySpecialization);
router.get('/qualification/:qualification', getDoctorsByQualification);
router.get('/filter', filterDoctors);

// Protected routes (require authentication and DOCTOR role)
router.use(protect); // All doctor routes require authentication
router.use(authorize('DOCTOR')); // Only doctors can access these routes

router.get('/:id/profile', getDoctorProfile);
router.put('/:id/profile', updateDoctorProfile);
router.get('/:id/appointments', getDoctorAppointments);
router.get('/:id/patients', getDoctorPatients);
router.get('/:id/records/:patient_id', getPatientRecord);
router.post('/:id/prescriptions', prescriptionValidation.create, validate, createPrescription);
router.get('/:id/prescriptions', getDoctorPrescriptions);

export default router;
