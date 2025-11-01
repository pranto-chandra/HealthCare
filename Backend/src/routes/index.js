import express from 'express';
import authRoutes from './authRoutes.js';
import patientRoutes from './patientRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import adminRoutes from './adminRoutes.js';
import healthMonitoringRoutes from './healthMonitoringRoutes.js';
import labTestRoutes from './labTestRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/admin', adminRoutes);
router.use('/health-monitoring', healthMonitoringRoutes);
router.use('/lab-tests', labTestRoutes);

export default router;