"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  AlertTriangle,
  Loader2,
  ChevronRight,
  BookOpen,
} from "lucide-react";

interface Material {
  id: string;
  title: string;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

interface QuizResult {
  score: number;
  correctCount: number;
  total: number;
  weakTopics: string[];
}

function QuizContent() {
  const searchParams = useSearchParams();
  const initialMaterialId = searchParams.get("materialId") || "";

  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(initialMaterialId);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const [generating, setGenerating] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<{ id: string; questions: Question[] } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/materials")
      .then((res) => res.json())
      .then((data) => {
        setMaterials(data.materials || []);
        if (!selectedMaterialId && data.materials?.length > 0) {
          setSelectedMaterialId(data.materials[0].id);
        }
      });
  }, [selectedMaterialId]);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialId) return;

    setGenerating(true);
    setError(null);
    setCurrentQuiz(null);
    setQuizResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: selectedMaterialId,
          numQuestions,
          difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz.");

      setCurrentQuiz({
        id: data.quizId,
        questions: data.quiz.questions,
      });
    } catch (err: any) {
      setError(err.message || "Failed to generate quiz with open AI model.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (quizResult) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;
    setSubmitting(true);
    setError(null);

    const answersPayload = currentQuiz.questions.map((q) => ({
      questionId: q.id,
      selectedOption: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
    }));

    try {
      const res = await fetch("/api/quiz/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: currentQuiz.id,
          answers: answersPayload,
          timeTaken: 180,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit attempt.");

      setQuizResult({
        score: data.score,
        correctCount: data.correctCount,
        total: data.total,
        weakTopics: data.weakTopics || [],
      });
    } catch (err: any) {
      setError(err.message || "Failed to calculate results.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeQuestion = currentQuiz?.questions[currentQuestionIndex];
  const allAnswered =
    currentQuiz &&
    currentQuiz.questions.every((q) => selectedAnswers[q.id] !== undefined);

  return (
    <div className="min-h-screen bg-[#06060c] text-white flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen max-w-4xl mx-auto w-full space-y-8">
        <div className="pb-6 border-b border-white/5">
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Quiz Arena
          </h1>
          <p className="text-sm text-gray-400">
            Active recall environment synthesized directly from your course knowledge chunks.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Configuration Setup Form */}
        {!currentQuiz && !generating && (
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <Sparkles size={18} className="text-[#4f9eff]" />
              <span>Configure Quiz Arena</span>
            </h2>

            <form onSubmit={handleGenerateQuiz} className="space-y-6">
              <div>
                <label className="label">Source Study Material</label>
                {materials.length === 0 ? (
                  <p className="text-xs text-amber-400">
                    No documents uploaded. Please upload a PDF or note in Document Library first.
                  </p>
                ) : (
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                    className="input cursor-pointer"
                  >
                    {materials.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#0c0d1c]">
                        {m.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="label">Number of Questions</label>
                <div className="grid grid-cols-3 gap-3">
                  {[5, 10, 15].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNumQuestions(num)}
                      className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        numQuestions === num
                          ? "bg-[#4f9eff]/20 text-[#4f9eff] border-[#4f9eff]"
                          : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
                      }`}
                    >
                      {num} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Difficulty Tier</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "easy", label: "Easy", desc: "Foundational Recall" },
                    { id: "medium", label: "Medium", desc: "Application & Theory" },
                    { id: "hard", label: "Hard", desc: "Analytical Synthesis" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id as any)}
                      className={`py-3 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                        difficulty === d.id
                          ? "bg-[#7c6fe0]/20 text-[#9d93f7] border-[#7c6fe0]"
                          : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
                      }`}
                    >
                      <div>{d.label}</div>
                      <div className="text-[10px] font-normal text-gray-500 mt-0.5">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={materials.length === 0}
                className="btn-primary w-full py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 mt-4"
              >
                <HelpCircle size={16} />
                <span>Enter Arena & Generate Questions</span>
              </button>
            </form>
          </div>
        )}

        {/* Loading Spinner during Generation */}
        {generating && (
          <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center shadow-2xl">
            <Loader2 size={38} className="text-[#4f9eff] animate-spin mx-auto mb-4" />
            <h3 className="font-bold text-lg text-white mb-1">Synthesizing Questions...</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Scanning knowledge chunks with open-weight Gemma model to craft questions and distractors.
            </p>
          </div>
        )}

        {/* Active Quiz Question Runner */}
        {currentQuiz && activeQuestion && !quizResult && (
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase">
                Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
              </span>
              <span className="badge badge-purple text-[10px]">
                {activeQuestion.topic || difficulty}
              </span>
            </div>

            <div className="progress-bar mb-6">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100
                  }%`,
                }}
              />
            </div>

            <h2 className="text-lg md:text-xl font-bold text-white mb-6 leading-snug">
              {activeQuestion.question}
            </h2>

            <div className="space-y-3 mb-8">
              {activeQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswers[activeQuestion.id] === idx;
                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(activeQuestion.id, idx)}
                    className={`w-full text-left p-4 rounded-xl border flex items-center gap-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#7c6fe0]/20 border-[#7c6fe0] text-white shadow-lg shadow-[#7c6fe0]/15"
                        : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? "bg-[#7c6fe0] text-white"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm">{opt}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="btn-secondary text-xs"
              >
                Previous
              </button>

              <div className="flex gap-2">
                {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="btn-primary text-xs flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting || !allAnswered}
                    onClick={handleSubmitQuiz}
                    className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-500"
                  >
                    {submitting ? "Grading..." : "Submit Answers"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results & Diagnostics Screen */}
        {quizResult && currentQuiz && (
          <div className="space-y-6">
            <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-[#7c6fe0]/20 flex items-center justify-center text-[#9d93f7] mx-auto mb-4">
                <Award size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Quiz Diagnostics Ready</h2>
              <p className="text-sm text-gray-400 mb-6">
                Detailed active recall performance breakdown.
              </p>

              <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
                <div className="text-4xl font-extrabold text-white">
                  {quizResult.score}%
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {quizResult.correctCount} of {quizResult.total} questions correct
                </div>
              </div>

              {quizResult.weakTopics.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left mb-6 max-w-md mx-auto">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1.5 uppercase">
                    <AlertTriangle size={14} />
                    <span>Identified Gaps to Revise:</span>
                  </div>
                  <ul className="text-xs text-gray-300 space-y-1 pl-4 list-disc">
                    {quizResult.weakTopics.map((topic, i) => (
                      <li key={i}>{topic}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setCurrentQuiz(null);
                  setQuizResult(null);
                }}
                className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 mx-auto"
              >
                <RotateCcw size={14} />
                <span>Configure Another Arena</span>
              </button>
            </div>

            {/* Questions Breakdown */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10">
              <h3 className="font-bold text-base text-white mb-4">
                Answer Analysis & Explanations
              </h3>

              <div className="space-y-4">
                {currentQuiz.questions.map((q, idx) => {
                  const userAns = selectedAnswers[q.id];
                  const isCorrect = userAns === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-white">
                          {idx + 1}. {q.question}
                        </span>
                        {isCorrect ? (
                          <span className="badge badge-success text-[10px]">
                            <CheckCircle2 size={11} /> Correct
                          </span>
                        ) : (
                          <span className="badge badge-error text-[10px] bg-red-500/15 text-red-400 border border-red-500/30">
                            <XCircle size={11} /> Incorrect
                          </span>
                        )}
                      </div>

                      <div className="text-gray-400 pt-1 space-y-0.5">
                        <div>
                          Your answer:{" "}
                          <span className={isCorrect ? "text-emerald-400" : "text-red-400 font-semibold"}>
                            {userAns !== undefined ? q.options[userAns] : "No answer"}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div>
                            Correct answer:{" "}
                            <span className="text-emerald-400 font-semibold">
                              {q.options[q.correctAnswer]}
                            </span>
                          </div>
                        )}
                      </div>

                      {q.explanation && (
                        <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-gray-300 mt-2">
                          <strong className="text-[#9d93f7]">Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#06060c] text-white flex items-center justify-center">Loading Quiz Arena...</div>}>
      <QuizContent />
    </Suspense>
  );
}
