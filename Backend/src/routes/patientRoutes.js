import express from 'express';
import {
  createPatient,
  getPatient,
  updatePatient,
  getPatientHistory,
  createAppointment,
  getAppointments
} from '../controllers/patientController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { patientValidation, appointmentValidation, validate } from '../utils/validation.js';

const router = express.Router();

router.use(protect); // All patient routes require authentication

router.post('/', protect, patientValidation.create, validate, createPatient);
router.get('/:id', protect, getPatient);
router.put('/:id', protect, patientValidation.update, validate, updatePatient);
router.get('/:id/history', protect, getPatientHistory);
router.post(
  '/:id/appointments',
  protect,
  appointmentValidation.create,
  validate,
  createAppointment
);
router.get('/:id/appointments', protect, getAppointments);

export default router;