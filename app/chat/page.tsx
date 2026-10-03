"use client";

import { useState, useEffect, useRef, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import {
  Send,
  Brain,
  Sparkles,
  BookOpen,
  Layers,
  ChevronDown,
  Info,
  Check,
  AlertCircle,
  Clock,
  RotateCcw,
  Cpu,
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
        "👋 Hello! I am your StudyMate partner. Select a study document above and ask me anything about it. I can explain concepts in Simple language, give Detailed deep-dives, or structure Exam-Ready answers!",
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
      })
      .catch((err) => console.error("Error loading materials", err));
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

      if (!res.ok) {
        throw new Error(data.error || "Failed to get AI response.");
      }

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

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
      setAiError(err.message || "AI inference error.");
    } finally {
      setLoading(false);
    }
  };

  const selectedMaterialTitle =
    materials.find((m) => m.id === selectedMaterialId)?.title || "No material selected";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 flex flex-col h-screen max-w-7xl mx-auto w-full pt-16 md:pt-0">
        {/* Chat Top Controls */}
        <header className="p-4 border-b border-[rgba(255,255,255,0.08)] bg-[#111118]/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[rgba(124,111,224,0.15)] flex items-center justify-center text-[#9d93f7]">
              <Brain size={20} />
            </div>
            <div>
              <h1 className="font-bold text-sm md:text-base text-white">
                Ask StudyMate
              </h1>
              <p className="text-[11px] text-gray-400">
                Grounding answers in your uploaded study chunks
              </p>
            </div>
          </div>

          {/* Controls: Material Selector & Mode Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Material Selector */}
            <div className="relative">
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="bg-[#1a1a24] border border-[rgba(255,255,255,0.1)] rounded-xl py-1.5 pl-3 pr-8 text-xs text-gray-200 outline-none focus:border-[#7c6fe0] appearance-none cursor-pointer"
              >
                <option value="">All / No specific material</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* Mode Selector */}
            <div className="flex bg-[#1a1a24] p-1 rounded-xl border border-[rgba(255,255,255,0.08)]">
              {(
                [
                  { id: "simple", label: "Simple", desc: "Easy explanation" },
                  { id: "detailed", label: "Detailed", desc: "Conceptual deep dive" },
                  { id: "exam_ready", label: "Exam Ready", desc: "Structured exam points" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  title={m.desc}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    mode === m.id
                      ? "bg-[#7c6fe0] text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Active Context Banner */}
          {selectedMaterialId && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(124,111,224,0.08)] border border-[rgba(124,111,224,0.2)] text-xs text-[#9d93f7] max-w-xl mx-auto">
              <BookOpen size={14} className="flex-shrink-0" />
              <span className="truncate">
                Grounding with material: <strong>{selectedMaterialTitle}</strong>
              </span>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.role === "user"
                    ? "bg-[#4f9eff] text-white"
                    : "bg-[#7c6fe0] text-white shadow-md shadow-[#7c6fe0]/20"
                }`}
              >
                {msg.role === "user" ? "You" : <Brain size={16} />}
              </div>

              {/* Message Body */}
              <div className="space-y-2 max-w-[85%]">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#1f1f2e] text-white border border-[rgba(255,255,255,0.1)] rounded-tr-sm"
                      : "bg-[#111118] text-gray-200 border border-[rgba(255,255,255,0.08)] rounded-tl-sm shadow-sm"
                  }`}
                >
                  {/* Mode tag for assistant */}
                  {msg.role === "assistant" && msg.mode && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[rgba(255,255,255,0.06)]">
                      <span className="badge badge-purple text-[9px] uppercase font-bold tracking-wider">
                        {msg.mode.replace("_", " ")}
                      </span>
                      {msg.model && (
                        <span className="text-[10px] text-gray-500 font-mono">
                          {msg.model}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Prose Content */}
                  <div className="prose-studymate whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>

                {/* Source Chunks Accordion */}
                {msg.sources && msg.sources.length > 0 && (
                  <details className="text-xs bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl p-2.5 cursor-pointer">
                    <summary className="text-gray-400 font-semibold flex items-center gap-1.5 hover:text-gray-200 select-none">
                      <Layers size={13} className="text-[#7c6fe0]" />
                      <span>{msg.sources.length} Retrieved Source Chunks</span>
                    </summary>
                    <div className="mt-2 space-y-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                      {msg.sources.map((chunk, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-[rgba(0,0,0,0.3)] text-gray-400 text-[11px] font-mono leading-relaxed"
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
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-[#7c6fe0] flex items-center justify-center flex-shrink-0 text-white animate-pulse">
                <Brain size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)] flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">
                  StudyMate is thinking with open-weight model
                </span>
                <span className="flex gap-1 ml-1">
                  <span className="thinking-dot" />
                  <span className="thinking-dot" />
                  <span className="thinking-dot" />
                </span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {aiError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 max-w-2xl mx-auto">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[#111118]/90">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 max-w-3xl mx-auto"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask anything about ${selectedMaterialTitle}...`}
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

          {/* Sample Prompts */}
          <div className="flex items-center justify-center gap-2 mt-2.5 text-[11px] text-gray-500 overflow-x-auto whitespace-nowrap py-1">
            <span>Try:</span>
            {[
              "Explain the core concept in simple words",
              "What are the 3 most common exam questions?",
              "Summarize the key formulas/definitions",
            ].map((promptText) => (
              <button
                key={promptText}
                type="button"
                onClick={() => setInput(promptText)}
                className="px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-gray-400 hover:text-gray-200 transition-colors"
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">Loading StudyMate Chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
