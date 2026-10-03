"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import {
  BarChart3,
  Flame,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ProgressSummary } from "@/types/progress";

export default function ProgressPage() {
  const [data, setData] = useState<ProgressSummary | null>(null);
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
    <div className="min-h-screen bg-[#06060c] text-white flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen max-w-6xl mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#7c6fe0]/15 border border-[#7c6fe0]/30 text-[#9d93f7] uppercase tracking-wider">
                Telemetry & Analytics
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Neural Progress & Retention
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-xl">
              Track mastery, retention rates, quiz diagnostic scores, and study streak over time.
            </p>
          </div>
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
          <div className="glass-panel p-12 text-center rounded-2xl border border-dashed border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#7c6fe0]">
              <BarChart3 size={32} />
            </div>
            <h3 className="font-bold text-lg text-white mb-1">
              No Analytics Data Yet
            </h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
              Your analytics and mastery retention will populate automatically as you upload study materials, attempt quizzes, or complete study roadmap tasks.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-[#ff9d42]/30 transition-all">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="font-medium">Study Streak</span>
                  <div className="p-1.5 rounded-lg bg-[#ff9d42]/10 text-[#ff9d42]">
                    <Flame size={16} />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {data?.streak || 0}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  consecutive days active
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-[#4f9eff]/30 transition-all">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="font-medium">Quiz Accuracy</span>
                  <div className="p-1.5 rounded-lg bg-[#4f9eff]/10 text-[#4f9eff]">
                    <Award size={16} />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {data?.avgScore ? `${data.avgScore}%` : "—"}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  across {data?.totalAttempts || 0} attempts
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-[#7c6fe0]/30 transition-all">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="font-medium">Indexed Knowledge</span>
                  <div className="p-1.5 rounded-lg bg-[#7c6fe0]/10 text-[#9d93f7]">
                    <BookOpen size={16} />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {data?.materialsCount || 0}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {data?.totalChunks || 0} vector chunks
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-[#00d4aa]/30 transition-all">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="font-medium">Plan Completion</span>
                  <div className="p-1.5 rounded-lg bg-[#00d4aa]/10 text-[#00d4aa]">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {data?.totalTasks
                    ? `${Math.round(
                        (data.completedTasks / data.totalTasks) * 100
                      )}%`
                    : "—"}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {data?.completedTasks || 0} of {data?.totalTasks || 0} tasks done
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#4f9eff]" />
                  <span>Recent Quiz Scores</span>
                </h3>

                {data?.recentAttempts && data.recentAttempts.length > 0 ? (
                  <div className="h-60 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.recentAttempts.map((a, i) => ({
                          name: `Quiz ${(data.recentAttempts?.length || 0) - i}`,
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
                            backgroundColor: "#0d0f1e",
                            borderColor: "rgba(255,255,255,0.12)",
                            borderRadius: "12px",
                            fontSize: "12px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
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
                  <div className="py-12 text-center text-xs text-gray-400">
                    No quiz scores recorded yet.
                  </div>
                )}
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
                <div>
                  <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-400" />
                    <span>Focus Areas (Needs Review)</span>
                  </h3>
                  {data?.weakTopics && data.weakTopics.length > 0 ? (
                    <div className="space-y-2">
                      {data.weakTopics.map((w, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs"
                        >
                          <span className="text-gray-200 font-medium truncate max-w-[200px]">
                            {w.topic}
                          </span>
                          <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                            {w.accuracy}% acc
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">
                      No weak topics detected yet! Great performance.
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Mastered Topics</span>
                  </h3>
                  {data?.strongTopics && data.strongTopics.length > 0 ? (
                    <div className="space-y-2">
                      {data.strongTopics.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs"
                        >
                          <span className="text-gray-200 font-medium truncate max-w-[200px]">
                            {s.topic}
                          </span>
                          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {s.accuracy}% acc
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">
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
