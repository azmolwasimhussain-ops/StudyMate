"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  HelpCircle,
  Calendar,
  Sparkles,
  BarChart3,
  Settings,
  Menu,
  X,
  Cpu,
  BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Materials", href: "/materials", icon: FolderOpen },
  { name: "Ask StudyMate", href: "/chat", icon: MessageSquare },
  { name: "Quiz Generator", href: "/quiz", icon: HelpCircle },
  { name: "Study Planner", href: "/planner", icon: Calendar },
  { name: "Revision Mode", href: "/revision", icon: Sparkles },
  { name: "Progress", href: "/progress", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

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
          available: false,
          model: "gemma2:2b",
          provider: "ollama",
        })
      );
  }, []);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#111118] border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between px-4 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ background: "var(--gradient-1)" }}
          >
            <Brain size={18} />
          </div>
          <span className="font-bold text-base tracking-tight text-white">StudyMate</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] text-gray-300 hover:text-white"
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`sidebar fixed top-0 bottom-0 left-0 z-50 md:z-30 w-64 bg-[#111118] border-r border-[rgba(255,255,255,0.08)] flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between pb-6 border-b border-[rgba(255,255,255,0.08)] mb-6 px-2">
            <Link href="/" className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ background: "var(--gradient-1)" }}
              >
                <Brain size={20} />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">
                  StudyMate
                </span>
                <span className="text-[10px] text-gray-400 tracking-wider uppercase font-semibold">
                  AI Study Partner
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[rgba(124,111,224,0.18)] text-[#9d93f7] font-semibold border border-[rgba(124,111,224,0.3)]"
                      : "text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-[#9d93f7]" : "text-gray-400"}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom AI Status & User */}
        <div className="space-y-3 pt-4 border-t border-[rgba(255,255,255,0.08)]">
          {/* AI Model Badge */}
          <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 text-gray-300 font-medium">
                <Cpu size={14} className="text-[#7c6fe0]" />
                <span>Open Model</span>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus?.available ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
            </div>
            <div className="text-[11px] text-gray-400 font-mono truncate">
              {aiStatus?.model || "gemma2:2b"}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              {aiStatus?.available ? "Online · Local Inference" : "Connecting to Ollama..."}
            </div>
          </div>

          {/* Quick Landing Link */}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-2 px-3 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            <BookOpen size={14} />
            <span>Landing Page</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
