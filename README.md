# NextHire — AI-Powered Recruitment Platform

### AI-Powered Recruitment, Reimagined
**Built by Kushagra Gupta**

NextHire is a modern, premium recruitment ecosystem designed to bridge the gap between candidates and recruiters using state-of-the-art AI. It leverages high-performance LLMs and vector databases to automate resume analysis, semantic job matching, and applicant ranking.

---

## 🚀 Core Features

- **🤖 AI Job Recommendations**: Professional candidates receive personalized job matches with detailed match scores and reasoning, powered by **Groq (LLaMA 3.3 70B)**.
- **⚡ Pinecone Matching Engine**: High-speed semantic search using **Pinecone Vector Database** for sub-second similarity matching between resumes and job requirements.
- **🏆 Applicant Ranking**: Recruiters can instantly identify top talent with candidates automatically sorted by AI relevance scores.
- **🌗 Role-based Dashboards**: Completely separate, tailored experiences for **Candidates** (job tracking, resume status) and **Recruiters** (applicant pipeline, hiring metrics).
- **📄 Resume Intelligence**: Automated PDF text extraction and processing to feed the AI matching engine.
- **💬 Streaming AI Chatbot**: A role-aware, persistent assistant (Groq-powered) that provides real-time help for both recruiters and candidates with a sleek streaming interface.
- **🏢 Enterprise Org Management**: Multi-tenant architecture for managing multiple organizations and collaborative hiring.
- **🔐 Secure Authentication**: Full integration with **Clerk** (OAuth, Hooks, Webhooks) for robust user and organization lifecycle management.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **AI / Search**: Groq (LLaMA 3.3 70B), Pinecone (Vector DB), @xenova/transformers (Local Embeddings)
- **Database**: PostgreSQL (via [Neon](https://neon.tech/))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Clerk](https://clerk.com/)
- **UI & Experience**: Tailwind CSS, [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), Lucide Icons
- **Animation**: Framer Motion / CSS Transitions for premium SaaS feel

---

## 📡 Database Architecture

The schema is optimized for speed and semantic search:
- **Users / Organizations**: Core identity management synchronized via webhooks.
- **Job Listings**: Metadata-rich listings for high-precision matching.
- **Applications**: Central hub for status tracking, AI scores, and recruiter feedback.
- **User Resumes**: Parsed and vectorized resume storage for the AI engine.

---

## ⚙️ Environment Variables

Create a `.env.local` file with the following configuration:

```env
# Database
DATABASE_URL=your_postgresql_url

# AI & Vector Services
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret

# Auth Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
```

---

## 🛠️ Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Database Setup**:
   ```bash
   npm run db:push
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

---

*Build with passion for a faster hiring future.*
