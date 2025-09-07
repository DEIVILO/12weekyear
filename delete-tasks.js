const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllTasks() {
  try {
    console.log('Deleting all tasks...');
    const result = await prisma.task.deleteMany({});
    console.log(`Deleted ${result.count} tasks successfully!`);

    // Also reset any sequences if needed
    process.exit(0);
  } catch (error) {
    console.error('Error deleting tasks:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllTasks();
