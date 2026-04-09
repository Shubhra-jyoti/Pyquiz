export type Role = 'STUDENT' | 'ADMIN';
export type QuestionType = 'MCQ' | 'CODING' | 'THEORY';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type VerificationStatus = 'VERIFIED' | 'POSSIBLY_INCORRECT' | 'AMBIGUOUS' | 'PENDING';
export type QuizMode = 'CHAPTER' | 'TERM' | 'MOCK' | 'RETRY' | 'MIXED';

export interface ChapterInfo {
  id: number;
  number: number;
  title: string;
  termExam: number;
  questionCount: number;
  mcqCount: number;
  codingCount: number;
  theoryCount: number;
}

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  srNo: number;
  chapterId: number;
  type: QuestionType;
  questionText: string;
  marks: number;
  previousYear?: string;
  difficulty?: Difficulty;
  published: boolean;
  confidence: number;
  pageNumber: number;
  tags?: string;
  options: QuestionOption[];
  verification?: MCQVerification;
  chapter?: ChapterInfo;
}

export interface MCQVerification {
  id: string;
  questionId: string;
  bookAnswer: string;
  aiVerification: VerificationStatus;
  aiExplanation?: string;
  adminApproved: boolean;
  adminFinalAnswer?: string;
}

export interface QuizSetupConfig {
  mode: QuizMode;
  chapterId?: number;
  termExam?: number;
  questionCount: number;
  timed: boolean;
  timeLimit?: number;
  questionType?: QuestionType;
}

export interface QuizAttemptResult {
  id: string;
  mode: QuizMode;
  totalQuestions: number;
  correctCount: number;
  score: number;
  timeTaken?: number;
  responses: QuizResponseResult[];
}

export interface QuizResponseResult {
  questionId: string;
  selectedOption?: string;
  isCorrect: boolean;
  correctAnswer?: string;
  explanation?: string;
}

export interface UserProgress {
  userId: string;
  chapters: ChapterProgress[];
  overallAccuracy: number;
  totalQuizzes: number;
  totalQuestions: number;
  streak: number;
  recentActivity: ActivityItem[];
}

export interface ChapterProgress {
  chapterId: number;
  chapterTitle: string;
  termExam: number;
  mcqAccuracy: number;
  codingAccuracy: number;
  totalAttempted: number;
  totalCorrect: number;
  mastery: number;
  lastPracticed?: string;
}

export interface ActivityItem {
  type: 'quiz' | 'coding' | 'bookmark';
  description: string;
  score?: number;
  timestamp: string;
}

export interface CodeSubmission {
  code: string;
  questionId: string;
  output?: string;
}

export interface AICodeReview {
  isCorrect: boolean;
  score: number;
  feedback: string;
  issues: string[];
  improvements: string[];
  edgeCases: string[];
}

export interface AISolution {
  code: string;
  explanation: string;
}

export interface AICoachInsight {
  summary: string;
  weakChapters: number[];
  recommendation: string;
  motivation: string;
  termReadiness: Record<number, number>;
}
