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
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],

  login: [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],

  verifyOtp: [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],

  resendOtp: [body('email').isEmail().withMessage('Please provide a valid email')],
};

export const adminValidation = {
  createUser: [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role').isIn(['ADMIN', 'DOCTOR', 'PATIENT', 'PATHOLOGIST']).withMessage('Invalid role'),
  ],
};

export const patientValidation = {
  create: [
    body('bloodGroup').trim().notEmpty().withMessage('Blood group is required'),
    body('gender').isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
    body('emergencyContact').trim().notEmpty().withMessage('Emergency contact is required'),
  ],

  update: [
    param('id').isUUID().withMessage('Invalid patient ID'),
    body('bloodGroup').optional().trim(),
    body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']),
    body('emergencyContact').optional().trim(),
  ],
};

export const appointmentValidation = {
  create: [
    body('doctorId').isUUID().withMessage('Invalid doctor ID'),
    body('requestedDate')
      .custom((value) => {
        if (!value) {
          throw new Error('Appointment date is required');
        }
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid appointment date format');
        }
        // Check if date is in the future
        if (date <= new Date()) {
          throw new Error('Appointment date must be in the future');
        }
        return true;
      })
      .withMessage('Invalid appointment date'),
    body('type')
      .isIn(['ONLINE', 'OFFLINE'])
      .withMessage('Appointment type must be ONLINE or OFFLINE'),
    body('symptoms').optional().trim(),
  ],

  confirm: [
    body('status')
      .isIn(['CONFIRMED', 'CANCELLED'])
      .withMessage('Status must be CONFIRMED or CANCELLED'),
    body('time')
      .if(body('status').equals('CONFIRMED'))
      .notEmpty()
      .withMessage('Time is required when confirming appointment')
      .custom((value) => {
        if (value && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
          throw new Error('Invalid time format. Use HH:mm');
        }
        return true;
      }),
    body('videoLink')
      .optional()
      .isURL()
      .withMessage('Video link must be a valid URL'),
  ],
};

export const prescriptionValidation = {
  create: [
    body('appointmentId').isUUID().withMessage('Invalid appointment ID'),
    body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('medications').isArray().withMessage('Medications must be an array'),
    body('medications.*.medicationName')
      .trim()
      .notEmpty()
      .withMessage('Medication name is required'),
    body('medications.*.dosage').trim().notEmpty().withMessage('Dosage is required'),
    body('medications.*.frequency').trim().notEmpty().withMessage('Frequency is required'),
    body('medications.*.duration').trim().notEmpty().withMessage('Duration is required'),
  ],
  createWithJWT: [
    body('patientId').isUUID().withMessage('Invalid patient ID'),
    body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('medications').isArray().withMessage('Medications must be an array'),
    body('medications.*.medicationName')
      .trim()
      .notEmpty()
      .withMessage('Medication name is required'),
    body('medications.*.dosage').trim().notEmpty().withMessage('Dosage is required'),
    body('medications.*.frequency').trim().notEmpty().withMessage('Frequency is required'),
    body('medications.*.duration').trim().notEmpty().withMessage('Duration is required'),
  ],
};

export const healthMonitoringValidation = {
  create: [
    param('id').isUUID().withMessage('Invalid patient ID'),
    body('heartRate').optional().isInt(),
    body('temperature').optional().isFloat(),
    body('weight').optional().isFloat(),
    body('bloodPressure').optional().trim(),
    body('recordDate').isISO8601().withMessage('Invalid record date'),
  ],
};

export const labTestValidation = {
  create: [
    param('id').isUUID().withMessage('Invalid patient ID'),
    body('testName').trim().notEmpty().withMessage('Test name is required'),
    body('testDate').isISO8601().withMessage('Invalid test date'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
};
