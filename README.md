# StudyMate — Your Personal AI Study Partner

> **Built for the Hacktoberfest 2026 DEV Challenge: "Build for a Friend"**  
> *"Study smarter. Not harder."*

StudyMate is a production-quality, privacy-respecting AI study companion designed to solve a fundamental problem every student faces: **having mountains of PDFs, lecture slides, and notes, but struggling to identify what matters, formulate exam questions, practice active recall, and maintain a realistic revision schedule.**

Unlike generic chat wrappers, StudyMate grounds every explanation, quiz, and study schedule directly in the student's actual course material using an intelligent local RAG pipeline and **open-weight AI models** (such as **Google Gemma** via Ollama).

---

## 🌟 Key Features

| Feature | Description |
| :--- | :--- |
| 📚 **Smart Material Ingestion** | Drag-and-drop PDF documents, Markdown notes, or plain text lectures. Text is automatically cleaned, semantically chunked with overlap, and indexed. |
| 💬 **Ask StudyMate (RAG Chat)** | Ask conceptual questions grounded in your course materials. Choose between **Simple** (analogy-driven), **Detailed** (in-depth theory), or **Exam-Ready** (structured definition + points + exam tips). Expandable retrieved source chunks give full transparency. |
| 📝 **AI Quiz Generator** | Generate customizable multiple-choice tests (5, 10, or 15 questions) across Easy, Medium, or Hard difficulty. Get instant diagnostic feedback, mistake explanations, and weak-topic identification. |
| 📅 **Personalized Study Planner** | Input an upcoming exam name, target date, and available daily hours. The AI schedules day-by-day learning tasks with built-in revision checkpoints and persistent checklist tracking. |
| ⚡ **Focused Revision Mode** | Rapid pre-exam preparation featuring an interactive **flippable flashcard carousel**, key definitions glossary, common student pitfalls to avoid, and executive summaries. |
| 📊 **Progress & Analytics** | Real student analytics: study streaks, quiz accuracy trends, weak vs. strong topic breakdowns, and study time logs. |
| 🔓 **Open-Weight AI Native** | Built from the ground up for open models (Gemma, Llama, Qwen). No proprietary API locks, zero token costs after setup, and full control over your study data. |

---

## 🧠 Why Open AI?

A central tenet of StudyMate is that student tools must be accessible, private, and durable. Closed, proprietary APIs impose token quotas, sudden pricing hikes, and send sensitive student coursework to third-party servers.

StudyMate embraces an **Open-Weight Model Architecture**:

1. **True Data Privacy & Control**: Study materials, exam notes, and student query history stay on the student's own machine or self-hosted server when running local inference.
2. **Model Flexibility & Swapping**: Swap between models (e.g., `gemma2:2b`, `qwen3.5:4b`, `llama3:latest`, `mistral`) by changing a single environment variable (`AI_MODEL`). No code modifications required.
3. **Zero Marginal Cost for Students**: Once downloaded, students can run unlimited chats, quizzes, and revision sessions without worrying about API bills or rate limits.
4. **Academic Freedom & Experimentation**: Open models allow students and universities to fine-tune study partners on specific course syllabi, languages, or academic domains.
5. **No Forced Deprecations**: The models you download remain functional indefinitely.

---

## 🏗️ Architecture

```
studymate/
│
├── app/
│   ├── (pages)
│   │   ├── page.tsx               # Landing page (hero, features, open AI showcase)
│   │   ├── dashboard/page.tsx     # Student dashboard overview & quick actions
│   │   ├── materials/page.tsx     # Drag-and-drop document upload & chunk manager
│   │   ├── chat/page.tsx          # Ask StudyMate (RAG chat with mode switching)
│   │   ├── quiz/page.tsx          # Interactive quiz generator & evaluator
│   │   ├── planner/page.tsx       # AI exam roadmap & task tracker
│   │   ├── revision/page.tsx      # Flashcard carousel & revision mode
│   │   ├── progress/page.tsx      # Analytics & weak topic tracking
│   │   └── settings/page.tsx      # System health & model configuration
│   │
│   ├── api/
│   │   ├── health/route.ts        # Database & Ollama connectivity check
│   │   ├── upload/route.ts        # Multipart file parsing & document chunking
│   │   ├── materials/route.ts     # Material CRUD & text note ingestion
│   │   ├── chat/route.ts          # RAG retrieval + open-weight inference
│   │   ├── quiz/route.ts          # AI quiz generation
│   │   ├── quiz/attempt/route.ts  # Grading & weak topic analytics
│   │   ├── planner/route.ts       # AI study plan generator
│   │   ├── revision/route.ts      # Flashcard & concept synthesis
│   │   └── progress/route.ts      # Student metrics aggregation
│   │
│   ├── layout.tsx                 # Root layout with Inter font & theme
│   └── globals.css                # Tailwind CSS v4 & custom glass design system
│
├── components/
│   └── sidebar.tsx                # Responsive sidebar with active status badge
│
├── lib/
│   ├── ai/
│   │   ├── provider.ts            # AI provider interface contract
│   │   ├── ollama.ts              # Ollama client with model discovery & fallback
│   │   ├── prompts.ts             # Centralized study prompt templates
│   │   └── index.ts               # High-level AI study functions & JSON parser
│   ├── db/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   └── user.ts                # Session & student user helper
│   ├── documents/
│   │   └── processor.ts           # PDF/TXT extraction, chunking, and RAG retrieval
│   └── utils/
│       └── helpers.ts             # Formatting, validation, and styling helpers
│
├── prisma/
│   └── schema.prisma              # Database schema (PostgreSQL)
│
├── .env.example                   # Environment template
└── README.md                      # Complete documentation
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts.
- **Backend**: Next.js Server Route Handlers, Node.js v22.
- **Database & ORM**: PostgreSQL 16, Prisma ORM 6.
- **Document Processing**: `pdf-parse`, semantic chunker with sliding-window overlap.
- **AI Inference Layer**: Ollama running open-weight models (Default: `gemma2:2b` or `qwen3.5:4b` / `llama3`).

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Ollama** installed on your machine ([ollama.com](https://ollama.com))

### 2. Install & Start Ollama Open Model
Pull Google Gemma (or your preferred open model):
```bash
# Start the Ollama background daemon
ollama serve

# In a new terminal, download Gemma 2
ollama pull gemma2:2b
```

### 3. Setup PostgreSQL Database
```bash
# Create database
psql -U postgres -c "CREATE DATABASE studymate;"
```

### 4. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/studymate.git
cd studymate
npm install
```

### 5. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure your `.env` contains:
```env
DATABASE_URL="postgresql://postgres@localhost:5432/studymate"
AI_PROVIDER="ollama"
AI_MODEL="gemma2:2b"
OLLAMA_BASE_URL="http://localhost:11434"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 6. Synchronize Database Schema
```bash
npx prisma db push
```

### 7. Run the Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🧪 Testing the Application

1. **Landing Page**: Visit `http://localhost:3000` to review the product story and feature highlights.
2. **Dashboard**: Navigate to `http://localhost:3000/dashboard` to see your study streak, active plan, and quick actions.
3. **Upload Material**: Go to `/materials`, drag-and-drop a PDF or click **"Paste Study Notes"** (e.g., Operating Systems or DBMS notes). Watch the document get chunked and indexed.
4. **Ask StudyMate**: Go to `/chat`, select your uploaded material, toggle between **Simple**, **Detailed**, or **Exam Ready**, and ask a question. Review the retrieved source chunks.
5. **Take a Quiz**: Go to `/quiz`, select your material, pick 5 questions, and take the quiz. Review the diagnostic score and mistake explanations.
6. **Generate a Study Plan**: Go to `/planner`, input an upcoming test date, and see the day-by-day plan with interactive checkable tasks.
7. **Revision Mode**: Go to `/revision`, select a document, and flip through interactive flashcards and high-yield exam tips.
8. **Check Progress**: Go to `/progress` to see real metrics and weak topic highlights.

---

## 🔒 Security & Best Practices

- **Strict File Type Validation**: Only `.pdf`, `.txt`, and `.md` files are parsed.
- **Size Limits**: Enforced 25MB ceiling on uploads to prevent memory exhaustion.
- **RAG Scope Containment**: Answers are strictly grounded in retrieved chunks with explicit prompts preventing hallucinations.
- **No Secret Leakage**: Database URLs and inference endpoints are kept strictly on server route handlers.
- **Sanitized JSON Extraction**: Resilient parser cleans LLM outputs and strips markdown code fences before serialization.

---

## 📄 License
MIT License. Built with ❤️ for students worldwide and Hacktoberfest 2026.
