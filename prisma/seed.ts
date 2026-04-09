import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@pyquiz.com',
      passwordHash: adminHash,
      displayName: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user created: ${admin.username}`);

  // Create demo student
  const studentHash = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { username: 'student' },
    update: {},
    create: {
      username: 'student',
      email: 'student@pyquiz.com',
      passwordHash: studentHash,
      displayName: 'Demo Student',
      role: 'STUDENT',
    },
  });
  console.log(`✅ Student user created: ${student.username}`);

  // Load parsed questions
  const dataPath = path.join(process.cwd(), 'data', 'questions.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);

  // Seed chapters
  console.log('📚 Seeding chapters...');
  for (const ch of data.chapters) {
    await prisma.chapter.upsert({
      where: { id: ch.id },
      update: {
        title: ch.title,
        termExam: ch.termExam,
        questionCount: ch.questionCount,
        mcqCount: ch.mcqCount,
        codingCount: ch.codingCount,
        theoryCount: ch.theoryCount,
      },
      create: {
        id: ch.id,
        number: ch.number,
        title: ch.title,
        termExam: ch.termExam,
        questionCount: ch.questionCount,
        mcqCount: ch.mcqCount,
        codingCount: ch.codingCount,
        theoryCount: ch.theoryCount,
      },
    });
  }
  console.log(`✅ ${data.chapters.length} chapters seeded`);

  // Seed questions
  console.log('❓ Seeding questions...');
  let qCount = 0;
  for (const q of data.questions) {
    const question = await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        srNo: q.srNo,
        chapterId: q.unit,
        type: q.type,
        questionText: q.questionText,
        marks: q.marks,
        previousYear: q.previousYear || null,
        difficulty: q.difficulty || null,
        published: true,
        confidence: q.confidence,
        rawExtracted: q.rawExtracted || q.questionText,
        pageNumber: q.pageNumber,
      },
    });

    // Seed MCQ options
    if (q.type === 'MCQ' && q.options && q.options.length > 0) {
      for (const opt of q.options) {
        await prisma.mCQOption.create({
          data: {
            questionId: question.id,
            label: opt.label,
            text: opt.text,
            isCorrect: opt.label === q.answer.toUpperCase(),
          },
        });
      }

      // Create MCQ verification record
      if (q.answer) {
        await prisma.mCQVerification.upsert({
          where: { questionId: question.id },
          update: {},
          create: {
            questionId: question.id,
            bookAnswer: q.answer.toUpperCase(),
            aiVerification: 'PENDING',
          },
        });
      }
    }

    qCount++;
    if (qCount % 50 === 0) {
      console.log(`  ... ${qCount}/${data.questions.length} questions seeded`);
    }
  }
  console.log(`✅ ${qCount} questions seeded`);

  console.log('\n🎉 Seed completed successfully!');
  console.log(`   Users: 2 (admin + student)`);
  console.log(`   Chapters: ${data.chapters.length}`);
  console.log(`   Questions: ${qCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
