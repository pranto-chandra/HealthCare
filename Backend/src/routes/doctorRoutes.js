import express from 'express';
import {
  getDoctorAppointments,
  getDoctorPatients,
  getPatientRecord,
  createPrescription,
  getDoctorPrescriptions
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { prescriptionValidation, validate } from '../utils/validation.js';

const router = express.Router();

router.use(protect); // All doctor routes require authentication
router.use(authorize('DOCTOR')); // Only doctors can access these routes

router.get('/:id/appointments', getDoctorAppointments);
router.get('/:id/patients', getDoctorPatients);
router.get('/:id/records/:patient_id', getPatientRecord);
router.post(
  '/:id/prescriptions',
  prescriptionValidation.create,
  validate,
  createPrescription
);
router.get('/:id/prescriptions', getDoctorPrescriptions);

export default router;