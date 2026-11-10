const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PadhoOrion clean production database...');

  // Clean existing data
  await prisma.activity.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.user.deleteMany({});

  const adminHash = bcrypt.hashSync('HALAMADRID123', 10);

  // 1. Create Administrator
  const adminUser = await prisma.user.create({
    data: {
      username: 'Adhrit',
      email: 'chopdekaradhrit2013@gmail.com',
      passwordHash: adminHash,
      grade: '10th Grade',
      role: 'ADMIN',
      isVerified: true,
      bio: 'Administrator of PadhoOrion school community.',
    },
  });

  // 2. Official Community Announcements
  await prisma.announcement.create({
    data: {
      title: 'Term 1 Mid-Year Examination Revision Exchange Is Now Live!',
      content: 'All students from 6th to 10th grade are encouraged to upload their handwritten notes, worksheets, and chapter summaries. Remember: every student has full access to explore and study across all 5 grade levels.',
      priority: 'URGENT',
      durationOption: '30_DAYS',
      authorId: adminUser.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Community Guidelines: Always Check Confirmation Before Posting',
      content: 'To prevent duplicate or miscategorized uploads, please review the confirmation dialog specifying your destination Grade, Subject, and Category before publishing.',
      priority: 'NORMAL',
      durationOption: 'FOREVER',
      authorId: adminUser.id,
      expiresAt: null,
    },
  });

  console.log('Clean database seeded successfully with Administrator:', adminUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
