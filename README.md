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

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm

### Setup

```bash
# Navigate to the project
cd pyquiz

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (503 questions + demo users)
npm run seed

# Start dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

## Deployment to Render.com

Hi Shubhra! Since we are using an SQLite database with Prisma, deploying to services like Render requires configuring a **Persistent Disk**. Otherwise, your database will be wiped every time the server restarts.

Follow these exact steps to deploy PyQuiz on Render:

### 1. Create a Web Service
1. Push your full repository to GitHub.
2. In your Render Dashboard, click **New+** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure the following basic settings:
   - **Environment:** `Node`
   - **Build Command:** `bash build.sh`
   - **Start Command:** `npx prisma migrate deploy && npm start`

### 2. Add a Persistent Disk (Crucial!)
1. Scroll down to the **Advanced** section.
2. Click **Add Disk**.
3. Set the following details:
   - **Name:** database_disk
   - **Mount Path:** `/data`
   - **Size:** 1 GB (Free tier compatible)

### 3. Add Environment Variables
Under the **Environment Variables** section, add the following variables:

| Key | Value | Purpose |
|-----|-------|---------|
| `DATABASE_URL` | `file:/data/pyquiz.db` | Points Prisma to the persistent disk! |
| `NEXTAUTH_SECRET` | `[generate a random string]` | Security key for logins. |
| `NEXTAUTH_URL` | `https://your-render-url.onrender.com` | Your live website URL. |
| `GEMINI_API_KEY` | `your_google_ai_key` | Required for AI MCQs & Code Reviews. |

### 4. Deploy & Seed
Click **Create Web Service**. Render will now run `build.sh` and start your app.

Once your app is successfully running, the database will be created but totally empty. We need to populate it with all 538 questions:
1. In the Render Dashboard for your web service, click on the **Shell** tab (on the left menu).
2. Type and run the following command to securely seed your production database:
   ```bash
   npm run seed
   ```
3. Your platform is now fully deployed and populated!

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

For educational use. Practice book content belongs to L.J. University.
