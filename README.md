# PyQuiz - Python Exam Practice Platform

A full-stack quiz and coding practice platform for college Python-II (Sem IV) exam preparation. Built with Next.js, Prisma, SQLite, and Tailwind CSS.

## Features

- **503+ Questions** extracted from the LJU Python-II Practice Book
- **366 MCQs** with instant scoring and answer review
- **136 Coding Questions** with in-browser Python execution (Pyodide)
- **10 Chapters** across **4 Term Exams**
- **Quiz Modes**: Chapter-wise, Term-wise, Mock, Retry Incorrect
- **Timed & Untimed** practice modes
- **Progress Tracking**: Chapter mastery, accuracy trends, term readiness
- **Bookmarks**: Save difficult questions for later review
- **Admin Panel**: Question editor, review queue, user management
- **AI Integration Ready**: Provider abstraction for MCQ verification, code review
- **Secure Auth**: JWT-based authentication with bcrypt password hashing
- **Blue & White Theme**: Clean, professional, responsive UI

## Getting Started

### Local Development Setup

To run PyQuiz on your local machine:

```bash
# 1. Clone the repository
git clone https://github.com/Shubhra-jyoti/Pyquiz.git
cd Pyquiz

# 2. Install dependencies
npm install

# 3. Apply the database schema
npx prisma db push --accept-data-loss

# 4. Seed the database with Practice Book content
npm run seed

# 5. Start the local server
npm run dev
```

Open **http://localhost:3000** in your browser.

## Cloud Deployment (Render / Vercel)

This application uses a PostgreSQL database. To deploy it to a platform like Render:
1. Create a free PostgreSQL database (e.g., using Neon.tech or Supabase).
2. Set the `DATABASE_URL` environment variable to your new database string.
3. Configure your Build Command: `bash build.sh`
4. Configure your Start Command: `npm start`
5. Make sure to define `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `GEMINI_API_KEY` for secure operations.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | SQLite (via Prisma ORM) |
| Auth | Custom JWT + bcrypt |
| Code Execution | Pyodide (Python in browser via WASM) |
| Icons | Lucide React |

## Project Structure

```
pyquiz/
├── prisma/
│   ├── schema.prisma      # Database schema (13 models)
│   ├── seed.ts             # Seed script (503 questions)
│   └── migrations/
├── data/
│   ├── questions.json      # Parsed PDF questions
│   └── chapters.json       # Chapter metadata
├── src/
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── login/              # Login
│   │   ├── register/           # Register
│   │   ├── dashboard/          # Student dashboard
│   │   ├── quiz/
│   │   │   ├── setup/          # Quiz configuration
│   │   │   └── [id]/           # Quiz taking + review
│   │   ├── practice/coding/    # Coding questions
│   │   │   └── [id]/           # Code editor
│   │   ├── progress/           # Performance analytics
│   │   ├── bookmarks/          # Saved questions
│   │   ├── admin/
│   │   │   ├── questions/      # Question manager
│   │   │   ├── review/         # AI conflict review
│   │   │   └── users/          # User management
│   │   └── api/                # API routes (20+)
│   ├── components/layout/      # Navbar
│   ├── lib/
│   │   ├── db.ts               # Prisma client
│   │   ├── auth.ts             # JWT auth utilities
│   │   ├── auth-context.tsx    # React auth context
│   │   └── utils.ts            # Utility functions
│   └── types/index.ts          # TypeScript types
└── parsing/
    └── extract.py              # PDF parser (Python)
```

## Database Schema

13 models: User, Chapter, Question, MCQOption, MCQVerification, Submission, QuizAttempt, QuizResponse, ProgressSnapshot, Bookmark, AdminReviewLog

## API Routes

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login  
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Questions & Quiz
- `GET /api/questions` - List/search questions
- `GET /api/chapters` - List chapters
- `POST /api/quiz/start` - Start quiz
- `POST /api/quiz/submit` - Submit quiz (auto-scores + updates progress)
- `GET /api/quiz/attempts` - Quiz history

### Progress & Bookmarks
- `GET /api/progress` - Progress with term readiness
- `POST /api/bookmarks` - Toggle bookmark
- `GET /api/bookmarks` - Get bookmarks
- `POST /api/submissions` - Submit code

### Admin
- `GET /api/admin/stats` - Platform stats
- `PATCH /api/admin/questions` - Edit questions
- `GET/PATCH /api/admin/review` - Review queue
- `GET /api/admin/users` - User list

## Chapter Breakdown

| Unit | Topic | MCQs | Coding | Term |
|------|-------|------|--------|------|
| 1 | Pandas - Data Cleaning & Manipulation | 54 | 24 | 1 |
| 2 | Data Visualization | 56 | 21 | 1 |
| 3 | NumPy & Data Processing | 19 | 3 | 1 |
| 4 | Machine Learning Basics | 21 | 14 | 2 |
| 5 | ML Algorithms (kNN, SVM, Decision Trees) | 67 | 17 | 2 |
| 6 | Deep Learning & Keras | 15 | 2 | 2 |
| 7 | Web Scraping & APIs | 37 | 27 | 3 |
| 8 | Django Basics | 22 | 12 | 3 |
| 9 | Django Forms & Authentication | 21 | 7 | 4 |
| 10 | Django REST Framework | 54 | 9 | 4 |

## Security

- JWT tokens in httpOnly cookies
- bcrypt password hashing (12 rounds)
- Prisma parameterized queries (SQL injection safe)
- React auto-escaping (XSS safe)
- Role-based access control (STUDENT/ADMIN)
- Input validation on all API routes
- Code execution sandboxed in browser (Pyodide WASM)

## AI Integration (Ready for Extension)

The platform is structured for AI provider integration:
- `src/lib/ai/provider.ts` - Provider abstraction
- MCQ answer verification
- Code review and feedback
- Progress coaching
- Add your Gemini/OpenAI/Claude API key to `.env`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

*Disclaimer: Practice book content used for educational logic belongs to L.J. University.*

