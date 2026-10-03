"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Menu, X, Cpu, Compass } from "lucide-react";
import { useState, useEffect } from "react";
import { NAV_ITEMS } from "@/lib/constants/nav";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    available: boolean;
    model: string;
    provider: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setAiStatus(data))
      .catch(() =>
        setAiStatus({
          available: true,
          model: "gemma2:2b",
          provider: "ollama",
        })
      );
  }, []);

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#080914]/90 border-b border-white/10 backdrop-blur-xl flex items-center justify-between px-5 z-50">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c6fe0] to-[#4f9eff] flex items-center justify-center text-white shadow-md shadow-[#7c6fe0]/30">
            <Brain size={18} />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">StudyMate</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white"
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 md:z-30 w-64 bg-[#080914]/95 md:bg-[#080914]/80 border-r border-white/10 backdrop-blur-2xl flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <div className="pb-6 border-b border-white/5 mb-6 px-2 pt-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c6fe0] to-[#4f9eff] flex items-center justify-center text-white shadow-lg shadow-[#7c6fe0]/30 group-hover:scale-105 transition-transform">
                <Brain size={20} />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">
                  StudyMate
                </span>
                <span className="text-[10px] text-[#9d93f7] tracking-wider uppercase font-semibold">
                  3D AI Study Partner
                </span>
              </div>
            </Link>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#7c6fe0]/18 text-white border border-[#7c6fe0]/35 shadow-lg shadow-[#7c6fe0]/15"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon
                    size={17}
                    className={isActive ? "text-[#9d93f7]" : "text-gray-400"}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 pt-4 border-t border-white/5">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 shadow-inner">
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5 text-gray-300 font-semibold">
                <Cpu size={14} className="text-[#00d4aa]" />
                <span className="text-[11px]">Open AI Core</span>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus?.available ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
                title={aiStatus?.available ? "Online" : "Connecting"}
              />
            </div>
            <div className="text-[11px] text-gray-200 font-mono truncate">
              {aiStatus?.model || "gemma2:2b"}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              {aiStatus?.available ? "Local Inference · Private" : "Connecting to Ollama..."}
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-2 px-3 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <Compass size={14} className="text-[#7c6fe0]" />
            <span>Study Universe Landing</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
