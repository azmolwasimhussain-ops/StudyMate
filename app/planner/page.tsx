"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";

interface StudyTask {
  id: string;
  day: number;
  title: string;
  description: string | null;
  duration: number;
  completed: boolean;
}

interface StudyPlan {
  id: string;
  title: string;
  goal: string;
  examDate: string | null;
  hoursPerDay: number;
  tasks: StudyTask[];
  createdAt: string;
}

export default function PlannerPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [goal, setGoal] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [topicsInput, setTopicsInput] = useState("");

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/planner");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (err) {
      console.error("Error fetching study plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setGenerating(true);
    setError(null);

    const topics = topicsInput
      .split(/[\n,]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goal.trim(),
          examDate: examDate || undefined,
          hoursPerDay,
          topics: topics.length > 0 ? topics : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate plan");

      setShowCreateModal(false);
      setGoal("");
      setExamDate("");
      setTopicsInput("");
      await fetchPlans();
    } catch (err: any) {
      setError(err.message || "Failed to generate study plan.");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (planId: string, taskId: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setPlans((prev) =>
        prev.map((p) => {
          if (p.id !== planId) return p;
          return {
            ...p,
            tasks: p.tasks.map((t) =>
              t.id === taskId ? { ...t, completed: !currentStatus } : t
            ),
          };
        })
      );

      await fetch(`/api/planner/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          completed: !currentStatus,
        }),
      });
    } catch (err) {
      console.error("Failed to toggle task", err);
      await fetchPlans(); // revert on failure
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this study plan?")) return;
    try {
      await fetch(`/api/planner/${planId}`, { method: "DELETE" });
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch (err) {
      console.error("Delete plan error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              Personalized Study Planner
            </h1>
            <p className="text-sm text-gray-400">
              AI-generated day-by-day roadmap tailored to your target exam date and daily hours.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary text-xs py-2 px-3.5 self-start sm:self-auto flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Create Study Plan</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Plans List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 skeleton rounded-2xl" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="card p-12 text-center rounded-2xl bg-[#111118] border border-dashed border-[rgba(255,255,255,0.08)]">
            <Calendar size={44} className="mx-auto text-gray-600 mb-3" />
            <h3 className="font-semibold text-gray-200 mb-1">No Study Plans Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
              Enter your upcoming exam or learning goal and let the open AI model break it down into realistic daily tasks.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary text-xs py-2 px-4 rounded-xl"
            >
              Generate First Plan
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {plans.map((plan) => {
              const completedCount = plan.tasks.filter((t) => t.completed).length;
              const totalCount = plan.tasks.length;
              const progressPct =
                totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              return (
                <div
                  key={plan.id}
                  className="card p-6 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]"
                >
                  {/* Plan Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[rgba(255,255,255,0.08)]">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold text-white">
                          {plan.title}
                        </h2>
                        <span className="badge badge-purple text-[10px]">
                          {plan.hoursPerDay} hrs/day
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-3">
                        <span>Goal: {plan.goal}</span>
                        {plan.examDate && (
                          <>
                            <span>·</span>
                            <span>
                              Exam: {new Date(plan.examDate).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-gray-300">
                          {completedCount} / {totalCount} completed ({progressPct}%)
                        </div>
                        <div className="w-28 progress-bar mt-1.5 h-1.5">
                          <div
                            className="progress-fill"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg transition-colors ml-2"
                        title="Delete Plan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="mt-4 space-y-2.5">
                    {plan.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(plan.id, task.id, task.completed)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          task.completed
                            ? "bg-emerald-500/5 border-emerald-500/20 text-gray-400"
                            : "bg-white/5 border-white/5 hover:border-white/15 text-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <button
                            type="button"
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                              task.completed
                                ? "bg-emerald-500 text-black font-bold"
                                : "border border-white/20 text-transparent"
                            }`}
                          >
                            <Check size={13} />
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#7c6fe0]">
                                Day {task.day}
                              </span>
                              <span
                                className={`text-sm font-medium ${
                                  task.completed ? "line-through text-gray-500" : ""
                                }`}
                              >
                                {task.title}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="text-xs font-mono text-gray-400 whitespace-nowrap bg-black/20 px-2 py-0.5 rounded-md">
                          {task.duration}h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create Plan */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111118] border border-[rgba(255,255,255,0.12)] rounded-2xl w-full max-w-lg p-6 animate-fade-in">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Sparkles size={18} className="text-[#00d4aa]" />
                Generate AI Study Plan
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Powered by open-weight AI model to balance topics, spaced repetition, and review.
              </p>

              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div>
                  <label className="label">Exam or Subject Goal</label>
                  <input
                    type="text"
                    required
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. DBMS Midterms or Calculus II Finals"
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Exam Date (Optional)</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Hours Per Day</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(Number(e.target.value))}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Topics to Cover (comma or newline separated)</label>
                  <textarea
                    rows={4}
                    value={topicsInput}
                    onChange={(e) => setTopicsInput(e.target.value)}
                    placeholder="e.g. Relational Algebra, Normalization, SQL Joins, Concurrency Control, Indexing..."
                    className="input text-xs resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="btn-primary text-xs"
                  >
                    {generating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Generating Schedule...
                      </>
                    ) : (
                      "Generate Plan"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
