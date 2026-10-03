"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Brain,
  Sparkles,
  ArrowRight,
  BookOpen,
  Cpu,
  Shield,
  HelpCircle,
  Calendar,
  Compass,
  Zap,
} from "lucide-react";

const StudyCore = dynamic(
  () => import("@/components/3d/study-core").then((mod) => mod.StudyCore),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] flex items-center justify-center">
        <div className="w-48 h-48 rounded-full border border-[#7c6fe0]/20 animate-pulse flex items-center justify-center">
          <Brain size={40} className="text-[#7c6fe0]/40 animate-bounce" />
        </div>
      </div>
    ),
  }
);

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#06060c] text-white selection:bg-[#7c6fe0]/30 overflow-x-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(124,111,224,0.18),transparent_70%)] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-[radial-gradient(circle_at_bottom_right,rgba(79,158,255,0.1),transparent_70%)] pointer-events-none -z-10" />

      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="glass-pill px-5 py-2.5 rounded-full flex items-center gap-6 md:gap-8 max-w-fit shadow-2xl">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c6fe0] to-[#4f9eff] flex items-center justify-center text-white shadow-lg shadow-[#7c6fe0]/30">
              <Brain size={18} />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">StudyMate</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs text-gray-300 font-medium">
            <a href="#universe" className="hover:text-white transition-colors">Study Universe</a>
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#open-ai" className="hover:text-white transition-colors">Open AI Core</a>
          </div>

          <Link href="/dashboard" className="btn-primary text-xs py-1.5 px-4 rounded-full">
            <span>Start Studying</span>
            <ArrowRight size={13} />
          </Link>
        </nav>
      </header>

      <section className="relative pt-36 md:pt-44 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center" style={{ scrollMarginTop: "88px" }}>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(124,111,224,0.12)] border border-[rgba(124,111,224,0.25)] text-xs text-[#9d93f7] font-semibold tracking-wide uppercase mb-6 animate-glow">
          <Sparkles size={13} />
          <span>Hacktoberfest 2026 · Build for a Friend</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] max-w-4xl mb-6">
          Study smarter. <br />
          <span className="gradient-text-cosmic">Not harder.</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-[rgba(230,235,255,0.7)] max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Step inside your personal AI study partner. Turn complex notes and PDFs into an
          interactive knowledge universe powered by open-weight AI.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-10 z-10">
          <Link href="/dashboard" className="btn-primary py-3.5 px-7 text-sm rounded-xl">
            <BookOpen size={17} />
            <span>Enter StudyMate</span>
            <ArrowRight size={16} />
          </Link>

          <a href="#universe" className="btn-secondary py-3.5 px-6 text-sm rounded-xl">
            <Compass size={17} className="text-[#4f9eff]" />
            <span>Explore 3D Universe</span>
          </a>
        </div>

        <div id="universe" className="relative w-full max-w-4xl h-[420px] md:h-[500px] my-4 rounded-3xl glass-panel overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center" style={{ scrollMarginTop: "96px" }}>
          <div className="absolute top-4 left-5 text-left pointer-events-none z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-white tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>3D Knowledge Core</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">Move cursor to navigate knowledge orbits</p>
          </div>

          <div className="absolute bottom-4 right-5 text-right pointer-events-none z-10 hidden sm:block">
            <span className="badge badge-purple text-[10px]">Spatial WebGL Scene</span>
          </div>

          <StudyCore className="w-full h-full" />
        </div>
      </section>

      <section id="features" className="py-20 px-6 max-w-7xl mx-auto" style={{ scrollMarginTop: "96px" }}>
        <div className="text-center mb-16">
          <div className="text-xs uppercase tracking-widest text-[#7c6fe0] font-bold mb-2">Capabilities</div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            An Intelligent Learning Ecosystem
          </h2>
          <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto mt-3">
            Every feature is designed to guide students from raw lecture material to true conceptual mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: Brain,
              title: "Ask StudyMate",
              desc: "Grounded RAG chat answering with simple analogies, in-depth theory, or exam-ready points.",
              tag: "Adaptive Modes",
              href: "/chat",
            },
            {
              icon: HelpCircle,
              title: "Quiz Arena",
              desc: "Generate active recall questions with automated diagnostic scoring and topic error isolation.",
              tag: "Diagnostic Evaluation",
              href: "/quiz",
            },
            {
              icon: Calendar,
              title: "Mission Roadmap",
              desc: "AI creates structured day-by-day study milestones with spaced repetition and checklists.",
              tag: "Time Management",
              href: "/planner",
            },
            {
              icon: Zap,
              title: "Revision Deck",
              desc: "Spatial 3D flippable flashcards, high-yield definitions, and common trap warnings.",
              tag: "Rapid Recall",
              href: "/revision",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#7c6fe0]/15 flex items-center justify-center text-[#9d93f7] mb-4 group-hover:scale-110 transition-transform">
                  <item.icon size={22} />
                </div>
                <span className="badge badge-purple text-[9px] mb-2">{item.tag}</span>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs text-[#7c6fe0] font-semibold group-hover:translate-x-1 transition-transform">
                <span>Enter feature</span>
                <ArrowRight size={13} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="open-ai" className="py-20 px-6 max-w-6xl mx-auto" style={{ scrollMarginTop: "96px" }}>
        <div className="glass-panel p-8 md:p-14 rounded-3xl relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00d4aa]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mb-10">
            <span className="badge badge-success text-[10px] mb-3">
              <Shield size={11} /> Open-Weight AI Architecture
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
              Your AI. <span className="gradient-text-cosmic">Your Control.</span>
            </h2>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed">
              StudyMate runs on open-weight foundation models via local Ollama inference.
              Your notes never leak to closed third-party cloud APIs, and there are zero subscription fees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { step: "01", title: "Study Material", sub: "PDF / TXT / Markdown parsed and chunked locally" },
              { step: "02", title: "Semantic Retrieval", sub: "Sliding-window context extraction on request" },
              { step: "03", title: "Gemma 2 / Open AI", sub: "Gemma 2B open model runs inference on device" },
              { step: "04", title: "Grounded Synthesis", sub: "Accurate answers, quizzes & personalized plans" },
            ].map((st) => (
              <div key={st.step} className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs font-mono font-bold text-[#7c6fe0]">{st.step}</span>
                <h4 className="text-sm font-bold text-white mt-1 mb-1">{st.title}</h4>
                <p className="text-xs text-gray-400 leading-normal">{st.sub}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <Cpu size={22} className="text-[#00d4aa]" />
              <div>
                <div className="text-xs font-bold text-white">Active Open Foundation Model</div>
                <div className="text-xs text-gray-400 font-mono">Google Gemma 2 (`gemma2:2b`) · Local Ollama Server</div>
              </div>
            </div>

            <Link href="/settings" className="btn-secondary text-xs py-2 px-4 rounded-xl">
              Inspect Model Telemetry
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-10 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2 text-gray-300">
          <Brain size={16} className="text-[#7c6fe0]" />
          <span className="font-bold text-white">StudyMate</span>
          <span>· Hacktoberfest 2026</span>
        </div>
        <p>Built for students who deserve open, private, and intelligent study companions.</p>
        <div className="flex gap-4">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <Link href="/materials" className="hover:text-white">Materials</Link>
          <Link href="/chat" className="hover:text-white">Chat</Link>
        </div>
      </footer>
    </div>
  );
}
