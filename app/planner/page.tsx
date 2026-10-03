"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import {
  Calendar,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  Loader2,
  AlertCircle,
  Flag,
  Target,
  Compass,
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
      await fetchPlans();
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Delete this mission study roadmap?")) return;
    try {
      await fetch(`/api/planner/${planId}`, { method: "DELETE" });
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch (err) {
      console.error("Delete plan error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#06060c] text-white flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen max-w-5xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              Mission Control: Study Roadmap
            </h1>
            <p className="text-sm text-gray-400">
              AI-generated learning trajectories aligned with target exam deadlines and daily hours.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary text-xs py-2 px-3.5 self-start sm:self-auto flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Launch New Mission</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-3xl glass-panel animate-pulse" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border border-dashed border-white/10 shadow-2xl">
            <Target size={44} className="mx-auto text-[#7c6fe0] mb-3" />
            <h3 className="font-semibold text-gray-200 mb-1">No Missions Planned</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
              Enter your upcoming exam or goal and let open-weight AI generate a structured day-by-day roadmap.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary text-xs py-2 px-4 rounded-xl"
            >
              Generate First Roadmap
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
                  className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="badge badge-purple text-[10px]">
                          {plan.hoursPerDay} hrs/day
                        </span>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                          {plan.title}
                        </h2>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-3">
                        <span>Goal: {plan.goal}</span>
                        {plan.examDate && (
                          <>
                            <span>·</span>
                            <span>Target: {new Date(plan.examDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-gray-300">
                          {completedCount} / {totalCount} completed ({progressPct}%)
                        </div>
                        <div className="w-32 progress-bar mt-1.5 h-1.5">
                          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-gray-500 hover:text-red-400 p-2 rounded-xl transition-colors"
                        title="Delete Plan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Day by Day Mission Nodes */}
                  <div className="space-y-2.5">
                    {plan.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(plan.id, task.id, task.completed)}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                          task.completed
                            ? "bg-emerald-500/5 border-emerald-500/20 text-gray-400"
                            : "bg-white/5 border-white/5 hover:border-white/20 text-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                              task.completed
                                ? "bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20"
                                : "border border-white/20 text-transparent hover:border-white/40"
                            }`}
                          >
                            <Check size={14} />
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#7c6fe0]">
                                Day {task.day}
                              </span>
                              <span
                                className={`text-sm font-semibold ${
                                  task.completed ? "line-through text-gray-500" : "text-white"
                                }`}
                              >
                                {task.title}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-xs text-gray-400 mt-0.5 leading-normal">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="text-xs font-mono text-gray-400 whitespace-nowrap bg-black/30 px-2.5 py-1 rounded-md border border-white/5">
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

        {/* Modal: Launch Roadmap */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel bg-[#0d0e1c] border border-white/15 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Sparkles size={18} className="text-[#00d4aa]" />
                <span>Synthesize Mission Roadmap</span>
              </h3>
              <p className="text-xs text-gray-400 mb-5">
                AI structures your timeline considering cognitive load and spaced recall.
              </p>

              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div>
                  <label className="label">Exam or Learning Goal</label>
                  <input
                    type="text"
                    required
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Operating Systems Final Exam"
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Target Date (Optional)</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Daily Study Hours</label>
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
                  <label className="label">Topics to Cover</label>
                  <textarea
                    rows={4}
                    value={topicsInput}
                    onChange={(e) => setTopicsInput(e.target.value)}
                    placeholder="e.g. Scheduling Algorithms, Deadlocks, Memory Management, File Systems..."
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
                        Generating Roadmap...
                      </>
                    ) : (
                      "Generate Roadmap"
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
