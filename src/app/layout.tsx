import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "PyQuiz - Python Exam Practice Platform",
  description: "Practice Python-II exam questions chapter-wise with MCQs, coding challenges, AI feedback, and progress tracking.",
  keywords: "Python, quiz, exam, practice, MCQ, coding, LJU, semester",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg)]" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
