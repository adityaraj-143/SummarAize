# SummarAize

> AI-Powered PDF Summarization — Save hours of reading time. Transform lengthy PDFs into clear, accurate summaries in seconds.

Upload a PDF, get an AI-generated summary, and ask follow-up questions against the document using semantic search.

---

## Features

- **PDF Upload** — Drag-and-drop or click-to-browse upload via UploadThing (up to 32 MB).
- **Dual PDF Modes** — Choose **Digital** (text + embedded images) or **Scanned / Handwritten** (full OCR via Gemini 2.5 Flash).
- **AI Summary** — Google Gemini generates a topic-organized summary with page references. Large PDFs are split intelligently using page-boundary heuristics (ALL-CAPS headings, sentence completion) and merged for thorough coverage.
- **Chat with Your Document** — Ask questions about the PDF. The system retrieves relevant sections via Pinecone vector search and answers using Gemini.
- **Semantic Search** — PDF text is chunked, embedded (`gemini-embedding-001`, 2048 dimensions), and stored in Pinecone for context-aware Q&A.
- **Dashboard** — Browse all your previously summarized documents with search and category filters.
- **Authentication** — Clerk handles sign-in/sign-up with Google OAuth and email.
- **Dark Theme** — Default dark mode via `next-themes` and Clerk's shadcn theme.

---

## Architecture

```
User Uploads PDF
       │
       ▼
  ┌─────────────┐     ┌──────────────┐
  │ UploadThing  │────▶│  Neon (SQL)  │
  │ (file store) │     │ summaries +  │
  └─────────────┘     │ chats + msgs │
       │              └──────────────┘
       ▼
  ┌─────────────┐
  │  LangChain  │──── PDF text extraction
  │  PDFLoader  │
  └──────┬──────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│ Gemini │ │ Pinecone │
│summary │ │ vectors  │
└────────┘ └──────────┘
                │
       ┌────────┘
       ▼
  ┌─────────────┐     ┌──────────────┐
  │  Chat Q&A   │────▶│  Gemini Chat │
  │ (context    │     │  (Vercel AI  │
  │  retrieval) │     │   SDK)       │
  └─────────────┘     └──────────────┘
```

### Flow

1. User uploads a PDF via the landing page, selecting **Digital** or **Scanned** mode.
2. File is stored on **UploadThing**.
3. The server extracts text:
   - **Digital mode**: LangChain PDFLoader extracts text; embedded images are OCR'd via Google Gemini 2.5 Flash.
   - **Scanned mode**: Full-page OCR via Gemini 2.5 Flash.
4. Pages are tagged with `[Page N]` markers for topic-boundary detection.
5. **Concurrently**:
   - Gemini generates a summary (topic-organized, with page references). Large PDFs are chunked at natural boundaries and merged.
   - PDF text is split, embedded, and upserted into **Pinecone** (namespaced by file key).
6. A new chat room is created in Neon (`chats` + `messages` tables).
7. User is redirected to `/chat/{chat_id}` where they can view the summary (rendered as markdown) and ask questions.
8. Questions are answered by retrieving relevant Pinecone chunks, injecting them as context, and querying Gemini.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (Turbopack) |
| Language | [TypeScript](https://www.typescriptlang.org/) (strict mode) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Lucide](https://lucide.dev/) |
| Auth | [Clerk](https://clerk.com/) |
| Database | [Neon](https://neon.tech/) (serverless PostgreSQL) |
| Vector DB | [Pinecone](https://www.pinecone.io/) |
| File Storage | [UploadThing](https://uploadthing.com/) |
| AI | [Google Gemini](https://ai.google.dev/) (summaries + embeddings + chat) |
| AI SDK | [Vercel AI SDK](https://sdk.vercel.ai/) (`ai`, `@ai-sdk/google`) |
| PDF Parsing | [LangChain PDFLoader](https://js.langchain.com/) + `pdfjs-dist` (image detection in PDFs) |
| Client State | [TanStack React Query](https://tanstack.com/query/latest) + [Axios](https://axios-http.com/) |
| Validation | [Zod](https://zod.dev/) |
| Toasts | [Sonner](https://sonner.emilkowal.ski/) |
| Deployment | Docker + AWS ECR + EC2 (GitHub Actions CI/CD) |

---

## Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- A [Neon](https://neon.tech/) PostgreSQL database
- A [Pinecone](https://www.pinecone.io/) index named `summaraize` (2048-dimensional vectors)
- [Clerk](https://clerk.com/) application (for authentication)
- [UploadThing](https://uploadthing.com/) account (for file uploads)
- [Google AI Studio](https://aistudio.google.com/) API key (for Gemini)

---

## Environment Variables

Copy `env.sample` to `.env` and fill in all values:

```env
# Clerk (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# UploadThing (https://uploadthing.com/dashboard)
UPLOADTHING_TOKEN=

# Google Gemini (https://aistudio.google.com)
GOOGLE_GENERATIVE_AI_API_KEY=

# Neon PostgreSQL (https://console.neon.tech)
NEON_DB=postgresql://...

# Pinecone (https://app.pinecone.io)
PINECONE_API_KEY=
PINECONE_HOST=
```

Additional Clerk URL config (add to `.env`):

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

---

## Database Setup

Run the schema against your Neon database:

```bash
psql "$NEON_DB" < schema.sql
```

This creates the following tables:

- `users` — Clerk user sync (with Stripe billing fields)
- `pdf_summaries` — Generated summaries per user
- `payments` — Payment records (Stripe integration placeholder)
- `chats` — Chat rooms linked to PDFs
- `messages` — Per-chat messages (role: `user` or `system`)

---

## Pinecone Setup

Create a Pinecone index:

- **Name:** `summaraize`
- **Dimensions:** `2048` (matching `gemini-embedding-001`)
- **Metric:** `cosine`

---

## Running Locally

```bash
# Install dependencies
bun install

# Start the dev server (with Turbopack)
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Production Build

```bash
bun run build
bun run start
```

### Docker

```bash
docker compose up -d
```

The included `Dockerfile` uses a multi-stage build with `oven/bun:1` and produces a minimal production image.

---

## API Routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/uploadthing` | GET, POST | Yes | UploadThing file upload handler |
| `/api/create-chat` | POST | Yes | Process uploaded PDF: extract text, generate summary, index into Pinecone, create chat room |
| `/api/chat` | POST | Yes | Send a message, retrieve context, get AI response |
| `/api/get-chatroom` | GET | Yes | List all chat rooms for the current user |
| `/api/get-messages` | POST | Yes | Get all messages for a given chat |
| `/api/summaries` | GET | Yes | List all PDF summaries for the current user |
| `/api/pdf-summary` | GET | Yes | Fetch a single summary by `summary_id` |

---

## Project Structure

```
├── actions/                # Server actions (PDF processing pipeline)
├── src/
│   ├── app/
│   │   ├── (logged-in)/    # Protected dashboard
│   │   │   └── dashboard/
│   │   ├── api/            # API route handlers
│   │   │   ├── chat/
│   │   │   ├── create-chat/
│   │   │   ├── get-chatroom/
│   │   │   ├── get-messages/
│   │   │   ├── pdf-summary/
│   │   │   ├── summaries/
│   │   │   └── uploadthing/
│   │   ├── chat/[chat_id]/ # Individual chat room
│   │   ├── sign-in/        # Clerk sign-in
│   │   ├── sign-up/        # Clerk sign-up
│   │   ├── globals.css     # Global styles + CSS variables
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Landing page
│   ├── components/
│   │   ├── chat/           # Chat UI components
│   │   ├── ui/             # shadcn UI primitives
│   │   ├── upload/         # Upload form
│   │   ├── Features.tsx    # Landing page features
│   │   ├── HeroSection.tsx # Landing page hero
│   │   ├── NavBar.tsx      # Navigation bar
│   │   └── summaryCard.tsx # Dashboard summary cards
│   ├── lib/
│   │   ├── context/        # React Query provider
│   │   ├── db/             # Neon connection + Zod schemas
│   │   ├── embeddings.ts   # Gemini embedding generation
│   │   ├── findContext.ts  # Pinecone context retrieval
│   │   ├── gemini.ts       # Gemini summary generation
│   │   ├── langchain.ts    # PDF text extraction
│   │   ├── ocr.ts          # OCR pipeline (image pages + handwritten)
│   │   └── pinecone.ts     # Pinecone client + vector upsert
│   ├── middleware.ts        # Clerk auth middleware
│   ├── types/               # TypeScript interfaces
│   └── utils/               # Helpers (prompts, formatting, uploadthing)
├── schema.sql               # Full database schema
├── env.sample               # Environment template
├── Dockerfile               # Multi-stage Docker build
└── docker-compose.yml       # Docker Compose for production
```

---

## CI/CD

Pushes to `main` trigger a GitHub Actions workflow that:

1. Builds the Docker image
2. Pushes it to Amazon ECR (`ap-south-1`)
3. Deploys to EC2 via SSH with `docker compose pull && docker compose up -d`

---

## License

MIT
