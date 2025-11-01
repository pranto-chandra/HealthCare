import { prisma } from './config/db.js';

async function testConnection() {
  try {
    // Test the database connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Try to perform a simple query
    const userCount = await prisma.user.count();
    console.log(`Current number of users in database: ${userCount}`);

    // Test create a test user
    const testUser = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'hashedpassword',
        dateOfBirth: new Date('1990-01-01'),
        role: 'ADMIN'
      }
    });
    console.log('✅ Test user created successfully:', testUser);

    // Clean up - delete the test user
    await prisma.user.delete({
      where: {
        id: testUser.id
      }
    });
    console.log('✅ Test user deleted successfully');

  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    // Close the database connection
    await prisma.$disconnect();
  }
}

testConnection();