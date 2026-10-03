"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/layout/sidebar";
import {
  MessageSquare,
  HelpCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame,
  AlertTriangle,
  FolderOpen,
  Cpu,
} from "lucide-react";
import { getGreeting } from "@/lib/utils/helpers";
import { ProgressSummary } from "@/types/progress";
import { StudyMaterial } from "@/types/materials";
import { StudyPlan } from "@/types/planner";

const StudyCore = dynamic(
  () => import("@/components/3d/study-core").then((mod) => mod.StudyCore),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border border-[#7c6fe0]/30 animate-pulse" />
      </div>
    ),
  }
);

export default function DashboardPage() {
  const [data, setData] = useState<ProgressSummary | null>(null);
  const [, setLoading] = useState(true);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [aiStatus, setAiStatus] = useState<{ model?: string; provider?: string; available?: boolean } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [progRes, matRes, planRes, healthRes] = await Promise.all([
          fetch("/api/progress"),
          fetch("/api/materials"),
          fetch("/api/planner"),
          fetch("/api/health"),
        ]);

        if (progRes.ok) setData(await progRes.json());
        if (matRes.ok) {
          const m = await matRes.json();
          setMaterials(m.materials || []);
        }
        if (planRes.ok) {
          const p = await planRes.json();
          setPlans(p.plans || []);
        }
        if (healthRes.ok) setAiStatus(await healthRes.json());
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-[#06060c] text-white flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                {greeting}, Azmol 👋
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Welcome to your Study Command Center. What are you mastering today?
            </p>
          </div>

          <div className="flex items-center gap-3 glass-panel px-4 py-2.5 rounded-2xl border border-white/10 self-start md:self-auto">
            <Cpu size={18} className="text-[#00d4aa]" />
            <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Inference Neural Core
              </div>
              <div className="font-mono text-xs text-white">
                {aiStatus?.model || "gemma2:2b"} · {aiStatus?.provider || "Ollama"}
              </div>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full ml-1 ${
                aiStatus?.available ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between min-h-[360px]">
            <div className="flex items-center justify-between z-10">
              <div>
                <span className="badge badge-purple text-[10px] mb-1">Knowledge Hub</span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Your Digital Study Universe
                </h2>
              </div>
              <span className="text-xs text-gray-400 font-mono hidden sm:inline-block">
                {materials.length} Materials Loaded
              </span>
            </div>

            <div className="w-full h-[220px] md:h-[260px] my-2 relative">
              <StudyCore className="w-full h-full" />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5 z-10 text-center">
              <div>
                <div className="text-xs text-gray-400">Streak</div>
                <div className="text-lg font-extrabold text-white flex items-center justify-center gap-1">
                  <Flame size={15} className="text-amber-400" />
                  <span>{data?.streak || 0}d</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Total Chunks</div>
                <div className="text-lg font-extrabold text-[#7c6fe0]">
                  {data?.totalChunks || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Quiz Accuracy</div>
                <div className="text-lg font-extrabold text-[#00d4aa]">
                  {data?.avgScore ? `${data.avgScore}%` : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 flex flex-col justify-between">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 flex-1">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles size={15} className="text-[#7c6fe0]" />
                <span>Command Actions</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/chat"
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#7c6fe0] hover:bg-[#7c6fe0]/10 transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#7c6fe0]/20 flex items-center justify-center text-[#9d93f7] mb-2 group-hover:scale-110 transition-transform">
                    <MessageSquare size={17} />
                  </div>
                  <span className="text-xs font-semibold text-white">Ask AI</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">RAG Chat</span>
                </Link>

                <Link
                  href="/quiz"
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#4f9eff] hover:bg-[#4f9eff]/10 transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#4f9eff]/20 flex items-center justify-center text-[#4f9eff] mb-2 group-hover:scale-110 transition-transform">
                    <HelpCircle size={17} />
                  </div>
                  <span className="text-xs font-semibold text-white">Quiz Arena</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Active Recall</span>
                </Link>

                <Link
                  href="/planner"
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#00d4aa] hover:bg-[#00d4aa]/10 transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#00d4aa]/20 flex items-center justify-center text-[#00d4aa] mb-2 group-hover:scale-110 transition-transform">
                    <Calendar size={17} />
                  </div>
                  <span className="text-xs font-semibold text-white">Roadmap</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Study Plan</span>
                </Link>

                <Link
                  href="/revision"
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-400 hover:bg-amber-400/10 transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition-transform">
                    <Sparkles size={17} />
                  </div>
                  <span className="text-xs font-semibold text-white">Revision</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">3D Deck</span>
                </Link>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <AlertTriangle size={15} />
                <span>Diagnostics: Weak Topics</span>
              </div>
              {data?.weakTopics && data.weakTopics.length > 0 ? (
                <div className="space-y-2 mt-3">
                  {data.weakTopics.slice(0, 2).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between text-xs"
                    >
                      <span className="text-red-200 font-medium truncate max-w-[170px]">
                        {item.topic}
                      </span>
                      <span className="text-red-400 font-bold">{item.accuracy}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1">
                  Take active recall quizzes in the Arena to detect mastery gaps automatically.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#00d4aa]" />
                <h3 className="font-bold text-base text-white">Active Learning Mission</h3>
              </div>
              <Link href="/planner" className="text-xs text-[#00d4aa] hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {plans.length > 0 && plans[0]?.tasks?.length > 0 ? (
              <div className="space-y-3">
                <div className="text-xs text-gray-400">
                  Target: <strong className="text-white">{plans[0].title}</strong>
                </div>
                {plans[0].tasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                          task.completed
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-white/5 text-gray-400 border border-white/10"
                        }`}
                      >
                        {task.day}
                      </span>
                      <div>
                        <div
                          className={`text-sm font-semibold ${
                            task.completed ? "line-through text-gray-500" : "text-gray-100"
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-xs text-gray-400 line-clamp-1">{task.description}</div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{task.duration}h</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
                <Calendar size={32} className="mx-auto text-gray-600 mb-2" />
                <p className="text-xs text-gray-300 font-medium">No active mission</p>
                <Link href="/planner" className="btn-primary text-xs py-1.5 px-3 rounded-lg mt-3 inline-flex">
                  Create Learning Mission
                </Link>
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderOpen size={18} className="text-[#7c6fe0]" />
                <h3 className="font-bold text-base text-white">Document Library</h3>
              </div>
              <Link href="/materials" className="text-xs text-[#7c6fe0] hover:underline flex items-center gap-1">
                <span>Manage</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {materials.length > 0 ? (
              <div className="space-y-3">
                {materials.slice(0, 3).map((mat) => (
                  <div
                    key={mat.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 hover:border-white/15 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white line-clamp-1">{mat.title}</div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                        <span className="badge badge-success text-[9px]">✓ {mat.status}</span>
                        <span>{mat._count?.chunks || mat.chunkCount || 0} chunks</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/chat?materialId=${mat.id}`}
                        className="text-xs text-[#7c6fe0] hover:underline px-2 py-1 rounded bg-[#7c6fe0]/10"
                      >
                        Ask AI
                      </Link>
                      <Link
                        href={`/quiz?materialId=${mat.id}`}
                        className="text-xs text-[#4f9eff] hover:underline px-2 py-1 rounded bg-[#4f9eff]/10"
                      >
                        Quiz
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
                <FolderOpen size={32} className="mx-auto text-gray-600 mb-2" />
                <p className="text-xs text-gray-300 font-medium">No documents uploaded yet</p>
                <Link href="/materials" className="btn-primary text-xs py-1.5 px-3 rounded-lg mt-3 inline-flex">
                  Upload PDF / Notes
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
