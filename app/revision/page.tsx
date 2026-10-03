"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import {
  Sparkles,
  BookOpen,
  Layers,
  RotateCw,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
} from "lucide-react";

interface Material {
  id: string;
  title: string;
}

interface RevisionData {
  summary: string;
  keyConcepts: Array<{
    concept: string;
    definition: string;
    example: string;
  }>;
  flashcards: Array<{ front: string; back: string }>;
  commonMistakes: string[];
  examTips: string[];
  quickRevision: string;
}

function RevisionContent() {
  const searchParams = useSearchParams();
  const initialMaterialId = searchParams.get("materialId") || "";

  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(initialMaterialId);
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState<RevisionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Flashcard carousel state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Active tab in revision view
  const [activeTab, setActiveTab] = useState<"flashcards" | "concepts" | "mistakes" | "summary">("flashcards");

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

  const handleGenerateRevision = async () => {
    if (!selectedMaterialId) return;

    setLoading(true);
    setError(null);
    setRevision(null);
    setIsFlipped(false);
    setCurrentCardIndex(0);

    try {
      const res = await fetch("/api/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: selectedMaterialId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate revision material.");

      setRevision(data.revision);
    } catch (err: any) {
      setError(err.message || "Failed to generate revision notes.");
    } finally {
      setLoading(false);
    }
  };

  const currentFlashcard = revision?.flashcards?.[currentCardIndex];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              Revision Mode
            </h1>
            <p className="text-sm text-gray-400">
              Interactive flashcards, key concepts, and common pitfalls for fast pre-exam review.
            </p>
          </div>

          {/* Material Select & Action */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className="bg-[#1a1a24] border border-[rgba(255,255,255,0.1)] rounded-xl py-2 px-3 text-xs text-gray-200 outline-none focus:border-[#7c6fe0] cursor-pointer"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateRevision}
              disabled={loading || !selectedMaterialId}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Generate Revision</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card p-12 text-center rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
            <Loader2 size={36} className="text-amber-400 animate-spin mx-auto mb-4" />
            <h3 className="font-bold text-lg text-white mb-1">
              Extracting High-Yield Revision Points...
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Scanning your material for definitions, tricky exam traps, and flashcard pairs with open-weight AI.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !revision && (
          <div className="card p-12 text-center rounded-2xl bg-[#111118] border border-dashed border-[rgba(255,255,255,0.08)]">
            <Sparkles size={40} className="mx-auto text-amber-400 mb-3" />
            <h3 className="font-semibold text-gray-200 mb-1">
              Ready for Rapid Revision
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
              Select your study material above and click &quot;Generate Revision&quot; to synthesize interactive flashcards and concept summaries.
            </p>
          </div>
        )}

        {/* Revision Content */}
        {revision && !loading && (
          <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="flex bg-[#111118] p-1.5 rounded-2xl border border-[rgba(255,255,255,0.08)] max-w-md mx-auto">
              {[
                { id: "flashcards", label: "Flashcards", count: revision.flashcards.length },
                { id: "concepts", label: "Key Concepts", count: revision.keyConcepts.length },
                { id: "mistakes", label: "Common Pitfalls", count: revision.commonMistakes.length },
                { id: "summary", label: "Quick Summary" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === tab.id
                      ? "bg-[rgba(124,111,224,0.2)] text-[#9d93f7] border border-[rgba(124,111,224,0.3)]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: Flashcards Carousel */}
            {activeTab === "flashcards" && (
              <div className="max-w-xl mx-auto space-y-4">
                {revision.flashcards && revision.flashcards.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between text-xs text-gray-400 px-2">
                      <span>
                        Card {currentCardIndex + 1} of {revision.flashcards.length}
                      </span>
                      <span>Click card to flip</span>
                    </div>

                    {/* Flippable Card */}
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="cursor-pointer min-h-[260px] p-8 rounded-3xl bg-[#111118] border border-[rgba(255,255,255,0.12)] hover:border-[#7c6fe0] flex flex-col justify-between items-center text-center transition-all duration-300 shadow-xl"
                    >
                      <span className="badge badge-purple text-[10px] uppercase font-bold tracking-wider">
                        {isFlipped ? "Answer / Back" : "Question / Front"}
                      </span>

                      <div className="my-auto">
                        <p className="text-lg md:text-xl font-bold text-gray-100 leading-snug">
                          {isFlipped
                            ? currentFlashcard?.back
                            : currentFlashcard?.front}
                        </p>
                      </div>

                      <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <RotateCw size={12} />
                        <span>Click to flip card</span>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        disabled={currentCardIndex === 0}
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentCardIndex((prev) => prev - 1);
                        }}
                        className="btn-secondary text-xs px-4"
                      >
                        <ChevronLeft size={16} /> Previous
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="btn-ghost text-xs"
                      >
                        Flip Card
                      </button>

                      <button
                        type="button"
                        disabled={
                          currentCardIndex === revision.flashcards.length - 1
                        }
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentCardIndex((prev) => prev + 1);
                        }}
                        className="btn-primary text-xs px-4"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-xs text-gray-400">
                    No flashcards generated.
                  </p>
                )}
              </div>
            )}

            {/* TAB 2: Key Concepts */}
            {activeTab === "concepts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {revision.keyConcepts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)] space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[rgba(124,111,224,0.15)] flex items-center justify-center text-xs font-bold text-[#9d93f7]">
                        {idx + 1}
                      </span>
                      <h3 className="font-bold text-sm text-white">
                        {item.concept}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {item.definition}
                    </p>
                    {item.example && (
                      <div className="text-[11px] text-gray-400 p-2.5 rounded-xl bg-black/20 border border-white/5">
                        <strong className="text-emerald-400">Example:</strong>{" "}
                        {item.example}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: Common Pitfalls */}
            {activeTab === "mistakes" && (
              <div className="space-y-4 max-w-3xl mx-auto">
                <div className="card p-6 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
                  <h3 className="font-bold text-base text-white mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-400" />
                    <span>Common Mistakes to Avoid</span>
                  </h3>
                  <div className="space-y-2.5">
                    {revision.commonMistakes.map((mistake, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-xs text-red-200 leading-relaxed flex items-start gap-2.5"
                      >
                        <span className="text-red-400 font-bold">•</span>
                        <span>{mistake}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-6 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
                  <h3 className="font-bold text-base text-white mb-3 flex items-center gap-2">
                    <Lightbulb size={18} className="text-amber-400" />
                    <span>High-Yield Exam Tips</span>
                  </h3>
                  <div className="space-y-2.5">
                    {revision.examTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-200 leading-relaxed flex items-start gap-2.5"
                      >
                        <span className="text-amber-400 font-bold">✓</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Quick Summary */}
            {activeTab === "summary" && (
              <div className="card p-6 md:p-8 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)] max-w-3xl mx-auto space-y-4">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-[#00d4aa]" />
                  <h3 className="font-bold text-base text-white">
                    Executive Topic Summary
                  </h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {revision.summary}
                </p>

                {revision.quickRevision && (
                  <div className="pt-4 border-t border-[rgba(255,255,255,0.08)]">
                    <h4 className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Key Takeaway Bullet Points
                    </h4>
                    <div className="prose-studymate whitespace-pre-wrap text-xs text-gray-300">
                      {revision.quickRevision}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function RevisionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">Loading Revision Mode...</div>}>
      <RevisionContent />
    </Suspense>
  );
}
