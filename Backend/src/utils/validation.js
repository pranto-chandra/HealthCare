import { body, param, query, validationResult } from 'express-validator';
import { BadRequestError } from './errors.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }
  next();
};

export const userValidation = {
  register: [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('dateOfBirth').isISO8601().withMessage('Invalid date of birth'),
    body('role').isIn(['ADMIN', 'DOCTOR', 'PATIENT']).withMessage('Invalid role')
  ],
  
  login: [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ]
};

export const patientValidation = {
  create: [
    body('bloodGroup').trim().notEmpty().withMessage('Blood group is required'),
    body('gender').isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
    body('emergencyContact').trim().notEmpty().withMessage('Emergency contact is required')
  ],
  
  update: [
    param('id').isUUID().withMessage('Invalid patient ID'),
    body('bloodGroup').optional().trim(),
    body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']),
    body('emergencyContact').optional().trim()
  ]
};

export const appointmentValidation = {
  create: [
    body('doctorId').isUUID().withMessage('Invalid doctor ID'),
    body('appointmentDate').isISO8601().withMessage('Invalid appointment date'),
    body('appointmentType').trim().notEmpty().withMessage('Appointment type is required'),
    body('status').isIn(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'PENDING'])
      .withMessage('Invalid appointment status')
  ]
};

export const prescriptionValidation = {
  create: [
    body('appointmentId').isUUID().withMessage('Invalid appointment ID'),
    body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('medications').isArray().withMessage('Medications must be an array'),
    body('medications.*.medicationName').trim().notEmpty()
      .withMessage('Medication name is required'),
    body('medications.*.dosage').trim().notEmpty().withMessage('Dosage is required'),
    body('medications.*.frequency').trim().notEmpty().withMessage('Frequency is required'),
    body('medications.*.duration').trim().notEmpty().withMessage('Duration is required')
  ]
};

export const healthMonitoringValidation = {
  create: [
    param('id').isUUID().withMessage('Invalid patient ID'),
    body('heartRate').optional().isInt(),
    body('temperature').optional().isFloat(),
    body('weight').optional().isFloat(),
    body('bloodPressure').optional().trim(),
    body('recordDate').isISO8601().withMessage('Invalid record date')
  ]
};

export const labTestValidation = {
  create: [
    param('id').isUUID().withMessage('Invalid patient ID'),
    body('testName').trim().notEmpty().withMessage('Test name is required'),
    body('testDate').isISO8601().withMessage('Invalid test date'),
    body('description').trim().notEmpty().withMessage('Description is required')
  ]
};