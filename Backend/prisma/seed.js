import { prisma } from '../src/config/db.js';
import { hashPassword } from '../src/utils/password.js';

const specializations = [
  'Burn & Plastic Surgery',
  'Cardiology',
  'Colorectal Surgery',
  'Dentistry',
  'Endocrinology',
  'ENT',
  'General Surgery',
  'Gynaecology & Obstetrics',
  'Hepatobiliary Surgery',
  'Hepatology',
  'Internal Medicine',
  'Laparoscopic Surgery',
  'Nephrology',
  'Neurosurgery',
  'Oncology',
  'Orthopaedics',
  'Pediatrics',
  'Physical Medicine',
  'Psychiatry',
  'Respiratory Medicine',
  'Rheumatology',
  'Skin & Venereal Diseases',
  'Skin-V.D-Allergy-Dermato-Laser-Dermato-Surgery and Cosmetic Dermatology',
  'Surgical Oncology',
  'Urology',
];

async function main() {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await prisma.appointment.deleteMany();
    // await prisma.prescription.deleteMany();
    // await prisma.patient.deleteMany();
    // await prisma.doctor.deleteMany();
    // await prisma.admin.deleteMany();
    // await prisma.user.deleteMany();

    // Create Admin User
    const adminPassword = await hashPassword('admin123');
    const admin = await prisma.user.upsert({
      where: { email: 'admin@healthcare.com' },
      update: {},
      create: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@healthcare.com',
        password: adminPassword,
        phone: '1234567890',
        dateOfBirth: new Date('1980-01-01'),
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user created:', admin.email);

    // Create Admin Profile
    await prisma.admin.upsert({
      where: { userId: admin.id },
      update: {},
      create: {
        userId: admin.id,
      },
    });
    console.log('✅ Admin profile created');

    // Create 25 Doctors with different specializations
    const doctorPassword = await hashPassword('doctor123');

    for (let i = 0; i < specializations.length; i++) {
      const specialization = specializations[i];
      const docNum = i + 1;
      const email = `doctor${docNum}@healthcare.com`;

      const doctor = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          firstName: `Dr.`,
          lastName: `${specialization.split(' ')[0]}${docNum}`,
          email,
          password: doctorPassword,
          phone: `98765432${String(docNum).padStart(2, '0')}`,
          dateOfBirth: new Date('1985-05-15'),
          role: 'DOCTOR',
        },
      });

      // Create Doctor Profile
      await prisma.doctor.upsert({
        where: { userId: doctor.id },
        update: {},
        create: {
          userId: doctor.id,
          specialization,
          licenseNumber: `LIC${String(docNum).padStart(5, '0')}`,
          qualifications: JSON.stringify([
            'MBBS',
            `MD in ${specialization}`,
            'Advanced Certification',
          ]),
          experience: 5 + (docNum % 15),
          consultationFee: 500 + docNum * 100,
          availableDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        },
      });

      console.log(`✅ Doctor ${docNum}/25 created: ${specialization} (${email})`);
    }

    // Create Patient User
    const patientPassword = await hashPassword('patient123');
    const patient = await prisma.user.upsert({
      where: { email: 'patient@healthcare.com' },
      update: {},
      create: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'patient@healthcare.com',
        password: patientPassword,
        phone: '5555555555',
        dateOfBirth: new Date('1990-03-20'),
        role: 'PATIENT',
      },
    });
    console.log('✅ Patient user created:', patient.email);

    // Create Patient Profile
    await prisma.patient.upsert({
      where: { userId: patient.id },
      update: {},
      create: {
        userId: patient.id,
        bloodGroup: 'O+',
        gender: 'MALE',
        emergencyContact: '9999999999',
      },
    });
    console.log('✅ Patient profile created');

    console.log('\n📋 Test Credentials:');
    console.log('Admin:   admin@healthcare.com / admin123');
    console.log('Doctors: doctor1@healthcare.com to doctor25@healthcare.com / doctor123');
    console.log('Patient: patient@healthcare.com / patient123');
    console.log('\n📊 Doctors created with specializations:');
    specializations.forEach((spec, index) => {
      console.log(`  ${index + 1}. ${spec} (doctor${index + 1}@healthcare.com)`);
    });
    console.log('\n✨ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
