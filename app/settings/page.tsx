"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import {
  Settings,
  Cpu,
  Database,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      console.error("Health check error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleTestInference = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "Give a 1-sentence study tip for mastering computer science exams.",
          mode: "simple",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Inference failed");
      setTestResult(data.content);
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            System & AI Settings
          </h1>
          <p className="text-sm text-gray-400">
            Inspect your open-weight AI provider, local Ollama inference server, and PostgreSQL database.
          </p>
        </div>

        <div className="space-y-6">
          {/* Status Overview Card */}
          <div className="card p-6 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.08)] mb-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu size={18} className="text-[#7c6fe0]" />
                <span>Active Infrastructure</span>
              </h2>
              <button
                onClick={checkHealth}
                disabled={loading}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                <span>Refresh Status</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* AI Provider Status */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 uppercase font-semibold">
                    AI Inference Layer
                  </span>
                  {health?.available ? (
                    <span className="badge badge-success text-[10px] flex items-center gap-1">
                      <CheckCircle2 size={11} /> Online
                    </span>
                  ) : (
                    <span className="badge badge-warning text-[10px] flex items-center gap-1">
                      <XCircle size={11} /> Offline
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-white mb-1">
                  Provider: {health?.provider || "ollama"}
                </div>
                <div className="text-xs font-mono text-[#9d93f7]">
                  Model: {health?.model || "gemma2:2b"}
                </div>
                <div className="text-[11px] text-gray-500 mt-2">
                  Open-weight model running locally via Ollama.
                </div>
              </div>

              {/* Database Status */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 uppercase font-semibold">
                    Relational Database
                  </span>
                  {health?.database === "connected" ? (
                    <span className="badge badge-success text-[10px] flex items-center gap-1">
                      <CheckCircle2 size={11} /> Connected
                    </span>
                  ) : (
                    <span className="badge badge-error text-[10px] flex items-center gap-1">
                      <XCircle size={11} /> Disconnected
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-white mb-1">
                  PostgreSQL 16
                </div>
                <div className="text-xs font-mono text-emerald-400">
                  Prisma ORM · studymate
                </div>
                <div className="text-[11px] text-gray-500 mt-2">
                  Persists materials, chunks, quizzes, and study progress.
                </div>
              </div>
            </div>
          </div>

          {/* Test AI Inference Card */}
          <div className="card p-6 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-[#00d4aa]" />
              <span>Test Model Response</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Trigger a live end-to-end inference request to verify the open-weight model integration.
            </p>

            <button
              onClick={handleTestInference}
              disabled={testing}
              className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-2 mb-4"
            >
              {testing ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Running Inference...
                </>
              ) : (
                "Run Test Query"
              )}
            </button>

            {testResult && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-gray-200 whitespace-pre-wrap leading-relaxed">
                {testResult}
              </div>
            )}
          </div>

          {/* Configuration Instructions */}
          <div className="card p-6 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)]">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Terminal size={18} className="text-amber-400" />
              <span>How to Change Models</span>
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              StudyMate works with any open-weight model supported by Ollama. To switch to a different model:
            </p>

            <div className="space-y-2 text-xs font-mono bg-black/40 p-4 rounded-xl border border-white/5 text-gray-300">
              <p className="text-gray-500"># 1. Pull your desired open model</p>
              <p className="text-emerald-400">ollama pull gemma2:2b</p>
              <p className="text-emerald-400">ollama pull qwen3.5:4b</p>
              <p className="text-emerald-400">ollama pull llama3:latest</p>
              <br />
              <p className="text-gray-500"># 2. Update .env</p>
              <p className="text-amber-300">AI_MODEL=gemma2:2b</p>
              <p className="text-amber-300">OLLAMA_BASE_URL=http://localhost:11434</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
