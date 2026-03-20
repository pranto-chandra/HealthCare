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
  'Hepatology',
  'Laparoscopic Surgery',
  'Nephrology',
  'Neurosurgery',
  'Oncology',
  'Orthopaedics',
  'Pediatrics',
  'Psychiatry',
  'Respiratory Medicine',
  'Rheumatology',
  'Skin & Venereal Diseases',
  'Surgical Oncology',
  'Urology',
];

const degrees = ['MBBS', 'BDS', 'MD', 'MS', 'FCPS'];

const divisions = [
  'DHAKA',
  'CHITTAGONG',
  'RAJSHAHI',
  'KHULNA',
  'BARISHAL',
  'SYLHET',
  'RANGPUR',
  'MYMENSINGH',
];

async function main() {
  try {
    console.log('🌱 Seeding database (new schema)...');

    // Create Specialities
    for (const name of specializations) {
      await prisma.speciality.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
    console.log('✅ Specialities seeded');

    // Create Degrees
    for (const name of degrees) {
      await prisma.degree.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
    console.log('✅ Degrees seeded');

    // Create Admin user + AdminProfile
    const adminPassword = await hashPassword('admin123');
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@healthcare.com' },
      update: {},
      create: {
        email: 'admin@healthcare.com',
        password: adminPassword,
        role: 'ADMIN',
        isProfileComplete: true,
      },
    });

    await prisma.adminProfile.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: {
        userId: adminUser.id,
        name: 'Admin',
        phone: '0123456789',
      },
    });
    console.log('✅ Admin user + profile created');

    // Create Doctors
    const doctorPassword = await hashPassword('doctor123');

    for (let i = 0; i < specializations.length; i++) {
      const specName = specializations[i];
      const email = `doctor${i + 1}@healthcare.com`;

      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          password: doctorPassword,
          role: 'DOCTOR',
          isProfileComplete: true,
        },
      });

      const doctorProfile = await prisma.doctorProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          name: `Dr. ${specName.split(' ')[0]} ${i + 1}`,
          phone: `980000${String(i + 1).padStart(4, '0')}`,
          dateOfBirth: new Date('1985-06-15'),
          locationDiv: divisions[i % divisions.length],
          licenseNumber: `LIC-DOC-${String(i + 1).padStart(5, '0')}`,
          consultationFee: (500 + i * 50).toString(),
          experienceYears: 3 + (i % 12),
        },
      });

      // link speciality
      const speciality = await prisma.speciality.findUnique({ where: { name: specName } });
      if (speciality) {
        await prisma.doctorSpeciality.upsert({
          where: {
            doctorId_specialityId: { doctorId: doctorProfile.id, specialityId: speciality.id },
          },
          update: {},
          create: {
            doctorId: doctorProfile.id,
            specialityId: speciality.id,
          },
        });
      }

      // link a degree
      const degree = await prisma.degree.findFirst();
      if (degree) {
        await prisma.doctorDegree.upsert({
          where: { doctorId_degreeId: { doctorId: doctorProfile.id, degreeId: degree.id } },
          update: {},
          create: {
            doctorId: doctorProfile.id,
            degreeId: degree.id,
            passingYear: 2005 + (i % 15),
          },
        });
      }

      console.log(`✅ Doctor created: ${email} (speciality: ${specName})`);
    }

    // Create Pathologist user + profile
    const pathologistPassword = await hashPassword('pathologist123');
    const pathologistUser = await prisma.user.upsert({
      where: { email: 'pathologist@healthcare.com' },
      update: {},
      create: {
        email: 'pathologist@healthcare.com',
        password: pathologistPassword,
        role: 'PATHOLOGIST',
        isProfileComplete: true,
      },
    });

    await prisma.pathologistProfile.upsert({
      where: { userId: pathologistUser.id },
      update: {},
      create: {
        userId: pathologistUser.id,
        name: 'Dr. Sarah Khan',
        phone: '01800000000',
        licenseNumber: 'PATH-2020-001',
        labName: 'Central Diagnostic Lab',
        qualification: 'MD Pathology',
      },
    });
    console.log('✅ Pathologist user + profile created');

    // Create Patient user + profile
    const patientPassword = await hashPassword('patient123');
    const patientUser = await prisma.user.upsert({
      where: { email: 'patient@healthcare.com' },
      update: {},
      create: {
        email: 'patient@healthcare.com',
        password: patientPassword,
        role: 'PATIENT',
        isProfileComplete: true,
      },
    });

    await prisma.patientProfile.upsert({
      where: { userId: patientUser.id },
      update: {},
      create: {
        userId: patientUser.id,
        name: 'John Doe',
        phone: '01700000000',
        dateOfBirth: new Date('1990-03-20'),
        gender: 'MALE',
        bloodGroup: 'O_POSITIVE',
      },
    });
    console.log('✅ Patient user + profile created');

    // Create a sample appointment between patient and first doctor
    const firstDoctorProfile = await prisma.doctorProfile.findFirst({ include: { user: true } });
    if (firstDoctorProfile) {
      await prisma.appointment.create({
        data: {
          patientId: (await prisma.patientProfile.findUnique({ where: { userId: patientUser.id } }))
            .id,
          doctorId: firstDoctorProfile.id,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          type: 'OFFLINE',
          symptoms: 'General checkup',
        },
      });
      console.log('✅ Sample appointment created');
    }

    // Create sample Lab Tests to demonstrate workflow
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: patientUser.id },
    });
    const pathologistProfile = await prisma.pathologistProfile.findUnique({
      where: { userId: pathologistUser.id },
    });

    if (firstDoctorProfile && patientProfile && pathologistProfile) {
      // Find a completed appointment or create one for testing
      let testAppointment = await prisma.appointment.findFirst({
        where: {
          patientId: patientProfile.id,
          doctorId: firstDoctorProfile.id,
        },
      });

      if (!testAppointment) {
        testAppointment = await prisma.appointment.create({
          data: {
            patientId: patientProfile.id,
            doctorId: firstDoctorProfile.id,
            scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            type: 'OFFLINE',
            status: 'COMPLETED',
            symptoms: 'General health checkup',
            diagnosis: 'Routine checkup required',
          },
        });
      }

      // Test 1: RECOMMENDED status (awaiting pathologist acceptance)
      await prisma.labTest.upsert({
        where: { id: 'test-recommended-001' },
        update: {},
        create: {
          id: 'test-recommended-001',
          patientId: patientProfile.id,
          doctorId: firstDoctorProfile.id,
          appointmentId: testAppointment.id,
          testName: 'Complete Blood Count (CBC)',
          description: 'Full blood count to check for infections and abnormalities',
          status: 'RECOMMENDED',
          recommendedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          pathologistId: null,
        },
      });

      // Test 2: PENDING status (accepted by pathologist, awaiting results)
      await prisma.labTest.upsert({
        where: { id: 'test-pending-001' },
        update: {},
        create: {
          id: 'test-pending-001',
          patientId: patientProfile.id,
          doctorId: firstDoctorProfile.id,
          appointmentId: testAppointment.id,
          testName: 'Blood Sugar Level (Fasting)',
          description: 'Fasting glucose test to check for diabetes',
          status: 'PENDING',
          recommendedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          pathologistId: pathologistProfile.id,
          testDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      });

      // Test 3: REPORT_ADDED status (completed with results)
      await prisma.labTest.upsert({
        where: { id: 'test-completed-001' },
        update: {},
        create: {
          id: 'test-completed-001',
          patientId: patientProfile.id,
          doctorId: firstDoctorProfile.id,
          appointmentId: testAppointment.id,
          testName: 'Liver Function Test (LFT)',
          description: 'Tests liver enzyme levels and function',
          status: 'REPORT_ADDED',
          reportNotes: 'All parameters within normal range. Liver function is normal.',
          resultFile: 'uploads/reports/lft-report-001.pdf',
          recommendedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          pathologistId: pathologistProfile.id,
          testDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      });

      console.log('✅ Sample Lab Tests created (RECOMMENDED, PENDING, REPORT_ADDED)');
    }

    console.log('\n📋 Test Credentials:');
    console.log('Admin:       admin@healthcare.com / admin123');
    console.log(
      'Doctors:     doctor1@healthcare.com to doctor' +
        specializations.length +
        '@healthcare.com / doctor123'
    );
    console.log('Pathologist: pathologist@healthcare.com / pathologist123');
    console.log('Patient:     patient@healthcare.com / patient123');

    console.log('\n✨ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
