# Healthcare Management System Backend

A robust backend system for managing healthcare operations, built with Node.js, Express.js, and Prisma ORM.

## Features

- 🔐 JWT-based authentication
- 👥 Role-based access control (Admin, Doctor, Patient)
- 📝 Complete patient management
- 🏥 Appointment scheduling
- 💊 Prescription management
- 📊 Health monitoring
- 🔬 Lab test results management
- 📈 Admin analytics
- 🔒 Secure file uploads

## Tech Stack

- Node.js & Express.js
- Prisma ORM
- MySQL Database
- JWT Authentication
- Express Validator
- Winston Logger
- Multer for File Uploads

## Prerequisites

- Node.js >= 14.x
- MySQL >= 8.x
- npm >= 6.x

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/healthcare-management.git
   cd healthcare-management/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Start the server:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Documentation

### Authentication Endpoints
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout
- POST /api/auth/password-reset - Reset password

### Patient Endpoints
- POST /api/patients - Create patient profile
- GET /api/patients/:id - Get patient details
- PUT /api/patients/:id - Update patient profile
- GET /api/patients/:id/history - Get medical history
- POST /api/patients/:id/appointments - Schedule appointment
- GET /api/patients/:id/appointments - List appointments

### Doctor Endpoints
- GET /api/doctors/:id/appointments - View appointments
- GET /api/doctors/:id/patients - List patients
- POST /api/doctors/:id/prescriptions - Create prescription
- GET /api/doctors/:id/prescriptions - View prescriptions

### Admin Endpoints
- GET /api/admin/users - List all users
- PUT /api/admin/users/:id/role - Update user role
- DELETE /api/admin/users/:id - Delete user
- GET /api/admin/analytics - View system analytics

## Environment Variables

```env
DATABASE_URL="mysql://user:password@localhost:3306/healthcare"
JWT_SECRET="your-super-secret-key"
PORT=5000
NODE_ENV=development
```

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   └── utils/
├── uploads/
├── tests/
└── package.json
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Request rate limiting
- Input validation & sanitization
- Secure file upload handling
- CORS protection
- Helmet security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@healthcaresystem.com or create an issue in the repository.