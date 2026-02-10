import './src/config/env.js';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';
import { prisma, connectDB } from './src/config/db.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import { logger } from './src/middlewares/logger.js';
import routes from './src/routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined', { stream: logger.stream }));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', routes);

// Health check
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Connect to database before starting server
try {
  await connectDB();
} catch (err) {
  console.error('Failed to connect to DB at startup:', err);
  process.exit(1);
}

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Clean up database connections on shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received. Shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => {
    console.log('💥 Process terminated!');
    process.exit(0);
  });
});