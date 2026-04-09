import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getTermLabel(term: number): string {
  const labels: Record<number, string> = {
    1: 'Term Exam 1',
    2: 'Term Exam 2',
    3: 'Term Exam 3',
    4: 'Term Exam 4',
  };
  return labels[term] || `Term ${term}`;
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'EASY': return 'text-green-600 bg-green-50 border-green-200';
    case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'HARD': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getMasteryColor(mastery: number): string {
  if (mastery >= 80) return 'text-green-600';
  if (mastery >= 60) return 'text-blue-600';
  if (mastery >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

export function getMasteryLabel(mastery: number): string {
  if (mastery >= 80) return 'Mastered';
  if (mastery >= 60) return 'Proficient';
  if (mastery >= 40) return 'Learning';
  return 'Needs Practice';
}
