# Database Setup Instructions

## Run These Commands in Order

### 1. Stop the backend server (if running)

- Press `Ctrl+C` in the backend terminal

### 2. Run database migrations

```bash
cd Backend
npm run prisma:migrate
```

### 3. Seed the database with test data

```bash
npm run seed
```

You should see:

```
✅ Admin user created: admin@healthcare.com
✅ Admin profile created
✅ Doctor user created: doctor@healthcare.com
✅ Doctor profile created
✅ Patient user created: patient@healthcare.com
✅ Patient profile created

📋 Test Credentials:
Admin:   admin@healthcare.com / admin123
Doctor:  doctor@healthcare.com / doctor123
Patient: patient@healthcare.com / patient123

✨ Database seeded successfully!
```

### 4. Start the backend again

```bash
npm run dev
```

### 5. In another terminal, start frontend

```bash
cd Frontend
npm start
```

### 6. Test Login

Go to http://localhost:3000/login and use one of the test credentials above

---

## Test User Credentials

| Role    | Email                  | Password   |
| ------- | ---------------------- | ---------- |
| Admin   | admin@healthcare.com   | admin123   |
| Doctor  | doctor@healthcare.com  | doctor123  |
| Patient | patient@healthcare.com | patient123 |

---

## If You Need to Reset Database

To completely reset the database and start fresh:

```bash
cd Backend
npm run prisma:migrate reset
npm run seed
```

This will:

- Delete all data
- Recreate tables from schema
- Seed with test data

---

## Troubleshooting

**Error: "Can't reach database server"**

- Make sure MySQL is running
- Check DATABASE_URL in `.env` is correct

**Error: "Table doesn't exist"**

- Run migrations: `npm run prisma:migrate`

**Error during seed: "UNIQUE constraint failed"**

- Database already has test users, that's fine!
- Or run reset: `npm run prisma:migrate reset`
