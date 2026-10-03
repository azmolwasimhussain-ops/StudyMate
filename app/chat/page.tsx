"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import {
  Send,
  Brain,
  Sparkles,
  BookOpen,
  Layers,
  ChevronDown,
  AlertCircle,
  FileText,
  Compass,
  Cpu,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  mode?: string;
  model?: string;
}

interface Material {
  id: string;
  title: string;
  chunkCount?: number;
  fileName?: string;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const initialMaterialId = searchParams.get("materialId") || "";

  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(initialMaterialId);
  const [mode, setMode] = useState<"simple" | "detailed" | "exam_ready">("detailed");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "👋 Welcome to your interactive study partner session. Select any course notes on the left. I ground all explanations in your course chunks and adapt to Simple, Detailed, or Exam-Ready structures.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput("");
    setAiError(null);

    const tempUserMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userQuery,
      mode,
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userQuery,
          materialId: selectedMaterialId || undefined,
          mode,
          sessionId: sessionId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process message.");

      if (data.sessionId && !sessionId) setSessionId(data.sessionId);

      const assistantMsg: Message = {
        id: data.messageId || `ai-${Date.now()}`,
        role: "assistant",
        content: data.content,
        sources: data.sources,
        mode: data.mode,
        model: data.model,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setAiError(err.message || "Inference error.");
    } finally {
      setLoading(false);
    }
  };

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);
  const lastAiMessage = [...messages].reverse().find((m) => m.role === "assistant" && m.id !== "intro");

  return (
    <div className="min-h-screen bg-[#06060c] text-white flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 flex flex-col h-screen max-w-7xl mx-auto w-full pt-16 md:pt-0">
        {/* Session Top Bar */}
        <header className="p-4 border-b border-white/5 bg-[#0a0b16]/80 backdrop-blur-xl flex items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#7c6fe0]/20 flex items-center justify-center text-[#9d93f7]">
              <Brain size={18} />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white">Ask StudyMate</h1>
              <p className="text-[11px] text-gray-400">Grounded in local document chunks</p>
            </div>
          </div>

          {/* Spatial Mode Selector */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {(
              [
                { id: "simple", label: "Simple" },
                { id: "detailed", label: "Detailed" },
                { id: "exam_ready", label: "Exam Ready" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
                  mode === m.id
                    ? "bg-[#7c6fe0] text-white shadow-md shadow-[#7c6fe0]/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </header>

        {/* 3-Column Spatial Study Arena */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Material & Knowledge Context (Desktop) */}
          <aside className="w-64 border-r border-white/5 p-4 hidden lg:flex flex-col justify-between overflow-y-auto bg-[#080914]/40">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
                <BookOpen size={14} className="text-[#7c6fe0]" />
                <span>Active Context</span>
              </div>

              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="input text-xs mb-4 cursor-pointer"
              >
                <option value="">General (No material)</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#0b0c16]">
                    {m.title}
                  </option>
                ))}
              </select>

              {selectedMaterial ? (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
                  <div className="font-bold text-white line-clamp-2">{selectedMaterial.title}</div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                    <Layers size={12} className="text-[#00d4aa]" />
                    <span>{selectedMaterial.chunkCount || "Ready"} indexed chunks</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    ✓ RAG Context Active
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Select a document to anchor explanations directly in course content.
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-gray-400">
              <span className="font-bold text-white block mb-0.5">Privacy First</span>
              Inference runs on your machine via local Ollama.
            </div>
          </aside>

          {/* Center Column: Conversation Feed */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-2xl ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      msg.role === "user"
                        ? "bg-[#4f9eff] text-white shadow-md shadow-[#4f9eff]/20"
                        : "bg-gradient-to-br from-[#7c6fe0] to-[#4f9eff] text-white shadow-md shadow-[#7c6fe0]/20"
                    }`}
                  >
                    {msg.role === "user" ? "You" : <Brain size={16} />}
                  </div>

                  <div className="space-y-2 max-w-[88%]">
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#181a2e] text-white border border-white/10 rounded-tr-sm"
                          : "glass-panel text-gray-200 border border-white/10 rounded-tl-sm shadow-xl"
                      }`}
                    >
                      {msg.role === "assistant" && msg.mode && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                          <span className="badge badge-purple text-[9px]">
                            {msg.mode.replace("_", " ")}
                          </span>
                          {msg.model && (
                            <span className="text-[10px] text-gray-400 font-mono">
                              {msg.model}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="prose-studymate whitespace-pre-wrap">{msg.content}</div>
                    </div>

                    {/* Expandable Source Chunks */}
                    {msg.sources && msg.sources.length > 0 && (
                      <details className="text-xs glass-panel p-2.5 rounded-xl cursor-pointer">
                        <summary className="text-gray-400 font-semibold flex items-center gap-1.5 hover:text-white select-none">
                          <Layers size={13} className="text-[#00d4aa]" />
                          <span>{msg.sources.length} Grounded Source Chunks</span>
                        </summary>
                        <div className="mt-2 space-y-2 pt-2 border-t border-white/5">
                          {msg.sources.map((chunk, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-black/40 text-gray-400 text-[11px] font-mono leading-relaxed"
                            >
                              {chunk}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))}

              {/* AI Thinking Animation */}
              {loading && (
                <div className="flex gap-3 max-w-md mr-auto">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c6fe0] to-[#4f9eff] flex items-center justify-center flex-shrink-0 text-white animate-pulse">
                    <Brain size={16} />
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-2">
                    <span className="text-xs text-gray-300 font-medium">
                      StudyMate is synthesizing response with open model
                    </span>
                    <span className="flex gap-1 ml-1">
                      <span className="thinking-dot" />
                      <span className="thinking-dot" />
                      <span className="thinking-dot" />
                    </span>
                  </div>
                </div>
              )}

              {aiError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 max-w-xl mx-auto">
                  <AlertCircle size={15} />
                  <span>{aiError}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-white/5 bg-[#080914]/80 backdrop-blur-md">
              <form onSubmit={handleSend} className="flex items-center gap-2 max-w-3xl mx-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    selectedMaterial
                      ? `Ask questions about ${selectedMaterial.title}...`
                      : "Ask any academic or conceptual question..."
                  }
                  disabled={loading}
                  className="input text-sm py-3 px-4 rounded-xl"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="btn-primary py-3 px-5 rounded-xl"
                  aria-label="Send query"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Study Insights Telemetry (Desktop) */}
          <aside className="w-72 border-l border-white/5 p-5 hidden xl:flex flex-col justify-between overflow-y-auto bg-[#080914]/30">
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Session Telemetry
                </span>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Cognitive Mode:</span>
                    <strong className="text-white capitalize">{mode.replace("_", " ")}</strong>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Source Grounding:</span>
                    <strong className="text-[#00d4aa]">
                      {selectedMaterial ? "Active" : "None"}
                    </strong>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Open Model:</span>
                    <strong className="text-[#9d93f7] font-mono">gemma2:2b</strong>
                  </div>
                </div>
              </div>

              {/* Latest Answer Source Stats */}
              {lastAiMessage && lastAiMessage.sources && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Retrieved Knowledge
                  </span>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300">
                    <div className="text-[11px] text-[#00d4aa] font-semibold mb-1">
                      {lastAiMessage.sources.length} Chunks Used
                    </div>
                    <p className="text-[11px] text-gray-400 leading-normal line-clamp-4">
                      {lastAiMessage.sources[0]}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#7c6fe0]/10 border border-[#7c6fe0]/20 text-[11px] text-[#9d93f7]">
              Tip: Switch to <strong>Exam Ready</strong> to format definitions into scored exam points.
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#06060c] text-white flex items-center justify-center">Loading Study Session...</div>}>
      <ChatContent />
    </Suspense>
  );
}
