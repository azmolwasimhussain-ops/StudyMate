"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import {
  BarChart3,
  Flame,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  FolderOpen,
  Calendar,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface ProgressData {
  materialsCount: number;
  totalChunks: number;
  totalAttempts: number;
  avgScore: number;
  totalTasks: number;
  completedTasks: number;
  streak: number;
  weakTopics: Array<{ topic: string; accuracy: number; total: number }>;
  strongTopics: Array<{ topic: string; accuracy: number; total: number }>;
  recentAttempts: Array<{
    id: string;
    quizTitle: string;
    score: number;
    total: number;
    date: string;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    date: string;
  }>;
  studyHistory: Array<{ date: string; minutes: number }>;
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("Progress fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const hasData =
    data &&
    (data.materialsCount > 0 ||
      data.totalAttempts > 0 ||
      data.totalTasks > 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Learning Progress & Analytics
          </h1>
          <p className="text-sm text-gray-400">
            Real performance tracking derived from your study material usage, task completion, and quiz scores.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 skeleton rounded-2xl" />
              ))}
            </div>
            <div className="h-64 skeleton rounded-2xl" />
          </div>
        ) : !hasData ? (
          <div className="card p-12 text-center rounded-2xl bg-[#111118] border border-dashed border-[rgba(255,255,255,0.08)]">
            <BarChart3 size={44} className="mx-auto text-gray-600 mb-3" />
            <h3 className="font-semibold text-gray-200 mb-1">
              No Analytics Data Yet
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
              Your analytics will appear here as soon as you upload study materials, attempt quizzes, or complete study plan tasks.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top 4 Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-5 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Study Streak</span>
                  <Flame size={16} className="text-amber-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {data?.streak || 0}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  consecutive days
                </div>
              </div>

              <div className="card p-5 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Quiz Accuracy</span>
                  <Award size={16} className="text-[#4f9eff]" />
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {data?.avgScore ? `${data.avgScore}%` : "—"}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  across {data?.totalAttempts || 0} attempts
                </div>
              </div>

              <div className="card p-5 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Materials & Chunks</span>
                  <BookOpen size={16} className="text-[#7c6fe0]" />
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {data?.materialsCount || 0}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  {data?.totalChunks || 0} chunks indexed
                </div>
              </div>

              <div className="card p-5 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Plan Completion</span>
                  <CheckCircle2 size={16} className="text-[#00d4aa]" />
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {data?.totalTasks
                    ? `${Math.round(
                        (data.completedTasks / data.totalTasks) * 100
                      )}%`
                    : "—"}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  {data?.completedTasks || 0} of {data?.totalTasks || 0} tasks done
                </div>
              </div>
            </div>

            {/* Performance Chart & Recent Attempts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quiz Score History Bar Chart */}
              <div className="card p-6 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
                <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#4f9eff]" />
                  <span>Recent Quiz Scores</span>
                </h3>

                {data?.recentAttempts && data.recentAttempts.length > 0 ? (
                  <div className="h-60 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.recentAttempts.map((a, i) => ({
                          name: `Quiz ${data.recentAttempts.length - i}`,
                          score: a.score,
                        }))}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="name"
                          stroke="#6b7280"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize={11}
                          domain={[0, 100]}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f1f2e",
                            borderColor: "rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar
                          dataKey="score"
                          fill="#7c6fe0"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-gray-500">
                    No quiz scores recorded yet.
                  </div>
                )}
              </div>

              {/* Weak vs Strong Topics */}
              <div className="card p-6 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)] space-y-5">
                <div>
                  <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-400" />
                    <span>Weak Topics (Needs Review)</span>
                  </h3>
                  {data?.weakTopics && data.weakTopics.length > 0 ? (
                    <div className="space-y-2">
                      {data.weakTopics.map((w, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-red-500/5 border border-red-500/15 text-xs"
                        >
                          <span className="text-gray-300 font-medium truncate max-w-[200px]">
                            {w.topic}
                          </span>
                          <span className="text-red-400 font-bold">
                            {w.accuracy}% acc
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      No weak topics detected yet! Great job.
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Strong Topics (Mastered)</span>
                  </h3>
                  {data?.strongTopics && data.strongTopics.length > 0 ? (
                    <div className="space-y-2">
                      {data.strongTopics.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs"
                        >
                          <span className="text-gray-300 font-medium truncate max-w-[200px]">
                            {s.topic}
                          </span>
                          <span className="text-emerald-400 font-bold">
                            {s.accuracy}% acc
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Complete more quizzes to build topic mastery analytics.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
