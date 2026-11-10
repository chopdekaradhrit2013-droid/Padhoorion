const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PadhoOrion database with Vintage Paper theme...');

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

  const studentHash = bcrypt.hashSync('Student@123', 10);
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

  // 2. Create Students across grades
  const adhrit = await prisma.user.create({
    data: {
      username: 'kabir_sharma',
      email: 'kabir@padhoorion.edu',
      passwordHash: studentHash,
      grade: '7th Grade',
      role: 'STUDENT',
      isVerified: true,
      bio: 'Enthusiastic math & science learner. Loves sharing clean handwritten notes!',
    },
  });

  const aarav = await prisma.user.create({
    data: {
      username: 'aarav_sharma',
      email: 'aarav@padhoorion.edu',
      passwordHash: studentHash,
      grade: '9th Grade',
      role: 'STUDENT',
      isVerified: true,
      bio: '9th Grade science captain. Sharing physics worksheets and formula charts.',
    },
  });

  const ananya = await prisma.user.create({
    data: {
      username: 'ananya_m',
      email: 'ananya@padhoorion.edu',
      passwordHash: studentHash,
      grade: '8th Grade',
      role: 'STUDENT',
      isVerified: true,
      bio: 'Biology lover & history buff. Always keeping organized notebooks.',
    },
  });

  const rohan = await prisma.user.create({
    data: {
      username: 'rohan_gupta',
      email: 'rohan@padhoorion.edu',
      passwordHash: studentHash,
      grade: '10th Grade',
      role: 'STUDENT',
      isVerified: true,
      bio: 'Preparing for board exams. Computer Science and Mathematics enthusiast.',
    },
  });

  const diya = await prisma.user.create({
    data: {
      username: 'diya_patel',
      email: 'diya@padhoorion.edu',
      passwordHash: studentHash,
      grade: '6th Grade',
      role: 'STUDENT',
      isVerified: true,
      bio: 'New to middle school! Excited to learn from seniors and contribute.',
    },
  });

  console.log('Created users.');

  // 3. Create Announcements
  const now = new Date();
  const announcement1 = await prisma.announcement.create({
    data: {
      title: 'Term 1 Mid-Year Examination Revision Exchange Is Now Live!',
      content: 'All students from 6th to 10th grade are encouraged to upload their handwritten notes, worksheets, and chapter summaries. Remember: every student has full access to explore and study across all 5 grade levels.',
      authorId: adminUser.id,
      priority: 'URGENT',
      durationOption: '7_DAYS',
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  const announcement2 = await prisma.announcement.create({
    data: {
      title: 'Community Guidelines: Always Check Confirmation Before Posting',
      content: 'To prevent duplicate or miscategorized uploads, please review the confirmation dialog specifying your destination Grade, Subject, and Category before publishing.',
      authorId: adminUser.id,
      priority: 'NORMAL',
      durationOption: 'FOREVER',
      expiresAt: null,
      isActive: true,
    },
  });

  // 4. Create Resources across Grades and Categories
  const res1 = await prisma.resource.create({
    data: {
      title: 'Linear Equations & Coordinate Geometry Complete Revision',
      description: 'Neatly organized handwritten notes covering standard forms, section formula, distance formula, and graph plotting techniques with solved examples.',
      grade: '7th Grade',
      category: 'Handwritten Notes',
      subject: 'Mathematics',
      chapter: 'Chapter 4: Linear Equations',
      topic: 'Cartesian Coordinate System & Straight Lines',
      fileUrl: '/uploads/sample-handwritten-preview.svg',
      fileName: 'linear-equations-7th.svg',
      fileType: 'image/svg+xml',
      fileSize: 45000,
      tags: 'math, geometry, linear-equations, handwritten',
      authorId: adhrit.id,
      authorGradeAtPublish: '7th Grade',
      viewsCount: 142,
      downloadsCount: 58,
    },
  });

  const res2 = await prisma.resource.create({
    data: {
      title: 'Force and Laws of Motion Comprehensive Practice Worksheet',
      description: 'Handcrafted numerical problems on Newton First, Second and Third laws of motion, momentum conservation, and friction calculations with answer key.',
      grade: '9th Grade',
      category: 'Worksheet',
      subject: 'Science',
      chapter: 'Chapter 9: Force & Laws of Motion',
      topic: 'Momentum, Impulse & Friction Numericals',
      fileUrl: '/uploads/sample-physics-worksheet.pdf',
      fileName: 'force-laws-worksheet-9th.pdf',
      fileType: 'application/pdf',
      fileSize: 128000,
      tags: 'physics, newton-laws, numericals, worksheet',
      authorId: aarav.id,
      authorGradeAtPublish: '9th Grade',
      viewsCount: 215,
      downloadsCount: 94,
    },
  });

  const res3 = await prisma.resource.create({
    data: {
      title: 'Cell: The Unit of Life - Diagrammatic Lecture Copy',
      description: 'Full class lecture notes with color diagrams of plant vs animal cells, organelles, mitochondria, nucleus, and endoplasmic reticulum.',
      grade: '8th Grade',
      category: 'Notebook',
      subject: 'Science',
      chapter: 'Chapter 8: Cell Structure & Functions',
      topic: 'Plant & Animal Organelles and Comparison',
      fileUrl: '/uploads/sample-cell-biology.pdf',
      fileName: 'cell-biology-lecture-notes.pdf',
      fileType: 'application/pdf',
      fileSize: 210000,
      tags: 'biology, cells, diagrams, lecture-copy',
      authorId: ananya.id,
      authorGradeAtPublish: '8th Grade',
      viewsCount: 189,
      downloadsCount: 76,
    },
  });

  const res4 = await prisma.resource.create({
    data: {
      title: 'French Revolution Mindmap & Cause-Effect Analysis',
      description: 'AI-assisted structured study guide breaking down the Estates General, Storming of Bastille, Reign of Terror, and Rise of Napoleon.',
      grade: '9th Grade',
      category: 'AI Notes',
      subject: 'Social Studies',
      chapter: 'History Chapter 1: French Revolution',
      topic: 'Timeline, Causes, and Constitutional Monarchies',
      fileUrl: '/uploads/sample-history-notes.pdf',
      fileName: 'french-revolution-ai-notes.pdf',
      fileType: 'application/pdf',
      fileSize: 155000,
      tags: 'history, french-revolution, mindmap, ai-summary',
      authorId: aarav.id,
      authorGradeAtPublish: '9th Grade',
      viewsCount: 174,
      downloadsCount: 63,
    },
  });

  const res5 = await prisma.resource.create({
    data: {
      title: 'Triangles & Congruence Criteria - 50 Solved Board Q&A',
      description: 'Collection of last 5 years past school examination questions with step-by-step SAS, SSS, ASA, and RHS proofs.',
      grade: '7th Grade',
      category: 'Q&A',
      subject: 'Mathematics',
      chapter: 'Chapter 7: Congruence of Triangles',
      topic: 'Proof writing & Criteria Applications',
      fileUrl: '/uploads/sample-geometry-qa.pdf',
      fileName: 'congruence-triangles-qa.pdf',
      fileType: 'application/pdf',
      fileSize: 182000,
      tags: 'triangles, proofs, solved-papers, exam-prep',
      authorId: adhrit.id,
      authorGradeAtPublish: '7th Grade',
      viewsCount: 310,
      downloadsCount: 135,
    },
  });

  const res6 = await prisma.resource.create({
    data: {
      title: 'English Tenses, Voices & Direct-Indirect Speech Handouts',
      description: 'Reference rules, conversion tables, common student pitfalls, and 30 sentence transformation drills with answers.',
      grade: '7th Grade',
      category: 'Notebook',
      subject: 'English',
      chapter: 'Grammar Unit 3: Verb Forms and Speech',
      topic: 'Active Passive & Reported Speech',
      fileUrl: '/uploads/sample-english-grammar.pdf',
      fileName: 'english-grammar-tenses.pdf',
      fileType: 'application/pdf',
      fileSize: 98000,
      tags: 'grammar, english, tenses, speech',
      authorId: adhrit.id,
      authorGradeAtPublish: '7th Grade',
      viewsCount: 95,
      downloadsCount: 41,
    },
  });

  const res7 = await prisma.resource.create({
    data: {
      title: 'Python Programming Basics, Loops & Algorithmic Flowcharts',
      description: 'Clean syntax guide for Class 10 computer science, covering conditional branching, for/while loops, lists, and string slicing.',
      grade: '10th Grade',
      category: 'AI Notes',
      subject: 'Computer Science',
      chapter: 'Chapter 2: Python Fundamentals',
      topic: 'Control Flow, Iteration & Data Structures',
      fileUrl: '/uploads/sample-computer-science.pdf',
      fileName: 'python-basics-class10.pdf',
      fileType: 'application/pdf',
      fileSize: 140000,
      tags: 'python, coding, algorithms, computer-science',
      authorId: rohan.id,
      authorGradeAtPublish: '10th Grade',
      viewsCount: 280,
      downloadsCount: 120,
    },
  });

  const res8 = await prisma.resource.create({
    data: {
      title: 'Plant Photosynthesis, Light & Dark Reactions Summary Copy',
      description: 'Detailed breakdown of chloroplast structure, thylakoids, Calvin cycle, factors affecting photosynthesis, and experimental verifications.',
      grade: '7th Grade',
      category: 'Handwritten Notes',
      subject: 'Science',
      chapter: 'Chapter 1: Nutrition in Plants',
      topic: 'Photosynthesis Mechanism & Experiments',
      fileUrl: '/uploads/sample-photosynthesis.pdf',
      fileName: 'photosynthesis-handwritten.pdf',
      fileType: 'application/pdf',
      fileSize: 112000,
      tags: 'biology, photosynthesis, plants, revision',
      authorId: adhrit.id,
      authorGradeAtPublish: '7th Grade',
      viewsCount: 160,
      downloadsCount: 72,
    },
  });

  const res9 = await prisma.resource.create({
    data: {
      title: 'Ancient Civilizations: Indus Valley & Mesopotamia Notes',
      description: 'Town planning, drainage systems, Great Bath, seals, trade relations, and religious beliefs comparison chart.',
      grade: '6th Grade',
      category: 'Notebook',
      subject: 'Social Studies',
      chapter: 'History Chapter 3: Early Cities',
      topic: 'Indus Valley Architecture & Artifacts',
      fileUrl: '/uploads/sample-history-notes.pdf',
      fileName: 'early-cities-6th.pdf',
      fileType: 'application/pdf',
      fileSize: 130000,
      tags: 'history, indus-valley, town-planning, 6th-grade',
      authorId: diya.id,
      authorGradeAtPublish: '6th Grade',
      viewsCount: 88,
      downloadsCount: 30,
    },
  });

  // 5. Create Comments & Threaded Replies
  // Testing requirement:
  // "Display commenter usernames and commenter grade tags: Adhrit [7th Grade]"
  const comment1 = await prisma.comment.create({
    data: {
      content: 'These linear equation graph points are crystal clear! The section formula breakdown saved me in today’s unit test.',
      resourceId: res1.id,
      authorId: aarav.id,
      authorGradeAtPublish: '9th Grade',
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Glad it helped you Aarav! Make sure to remember the signs when dealing with negative coordinates.',
      resourceId: res1.id,
      authorId: adhrit.id,
      authorGradeAtPublish: '7th Grade',
      parentId: comment1.id, // Threaded reply!
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: 'Can someone explain problem #4 on momentum conservation? Does the mass of the bullet need to be converted to kg first?',
      resourceId: res2.id,
      authorId: ananya.id,
      authorGradeAtPublish: '8th Grade',
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Yes Ananya! Always convert grams to kilograms (divide by 1000) so the velocity stays in m/s and momentum in kg·m/s.',
      resourceId: res2.id,
      authorId: aarav.id,
      authorGradeAtPublish: '9th Grade',
      parentId: comment2.id, // Threaded reply!
    },
  });

  // 6. Create Likes & Bookmarks
  await prisma.like.create({
    data: {
      userId: aarav.id,
      resourceId: res1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: ananya.id,
      resourceId: res1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: rohan.id,
      resourceId: res1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: adhrit.id,
      resourceId: res2.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: adhrit.id,
      resourceId: res7.id,
    },
  });

  await prisma.bookmark.create({
    data: {
      userId: adhrit.id,
      resourceId: res2.id,
    },
  });

  await prisma.bookmark.create({
    data: {
      userId: adhrit.id,
      resourceId: res7.id,
    },
  });

  await prisma.bookmark.create({
    data: {
      userId: aarav.id,
      resourceId: res1.id,
    },
  });

  // 7. Create Activities for Adhrit and others
  await prisma.activity.create({
    data: {
      userId: adhrit.id,
      type: 'UPLOAD',
      title: 'Uploaded Handwritten Notes',
      description: 'Linear Equations & Coordinate Geometry Complete Revision',
      gradeAtTime: '7th Grade',
      targetId: res1.id,
    },
  });

  await prisma.activity.create({
    data: {
      userId: adhrit.id,
      type: 'UPLOAD',
      title: 'Uploaded Q&A Solved Paper',
      description: 'Triangles & Congruence Criteria - 50 Solved Board Q&A',
      gradeAtTime: '7th Grade',
      targetId: res5.id,
    },
  });

  await prisma.activity.create({
    data: {
      userId: adhrit.id,
      type: 'COMMENT',
      title: 'Replied to discussion',
      description: 'Clarified coordinate signs on Linear Equations discussion',
      gradeAtTime: '7th Grade',
      targetId: res1.id,
    },
  });

  // 8. Notifications
  await prisma.notification.create({
    data: {
      userId: adhrit.id,
      actorId: aarav.id,
      type: 'COMMENT',
      title: 'New comment on your notes',
      message: 'aarav_sharma commented on "Linear Equations & Coordinate Geometry"',
      link: `/resource/${res1.id}`,
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: adhrit.id,
      actorId: adminUser.id,
      type: 'ANNOUNCEMENT',
      title: 'School Announcement',
      message: 'Term 1 Mid-Year Examination Revision Exchange Is Now Live!',
      link: '/',
      isRead: true,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

