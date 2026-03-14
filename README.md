# NextHire — AI-Powered Job Board

NextHire is a modern recruitment platform designed to bridge the gap between candidates and recruiters using cutting-edge AI. It streamlines the application process with automated resume analysis and provides a seamless dashboard for managing the recruitment lifecycle.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: PostgreSQL (via [Neon](https://neon.tech/))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **AI Engine**: [Groq AI](https://groq.com/) (Meta LLaMA 3.3 70B model)
- **UI & Styling**: Tailwind CSS v4, [Radix UI](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Form Management**: React Hook Form + Zod
- **Infrastructure**: Docker & Vercel-ready

## 📁 Project Structure & Routes

### User Routes
- `/` - Landing page with product overview.
- `/jobs` - Marketplace for discovering open positions with search and filtering.
- `/jobs/[id]` - Detailed job description and application portal.
- `/applications` - Candidate portal to track submitted applications and AI feedback.
- `/dashboard` - Overview of user activity and notifications.
- `/user-profile` - Manage personal information and default resumes.
- `/settings` - General account and notification preferences.

### Organization & Recruiter Routes
- `/organizations/new` - Setup a new hiring organization.
- `/organizations/[id]` - Dashboard for organization admins.
- `/organizations/[id]/jobs` - Manage active job listings and review candidates.
- `/organizations/[id]/settings` - Configure organization details and branding.

### Auth Routes
- `/sign-in` & `/sign-up` - Secure authentication flows via Clerk.

## 🛠️ Features

- **AI Resume Analysis**: Automatically evaluates candidate resumes against job descriptions to provide a match score and skill gap analysis.
- **PDF Text Extraction**: Seamlessly extracts content from uploaded PDF resumes for instant analysis.
- **Organization Management**: Multi-tenant architecture allowing users to create and manage multiple hiring organizations.
- **Real-time Synchronization**: Clerk webhooks ensure user and organization data is always in sync with the database.
- **Responsive Dashboard**: Premium sidebar-based navigation for a professional management experience.
- **Job Discovery**: Advanced filtering and search capabilities for candidates.

## 📡 API Routes

- `POST /api/webhooks/clerk` - Secure endpoint for processing Clerk webhook events (user creation, updates, and organization syncing).

## 🗄️ Database Schema

The database is built on PostgreSQL with the following core tables:

- **Users (`users`)**: Stores core user identity and profile data.
- **Organizations (`organizations`)**: Contains company details and branding.
- **Job Listings (`job_listings`)**: Stores position details, requirements, and status.
- **Applications (`job_listing_applications`)**: Tracks candidate submissions, including AI-generated scores and feedback.
- **User Resumes (`user_resumes`)**: Stores parsed resume text and file references.
- **Notification Settings (`user_notification_settings`)**: User preferences for email and system alerts.
- **Org User Settings (`organization_user_settings`)**: Manages the relationship and roles between users and organizations.

## ⚙️ Environment Variables

A `.env.local` file is required with the following keys:

```env
# Database
DATABASE_URL=your_postgresql_url

# AI Services
GROQ_API_KEY=your_groq_api_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret

# Auth Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/
```

## 🛠️ Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env.local` file based on the section above.

3. **Push Database Schema**:
   ```bash
   npm run db:push
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
