"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import {
  MessageSquare,
  HelpCircle,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderOpen,
  TrendingUp,
  Cpu,
  Layers,
} from "lucide-react";
import { getGreeting } from "@/lib/utils/helpers";

interface DashboardData {
  materialsCount: number;
  totalChunks: number;
  totalAttempts: number;
  avgScore: number;
  totalTasks: number;
  completedTasks: number;
  streak: number;
  weakTopics: Array<{ topic: string; accuracy: number }>;
  recentActivities: Array<{ id: string; type: string; title: string; date: string }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [aiStatus, setAiStatus] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [progRes, matRes, planRes, healthRes] = await Promise.all([
          fetch("/api/progress"),
          fetch("/api/materials"),
          fetch("/api/planner"),
          fetch("/api/health"),
        ]);

        if (progRes.ok) {
          const progData = await progRes.json();
          setData(progData);
        }
        if (matRes.ok) {
          const matData = await matRes.json();
          setMaterials(matData.materials || []);
        }
        if (planRes.ok) {
          const planData = await planRes.json();
          setPlans(planData.plans || []);
        }
        if (healthRes.ok) {
          const hData = await healthRes.json();
          setAiStatus(hData);
        }
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
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen max-w-7xl mx-auto w-full">
        {/* Top Header / Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl md:text-2xl font-bold tracking-tight">
                {greeting} 👋
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Ready to study? Here is your personalized companion overview.
            </p>
          </div>

          {/* AI Model Badge */}
          <div className="flex items-center gap-3 bg-[#111118] border border-[rgba(255,255,255,0.08)] px-4 py-2 rounded-xl text-xs">
            <Cpu size={16} className="text-[#7c6fe0]" />
            <div>
              <div className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
                Active AI Partner
              </div>
              <div className="font-mono text-gray-200">
                {aiStatus?.model || "gemma2:2b"} · {aiStatus?.provider || "Ollama"}
              </div>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full ml-1 ${
                aiStatus?.available ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
              title={aiStatus?.available ? "Ollama Online" : "Ollama Offline"}
            />
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          <Link
            href="/chat"
            className="card p-4 md:p-5 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)] hover:border-[#7c6fe0] hover:bg-[rgba(124,111,224,0.06)] transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[rgba(124,111,224,0.15)] flex items-center justify-center text-[#9d93f7] mb-3 group-hover:scale-105 transition-transform">
              <MessageSquare size={20} />
            </div>
            <h3 className="font-semibold text-sm md:text-base text-white mb-0.5">
              Ask StudyMate
            </h3>
            <p className="text-xs text-gray-400">Chat with your notes</p>
          </Link>

          <Link
            href="/quiz"
            className="card p-4 md:p-5 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)] hover:border-[#4f9eff] hover:bg-[rgba(79,158,255,0.06)] transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[rgba(79,158,255,0.15)] flex items-center justify-center text-[#4f9eff] mb-3 group-hover:scale-105 transition-transform">
              <HelpCircle size={20} />
            </div>
            <h3 className="font-semibold text-sm md:text-base text-white mb-0.5">
              Generate Quiz
            </h3>
            <p className="text-xs text-gray-400">Test comprehension</p>
          </Link>

          <Link
            href="/planner"
            className="card p-4 md:p-5 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)] hover:border-[#00d4aa] hover:bg-[rgba(0,212,170,0.06)] transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,170,0.15)] flex items-center justify-center text-[#00d4aa] mb-3 group-hover:scale-105 transition-transform">
              <Calendar size={20} />
            </div>
            <h3 className="font-semibold text-sm md:text-base text-white mb-0.5">
              Study Plan
            </h3>
            <p className="text-xs text-gray-400">Day-by-day roadmap</p>
          </Link>

          <Link
            href="/revision"
            className="card p-4 md:p-5 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)] hover:border-amber-400 hover:bg-[rgba(255,193,7,0.06)] transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,193,7,0.15)] flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
              <Sparkles size={20} />
            </div>
            <h3 className="font-semibold text-sm md:text-base text-white mb-0.5">
              Start Revision
            </h3>
            <p className="text-xs text-gray-400">Flashcards & concepts</p>
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Study Streak</span>
              <Flame size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {data?.streak || 0} <span className="text-xs font-normal text-gray-400">days</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              Active learning habit
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Materials</span>
              <BookOpen size={16} className="text-[#7c6fe0]" />
            </div>
            <div className="text-2xl font-bold text-white">
              {data?.materialsCount || materials.length || 0}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              {data?.totalChunks || 0} chunks indexed
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Quiz Accuracy</span>
              <TrendingUp size={16} className="text-[#4f9eff]" />
            </div>
            <div className="text-2xl font-bold text-white">
              {data?.avgScore ? `${data.avgScore}%` : "—"}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              {data?.totalAttempts || 0} quizzes taken
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Plan Progress</span>
              <CheckCircle2 size={16} className="text-[#00d4aa]" />
            </div>
            <div className="text-2xl font-bold text-white">
              {data?.totalTasks
                ? `${Math.round((data.completedTasks / data.totalTasks) * 100)}%`
                : "—"}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              {data?.completedTasks || 0} / {data?.totalTasks || 0} tasks done
            </div>
          </div>
        </div>

        {/* 2-Column Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Recent Materials & Today's Study Plan (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Study Plan / Today's Tasks */}
            <div className="card p-5 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-[#00d4aa]" />
                  <h2 className="font-bold text-base text-white">
                    Today&apos;s Study Plan
                  </h2>
                </div>
                <Link
                  href="/planner"
                  className="text-xs text-[#00d4aa] hover:underline flex items-center gap-1"
                >
                  Manage Plans <ArrowRight size={13} />
                </Link>
              </div>

              {plans.length > 0 && plans[0]?.tasks?.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="text-xs text-gray-400 mb-2">
                    Active Plan: <span className="text-gray-200 font-semibold">{plans[0].title}</span>
                  </div>
                  {plans[0].tasks.slice(0, 3).map((task: any) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                            task.completed
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-white/5 text-gray-400 border border-white/10"
                          }`}
                        >
                          {task.day}
                        </span>
                        <div>
                          <div
                            className={`text-sm font-medium ${
                              task.completed
                                ? "line-through text-gray-500"
                                : "text-gray-200"
                            }`}
                          >
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-xs text-gray-400 line-clamp-1">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
                        {task.duration}h
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-[rgba(255,255,255,0.08)] rounded-xl">
                  <Calendar size={32} className="mx-auto text-gray-600 mb-2" />
                  <p className="text-sm text-gray-300 font-medium">No study plan created yet</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Let AI create a day-by-day exam roadmap from your topics.
                  </p>
                  <Link
                    href="/planner"
                    className="btn-primary text-xs py-1.5 px-3 rounded-lg"
                  >
                    Create Study Plan
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Study Materials */}
            <div className="card p-5 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderOpen size={18} className="text-[#7c6fe0]" />
                  <h2 className="font-bold text-base text-white">
                    Recent Materials
                  </h2>
                </div>
                <Link
                  href="/materials"
                  className="text-xs text-[#7c6fe0] hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight size={13} />
                </Link>
              </div>

              {materials.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {materials.slice(0, 4).map((mat) => (
                    <div
                      key={mat.id}
                      className="p-3.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-200 line-clamp-1">
                          {mat.title}
                        </span>
                        <span className="badge badge-success text-[10px]">
                          ✓ {mat.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center justify-between">
                        <span>{mat._count?.chunks || mat.chunkCount || 0} chunks</span>
                        <span className="uppercase text-[10px] text-gray-500">
                          {mat.fileName?.split(".").pop()}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3 pt-2.5 border-t border-[rgba(255,255,255,0.06)]">
                        <Link
                          href={`/chat?materialId=${mat.id}`}
                          className="text-xs text-[#7c6fe0] hover:underline"
                        >
                          Ask AI
                        </Link>
                        <span className="text-gray-600">·</span>
                        <Link
                          href={`/quiz?materialId=${mat.id}`}
                          className="text-xs text-[#4f9eff] hover:underline"
                        >
                          Quiz
                        </Link>
                        <span className="text-gray-600">·</span>
                        <Link
                          href={`/revision?materialId=${mat.id}`}
                          className="text-xs text-amber-400 hover:underline"
                        >
                          Revise
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-[rgba(255,255,255,0.08)] rounded-xl">
                  <FolderOpen size={32} className="mx-auto text-gray-600 mb-2" />
                  <p className="text-sm text-gray-300 font-medium">No materials uploaded</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Upload your lecture notes, PDF textbook, or markdown notes to begin.
                  </p>
                  <Link
                    href="/materials"
                    className="btn-primary text-xs py-1.5 px-3 rounded-lg"
                  >
                    Upload Document
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Weak Topics & Recent Activity */}
          <div className="space-y-6">
            {/* Weak Topics Card */}
            <div className="card p-5 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-amber-400" />
                <h2 className="font-bold text-base text-white">Weak Topics</h2>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Identified from your quiz mistakes. Focus study sessions here.
              </p>

              {data?.weakTopics && data.weakTopics.length > 0 ? (
                <div className="space-y-2">
                  {data.weakTopics.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/15 flex items-center justify-between"
                    >
                      <span className="text-xs text-red-200 font-medium truncate max-w-[160px]">
                        {item.topic}
                      </span>
                      <span className="text-xs font-semibold text-red-400">
                        {item.accuracy}% acc
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-500 bg-[rgba(255,255,255,0.02)] rounded-xl">
                  Take quizzes to identify specific topic gaps automatically!
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="card p-5 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={18} className="text-[#4f9eff]" />
                <h2 className="font-bold text-base text-white">Recent Activity</h2>
              </div>

              {data?.recentActivities && data.recentActivities.length > 0 ? (
                <div className="space-y-2.5">
                  {data.recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="text-xs p-2.5 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]"
                    >
                      <div className="text-gray-300 font-medium line-clamp-1">
                        {act.title}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(act.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-500 bg-[rgba(255,255,255,0.02)] rounded-xl">
                  No activity recorded yet. Start by uploading a document.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
