import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  HelpCircle,
  Calendar,
  Sparkles,
  BarChart3,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  { name: "Command Center", href: "/dashboard", icon: LayoutDashboard },
  { name: "Document Library", href: "/materials", icon: FolderOpen },
  { name: "Ask StudyMate", href: "/chat", icon: MessageSquare },
  { name: "Quiz Arena", href: "/quiz", icon: HelpCircle },
  { name: "Mission Planner", href: "/planner", icon: Calendar },
  { name: "Revision Deck", href: "/revision", icon: Sparkles },
  { name: "Neural Progress", href: "/progress", icon: BarChart3 },
  { name: "System Settings", href: "/settings", icon: Settings },
] as const;
