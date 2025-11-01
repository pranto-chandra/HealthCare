import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { labTestValidation, validate } from '../utils/validation.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/lab-results');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .jpeg, .jpg, .png and .pdf format allowed!'));
  }
});

router.use(protect); // All routes require authentication

// Example lab test routes (implement controllers separately)
router.post(
  '/patients/:id',
  upload.single('labResult'),
  labTestValidation.create,
  validate,
  (req, res) => {
    res.json({
      success: true,
      message: 'Lab result uploaded',
      data: {
        filePath: req.file.path
      }
    });
  }
);

router.get('/patients/:id', (req, res) => {
  res.json({ success: true, message: 'Lab results retrieved' });
});

router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Specific lab result retrieved' });
});

export default router;