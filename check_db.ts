import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const p = new PrismaClient();

async function main() {
  const users = await p.user.count();
  const chapters = await p.chapter.count();
  const questions = await p.question.count();
  const options = await p.mCQOption.count();
  const verifs = await p.mCQVerification.count();
  console.log('Database status:');
  console.log({ users, chapters, questions, options, verifications: verifs });
  
  if (users > 0) {
    const allUsers = await p.user.findMany({ select: { username: true, role: true } });
    console.log('Users:', allUsers);
  }
  
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
