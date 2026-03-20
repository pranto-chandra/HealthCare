import { prisma } from './src/config/db.js';

async function debug() {
  try {
    console.log('\n🔍 ===================  DATABASE DEBUG ==================');

    console.log('\n1️⃣  PATHOLOGIST PROFILES:');
    const pathologists = await prisma.pathologistProfile.findMany({
      include: { user: { select: { email: true } } },
    });
    console.log(`Found ${pathologists.length} pathologist(s)`);
    pathologists.forEach((p) => {
      console.log(`    - ${p.name} (${p.user.email}) ID: ${p.id}`);
    });

    console.log('\n2️⃣  ALL LAB TESTS:');
    const allTests = await prisma.labTest.findMany({
      include: {
        patient: { select: { name: true } },
        doctor: { select: { name: true } },
        pathologist: { select: { name: true } },
      },
    });
    console.log(`Found ${allTests.length} test(s)`);
    allTests.forEach((t) => {
      console.log(`    - ${t.testName}`);
      console.log(`      ID: ${t.id}`);
      console.log(`      Status: ${t.status}`);
      console.log(`      Patient: ${t.patient?.name} (ID: ${t.patientId})`);
      console.log(`      Doctor: ${t.doctor?.name} (ID: ${t.doctorId})`);
      console.log(
        `      Pathologist: ${t.pathologist?.name || 'UNASSIGNED'} (ID: ${t.pathologistId})`
      );
    });

    console.log('\n3️⃣  RECOMMENDED TESTS (status=RECOMMENDED & pathologistId=null):');
    const recommended = await prisma.labTest.findMany({
      where: { status: 'RECOMMENDED', pathologistId: null },
      include: {
        patient: { select: { name: true } },
        doctor: { select: { name: true } },
      },
    });
    console.log(`Found ${recommended.length} recommended test(s)`);
    recommended.forEach((t) => {
      console.log(`    - ${t.testName} (Patient: ${t.patient?.name})`);
    });

    console.log("\n4️⃣  PATHOLOGIST'S TESTS (pathologistId assigned):");
    if (pathologists.length > 0) {
      const myTests = await prisma.labTest.findMany({
        where: { pathologistId: pathologists[0].id },
        include: {
          patient: { select: { name: true } },
          doctor: { select: { name: true } },
        },
      });
      console.log(`Found ${myTests.length} test(s) for ${pathologists[0].name}`);
      myTests.forEach((t) => {
        console.log(`    - ${t.testName} (Status: ${t.status})`);
      });
    }

    console.log('\n5️⃣  PATIENT & DOCTOR COUNT:');
    const patientCount = await prisma.patientProfile.count();
    const doctorCount = await prisma.doctorProfile.count();
    console.log(`    Patients: ${patientCount}`);
    console.log(`    Doctors: ${doctorCount}`);

    console.log('\n✅ Debug complete\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debug();
