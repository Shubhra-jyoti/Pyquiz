-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "termExam" INTEGER NOT NULL,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "mcqCount" INTEGER NOT NULL DEFAULT 0,
    "codingCount" INTEGER NOT NULL DEFAULT 0,
    "theoryCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "srNo" INTEGER NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "marks" INTEGER NOT NULL DEFAULT 1,
    "previousYear" TEXT,
    "difficulty" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "confidence" REAL NOT NULL DEFAULT 1.0,
    "rawExtracted" TEXT,
    "pageNumber" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    CONSTRAINT "Question_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MCQOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MCQOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MCQVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "bookAnswer" TEXT NOT NULL,
    "aiVerification" TEXT NOT NULL DEFAULT 'PENDING',
    "aiExplanation" TEXT,
    "adminApproved" BOOLEAN NOT NULL DEFAULT false,
    "adminFinalAnswer" TEXT,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    CONSTRAINT "MCQVerification_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "code" TEXT,
    "output" TEXT,
    "isCorrect" BOOLEAN,
    "selectedOption" TEXT,
    "aiFeedback" TEXT,
    "aiScore" REAL,
    "timeTaken" INTEGER,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Submission_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "chapterId" INTEGER,
    "termExam" INTEGER,
    "totalQuestions" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "score" REAL NOT NULL DEFAULT 0,
    "timeTaken" INTEGER,
    "timed" BOOLEAN NOT NULL DEFAULT false,
    "timeLimit" INTEGER,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "timeTaken" INTEGER,
    CONSTRAINT "QuizResponse_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "QuizAttempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgressSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "mcqAccuracy" REAL NOT NULL DEFAULT 0,
    "codingAccuracy" REAL NOT NULL DEFAULT 0,
    "totalAttempted" INTEGER NOT NULL DEFAULT 0,
    "totalCorrect" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastPracticed" DATETIME,
    "mastery" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgressSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProgressSnapshot_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bookmark_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminReviewLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "questionId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminReviewLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_number_key" ON "Chapter"("number");

-- CreateIndex
CREATE INDEX "Question_chapterId_idx" ON "Question"("chapterId");

-- CreateIndex
CREATE INDEX "Question_type_idx" ON "Question"("type");

-- CreateIndex
CREATE INDEX "Question_srNo_idx" ON "Question"("srNo");

-- CreateIndex
CREATE INDEX "MCQOption_questionId_idx" ON "MCQOption"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "MCQVerification_questionId_key" ON "MCQVerification"("questionId");

-- CreateIndex
CREATE INDEX "Submission_userId_idx" ON "Submission"("userId");

-- CreateIndex
CREATE INDEX "Submission_questionId_idx" ON "Submission"("questionId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");

-- CreateIndex
CREATE INDEX "QuizResponse_attemptId_idx" ON "QuizResponse"("attemptId");

-- CreateIndex
CREATE INDEX "ProgressSnapshot_userId_idx" ON "ProgressSnapshot"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressSnapshot_userId_chapterId_key" ON "ProgressSnapshot"("userId", "chapterId");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_questionId_key" ON "Bookmark"("userId", "questionId");

-- CreateIndex
CREATE INDEX "AdminReviewLog_adminId_idx" ON "AdminReviewLog"("adminId");
