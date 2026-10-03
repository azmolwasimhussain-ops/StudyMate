"use client";

import Link from "next/link";
import {
  BookOpen,
  Brain,
  Zap,
  FileText,
  MessageSquare,
  ClipboardList,
  Calendar,
  TrendingUp,
  ArrowRight,
  Cpu,
  Shield,
  Layers,
  ChevronRight,
  Star,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Ask Anything",
    description:
      "Chat with your study material in plain language. Get simple, detailed, or exam-ready answers.",
    color: "#7c6fe0",
  },
  {
    icon: ClipboardList,
    title: "Quiz Generator",
    description:
      "Generate custom quizzes from your notes. Choose difficulty and number of questions.",
    color: "#4f9eff",
  },
  {
    icon: Calendar,
    title: "Study Planner",
    description:
      "AI creates a day-by-day study plan based on your exam date and available hours.",
    color: "#00d4aa",
  },
  {
    icon: Zap,
    title: "Revision Mode",
    description:
      "Flashcards, key concepts, and quick summaries for last-minute revision.",
    color: "#ffc107",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "See your quiz scores, study streaks, and identify weak topics that need more attention.",
    color: "#ff6b6b",
  },
  {
    icon: FileText,
    title: "Multi-Format",
    description:
      "Upload PDFs, TXT files, or Markdown notes. StudyMate processes them all seamlessly.",
    color: "#a8ff78",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload your material",
    description:
      "Drop in your lecture notes, textbook chapters, or any study material as PDF or text.",
  },
  {
    number: "02",
    title: "AI processes & indexes",
    description:
      "StudyMate extracts, cleans, and chunks your content for intelligent retrieval.",
  },
  {
    number: "03",
    title: "Study smarter",
    description:
      "Ask questions, generate quizzes, create a study plan — all powered by open-weight AI.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Floating Nav */}
      <nav className="nav-float">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--gradient-1)" }}
          >
            <Brain size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm">StudyMate</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-sm" style={{ color: "var(--text-secondary)" }}>
            How it works
          </a>
          <a href="#features" className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Features
          </a>
          <a href="#open-ai" className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Open AI
          </a>
        </div>
        <Link href="/dashboard" className="btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
          Start Studying
        </Link>
      </nav>

      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center justify-center text-center px-6 pt-24 pb-16"
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* Glow orbs */}
        <div
          className="hero-glow"
          style={{ top: "-100px", right: "-100px", opacity: 0.8 }}
        />
        <div
          className="hero-glow"
          style={{
            bottom: "-150px",
            left: "-150px",
            background:
              "radial-gradient(circle, rgba(79, 158, 255, 0.1), transparent 70%)",
          }}
        />

        <div className="relative max-w-4xl mx-auto animate-fade-in">
          <div className="chip mb-6 mx-auto" style={{ width: "fit-content" }}>
            <Sparkles size={12} />
            Hacktoberfest 2026 · Build for a Friend
          </div>

          <h1
            className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6"
            style={{ letterSpacing: "-0.03em" }}
          >
            Study smarter.
            <br />
            <span className="gradient-text">Not harder.</span>
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            StudyMate turns your notes and study material into an interactive AI
            study partner. Ask questions, generate quizzes, and get a
            personalized study plan — all powered by{" "}
            <span style={{ color: "var(--accent)" }}>open-weight AI</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 1.75rem" }}>
              <BookOpen size={18} />
              Start Studying Free
              <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" className="btn-secondary" style={{ fontSize: "1rem", padding: "0.75rem 1.75rem" }}>
              See How It Works
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-12 text-sm" style={{ color: "var(--text-muted)" }}>
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={13} fill="#ffc107" color="#ffc107" />
                ))}
              </div>
              <span>Open-weight AI</span>
            </div>
            <div className="w-px h-4" style={{ background: "var(--border)" }} />
            <span>🔓 No API keys needed</span>
            <div className="w-px h-4" style={{ background: "var(--border)" }} />
            <span>📦 Self-hostable</span>
          </div>
        </div>
      </section>

      {/* Demo preview */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div
            className="glass rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(124, 111, 224, 0.2)" }}
          >
            {/* Mock browser chrome */}
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.3)" }}
            >
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div
                className="flex-1 text-center text-xs rounded px-3 py-1 mx-4"
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}
              >
                studymate.app/dashboard
              </div>
            </div>
            {/* Mock dashboard preview */}
            <div className="p-6" style={{ background: "var(--surface)" }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Materials", value: "3", sub: "uploaded" },
                  { label: "Quiz Score", value: "84%", sub: "last attempt" },
                  { label: "Study Streak", value: "5 days", sub: "🔥 keep it up!" },
                ].map((stat) => (
                  <div key={stat.label} className="card card-sm">
                    <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                      {stat.label}
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                      {stat.sub}
                    </div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: "1rem" }}>
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(124, 111, 224, 0.2)" }}
                  >
                    <Brain size={16} style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                      StudyMate — qwen3.5:4b
                    </div>
                    <div className="text-sm" style={{ color: "var(--text-primary)" }}>
                      The null space (or kernel) of a matrix A is the set of all vectors x such that Ax = 0.
                      Think of it as the &quot;shadow&quot; that collapses to zero when transformed by A...
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      {["Definition", "Example", "Exam Tip"].map((tag) => (
                        <span key={tag} className="badge badge-purple" style={{ fontSize: "0.65rem" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="section">
        <div className="text-center mb-14">
          <div className="chip mb-4 mx-auto" style={{ width: "fit-content" }}>How it works</div>
          <h2 className="text-4xl font-bold mb-4">
            From notes to{" "}
            <span className="gradient-text">knowledge</span>
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Three simple steps to transform your study material
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="step-card">
              <div className="step-number">{step.number}</div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {step.description}
              </p>
              {i < steps.length - 1 && (
                <ChevronRight
                  size={20}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block"
                  style={{ color: "var(--text-muted)" }}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section" style={{ paddingTop: 0 }}>
        <div className="text-center mb-14">
          <div className="chip mb-4 mx-auto" style={{ width: "fit-content" }}>Features</div>
          <h2 className="text-4xl font-bold mb-4">
            Everything a student{" "}
            <span className="gradient-text">needs</span>
          </h2>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card glass-hover"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${feature.color}20` }}
              >
                <feature.icon size={22} style={{ color: feature.color }} />
              </div>
              <h3 className="text-base font-bold mb-2">{feature.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Open AI section */}
      <section id="open-ai" className="section" style={{ paddingTop: 0 }}>
        <div
          className="glass rounded-2xl p-8 md:p-12"
          style={{ border: "1px solid rgba(124, 111, 224, 0.2)" }}
        >
          <div className="max-w-3xl">
            <div className="chip mb-6">
              <Cpu size={12} />
              Open AI Approach
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powered by{" "}
              <span className="gradient-text">open-weight models</span>
            </h2>
            <p className="text-lg mb-8" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
              StudyMate runs on open-weight AI models through Ollama — no closed APIs, no
              subscription costs, no vendor lock-in. Your data stays where you want it.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Shield,
                  title: "Data Control",
                  desc: "Run inference locally. Your study material never leaves your machine.",
                },
                {
                  icon: Layers,
                  title: "Model Flexibility",
                  desc: "Swap models via environment variables. Use Gemma, Llama, Qwen, or any Ollama model.",
                },
                {
                  icon: Zap,
                  title: "No API Costs",
                  desc: "Local inference means no per-token costs after setup. Study as much as you want.",
                },
                {
                  icon: Cpu,
                  title: "Self-Hostable",
                  desc: "Deploy on your own hardware. Full control over performance and privacy.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-3 p-4 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(124, 111, 224, 0.2)" }}
                  >
                    <item.icon size={18} style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-1">{item.title}</div>
                    <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                # Configure your preferred model in .env
              </p>
              <p className="text-sm font-mono mt-1" style={{ color: "#00d4aa" }}>
                AI_PROVIDER=ollama<br />
                AI_MODEL=qwen3.5:4b &nbsp;&nbsp;# or gemma3:4b, llama3, etc.<br />
                OLLAMA_BASE_URL=http://localhost:11434
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section text-center" style={{ paddingTop: 0 }}>
        <div
          className="rounded-2xl p-10 md:p-16 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(124,111,224,0.15), rgba(79,158,255,0.1))",
            border: "1px solid rgba(124, 111, 224, 0.25)",
          }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to study smarter?
          </h2>
          <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
            Upload your first document and start a conversation with your notes.
          </p>
          <Link href="/dashboard" className="btn-primary" style={{ fontSize: "1rem", padding: "0.875rem 2rem" }}>
            <BookOpen size={18} />
            Start for Free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t px-6 py-10"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--gradient-1)" }}
            >
              <Brain size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm">StudyMate</span>
          </div>
          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
            Built for Hacktoberfest 2026 — &quot;Build for a Friend&quot; Challenge.
            Powered by open-weight AI via Ollama.
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/materials">Materials</Link>
            <Link href="/chat">Chat</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
